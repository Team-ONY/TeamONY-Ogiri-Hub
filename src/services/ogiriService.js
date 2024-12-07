import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

//

// 大喜利イベントの作成
export const createOgiriEvent = async (threadId, eventData, userId) => {
  try {
    const threadRef = doc(db, 'threads', threadId);
    const ogiriEventsRef = collection(threadRef, 'ogiriEvents');

    const event = {
      createdBy: userId,
      ...eventData,
      participants: [userId],
    };

    const docRef = await addDoc(ogiriEventsRef, event);
    return { id: docRef.id, ...event };
  } catch (error) {
    console.error('Error creating ogiri event:', error);
    throw error;
  }
};

// スレッド内の大喜利イベントを取得
export const getOgiriEvents = async (threadId) => {
  try {
    const threadRef = doc(db, 'threads', threadId);
    const ogiriEventsRef = collection(threadRef, 'ogiriEvents');
    const q = query(ogiriEventsRef, where('status', '==', 'active'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting ogiri events:', error);
    throw error;
  }
};

// 大喜利イベントの参加者を追加
export const joinOgiriEvent = async (threadId, eventId, userId) => {
  try {
    const eventRef = doc(db, 'threads', threadId, 'ogiriEvents', eventId);
    await updateDoc(eventRef, {
      participants: arrayUnion(userId),
    });
  } catch (error) {
    console.error('Error joining ogiri event:', error);
    throw error;
  }
};

// 大喜利イベントから参加者を削除
export const leaveOgiriEvent = async (threadId, eventId, userId) => {
  try {
    const eventRef = doc(db, 'threads', threadId, 'ogiriEvents', eventId);
    await updateDoc(eventRef, {
      participants: arrayRemove(userId),
    });
  } catch (error) {
    console.error('Error leaving ogiri event:', error);
    throw error;
  }
};

// イベントのステータスを更新
export const updateEventStatus = async (threadId, eventId, status) => {
  try {
    const eventRef = doc(db, 'threads', threadId, 'ogiriEvents', eventId);
    await updateDoc(eventRef, {
      status: status,
      endedAt: status === 'completed' ? Timestamp.now() : null,
    });
  } catch (error) {
    console.error('Error updating event status:', error);
    throw error;
  }
};

// 参加者の詳細情報を取得
export const getEventParticipantsDetails = async (participantIds) => {
  try {
    const participantsDetails = {};

    // 重複を除去
    const uniqueIds = [...new Set(participantIds)];

    await Promise.all(
      uniqueIds.map(async (userId) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          participantsDetails[userId] = {
            uid: userId,
            username: userDoc.data().username || '名無しさん',
            photoURL: userDoc.data().photoURL || null,
          };
        }
      })
    );

    return participantsDetails;
  } catch (error) {
    console.error('Error fetching participants details:', error);
    throw error;
  }
};

// イベントの参加状態を確認
export const checkEventParticipation = (event, userId) => {
  return event.participants?.includes(userId) || false;
};

// 回答を投稿
export const submitOgiriAnswer = async (
  threadId,
  eventId,
  userId,
  answer,
  maxResponses
) => {
  try {
    const eventRef = doc(db, 'threads', threadId, 'ogiriEvents', eventId);
    const eventDoc = await getDoc(eventRef);
    const eventData = eventDoc.data();

    // イベントの期限切れチェック
    const isExpired = checkEventExpiration({
      createdAt: eventData.createdAt,
      duration: eventData.duration,
      status: eventData.status,
    });

    if (isExpired) {
      throw new Error('イベントの制限時間が終了しています');
    }

    // 回答数チェック
    const currentAnswerCount = await getUserAnswerCount(
      threadId,
      eventId,
      userId
    );
    if (currentAnswerCount >= maxResponses) {
      throw new Error(`回答数が上限（${maxResponses}回）に達しています`);
    }

    const answersRef = collection(eventRef, 'answers');
    const answerData = {
      content: answer,
      createdAt: Timestamp.now(),
      userId: userId,
      likes: 0,
      likedBy: [],
    };

    const docRef = await addDoc(answersRef, answerData);
    return { id: docRef.id, ...answerData };
  } catch (error) {
    console.error('Error submitting answer:', error);
    throw error;
  }
};

// 回答を取得
export const getOgiriAnswers = async (threadId, eventId) => {
  try {
    const answersRef = collection(
      db,
      'threads',
      threadId,
      'ogiriEvents',
      eventId,
      'answers'
    );
    const q = query(answersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error('Error fetching ogiri answers:', error);
    throw error;
  }
};

// いいね機能
export const toggleAnswerLike = async (threadId, eventId, answerId, userId) => {
  try {
    const answerRef = doc(
      db,
      'threads',
      threadId,
      'ogiriEvents',
      eventId,
      'answers',
      answerId
    );
    const answerDoc = await getDoc(answerRef);

    if (!answerDoc.exists()) throw new Error('Answer not found');

    const currentLikedBy = answerDoc.data().likedBy || [];
    const isLiked = currentLikedBy.includes(userId);

    await updateDoc(answerRef, {
      likes: isLiked ? answerDoc.data().likes - 1 : answerDoc.data().likes + 1,
      likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// イベントの期限切れをチェック
export const checkEventExpiration = (event) => {
  if (event.status === 'completed') return true;

  const createdAt = event.createdAt?.toDate?.() || new Date(event.createdAt);
  const endTime = new Date(createdAt.getTime() + event.duration * 60 * 1000);
  return new Date() > endTime;
};

// 残り時間を計算する関数を追加
export const calculateRemainingTime = (event) => {
  const createdAt = event.createdAt?.toDate?.() || new Date(event.createdAt);
  const endTime = new Date(createdAt.getTime() + event.duration * 60 * 1000);
  const now = new Date();

  if (now >= endTime) return '終了';

  const remaining = endTime - now;
  const minutes = Math.floor(remaining / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  if (minutes > 0) {
    return `残り ${minutes}分 ${seconds}秒`;
  }
  return `残り ${seconds}秒`;
};

// ユーザーの回答数を取得
export const getUserAnswerCount = async (threadId, eventId, userId) => {
  try {
    const eventRef = doc(db, 'threads', threadId, 'ogiriEvents', eventId);
    const answersRef = collection(eventRef, 'answers');
    const q = query(answersRef, where('userId', '==', userId));

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting user answer count:', error);
    throw error;
  }
};

// ベストアンサーを設定
export const setBestAnswer = async (threadId, eventId, answerId) => {
  try {
    const eventRef = doc(db, 'threads', threadId, 'ogiriEvents', eventId);
    await updateDoc(eventRef, {
      bestAnswerId: answerId,
      status: 'completed',
      endedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error setting best answer:', error);
    throw error;
  }
};

// ベストアンサーを取得
export const getBestAnswer = async (threadId, eventId) => {
  try {
    const eventRef = doc(db, 'threads', threadId, 'ogiriEvents', eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists() || !eventDoc.data().bestAnswerId) {
      return null;
    }

    const answerId = eventDoc.data().bestAnswerId;
    const answerRef = doc(eventRef, 'answers', answerId);
    const answerDoc = await getDoc(answerRef);

    return answerDoc.exists()
      ? { id: answerDoc.id, ...answerDoc.data() }
      : null;
  } catch (error) {
    console.error('Error getting best answer:', error);
    throw error;
  }
};

// いいねの数に基づいてベスアンサーを自動選定
export const determineAndSetBestAnswer = async (threadId, eventId) => {
  try {
    const eventRef = doc(db, 'threads', threadId, 'ogiriEvents', eventId);
    const answersRef = collection(eventRef, 'answers');
    const snapshot = await getDocs(answersRef);

    let bestAnswer = null;
    let maxLikes = -1;

    snapshot.docs.forEach((doc) => {
      const answer = doc.data();
      if (answer.likes > maxLikes) {
        maxLikes = answer.likes;
        bestAnswer = { id: doc.id, ...answer };
      }
    });

    if (bestAnswer) {
      await updateDoc(eventRef, {
        bestAnswerId: bestAnswer.id,
        status: 'completed',
        endedAt: Timestamp.now(),
      });
      return bestAnswer;
    }
    return null;
  } catch (error) {
    console.error('Error determining best answer:', error);
    throw error;
  }
};

// イベントの期限切れをチェックし、ベストアンサーを選定
export const checkEventExpirationAndSetBestAnswer = async (event) => {
  if (event.status === 'completed') return true;

  const createdAt = event.createdAt?.toDate?.() || new Date(event.createdAt);
  const endTime = new Date(createdAt.getTime() + event.duration * 60 * 1000);
  const isExpired = new Date() > endTime;

  if (isExpired && event.status !== 'completed') {
    await determineAndSetBestAnswer(event.threadId, event.id);
  }

  return isExpired;
};

// リアルタイムリスナー用の関数を追加
export const subscribeToOgiriAnswers = (threadId, eventId, callback) => {
  const answersRef = collection(
    db,
    'threads',
    threadId,
    'ogiriEvents',
    eventId,
    'answers'
  );
  const q = query(answersRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const answers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
    callback(answers);
  });
};

export const subscribeToOgiriEvent = (threadId, eventId, callback) => {
  const eventRef = doc(db, 'threads', threadId, 'ogiriEvents', eventId);

  return onSnapshot(eventRef, (doc) => {
    if (doc.exists()) {
      callback({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      });
    }
  });
};
