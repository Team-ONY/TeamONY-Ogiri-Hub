import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { auth } from '../config/firebase';

const threadsCollection = collection(db, 'threads');

export const createThread = async (title, content, tags, attachments) => {
  try {
    const user = auth.currentUser;
    const docRef = await addDoc(threadsCollection, {
      title,
      content,
      tags,
      attachments,
      createdAt: new Date(),
      createdBy: user ? user.uid : 'anonymous',
      comments: [],
      participants: [],
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

export const getThreads = async () => {
  const querySnapshot = await getDocs(threadsCollection);
  return querySnapshot.docs.map((doc) => {
    const threadData = doc.data();
    return {
      id: doc.id,
      ...threadData,
      commentCount: threadData.comments ? threadData.comments.length : 0,
      participantCount: doc.data().participants
        ? doc.data().participants.length
        : 0,
    };
  });
};

export const updateThread = async (id, updatedData) => {
  const threadDoc = doc(db, 'threads', id);
  await updateDoc(threadDoc, updatedData);
};

export const deleteThread = async (id) => {
  const threadDoc = doc(db, 'threads', id);
  await deleteDoc(threadDoc);
};

export const getThreadById = async (id) => {
  try {
    const threadDoc = doc(db, 'threads', id);
    const docSnap = await getDoc(threadDoc);

    if (docSnap.exists()) {
      const threadData = docSnap.data();

      // コメントに含まれるユーザー情報を取得
      if (threadData.comments && threadData.comments.length > 0) {
        const commentsWithUserInfo = await Promise.all(
          threadData.comments.map(async (comment, index) => {
            try {
              const userDoc = await getDoc(doc(db, 'users', comment.createdBy));
              const userData = userDoc.exists() ? userDoc.data() : null;

              return {
                ...comment,
                id: comment.id || index.toString(), // comment.id が存在しない場合は index を文字列に変換して id として設定
                userInfo: userData || { username: 'Unknown User' },
              };
            } catch (error) {
              console.error(`Error fetching user data for comment:`, error);
              return comment;
            }
          })
        );

        return {
          id: docSnap.id,
          ...threadData,
          comments: commentsWithUserInfo,
        };
      }

      return { id: docSnap.id, ...threadData };
    } else {
      throw new Error('Thread not found');
    }
  } catch (error) {
    console.error('Error getting thread:', error);
    throw error;
  }
};

export const addCommentToThread = async (
  threadId,
  text,
  userId,
  userName,
  userPhotoURL
) => {
  try {
    const threadRef = doc(db, 'threads', threadId);
    const createdAt = new Date(); // クライアント側でタイムスタンプを生成

    // commentRefは、コメントをcommentsサブコレクションに追加する場合にのみ使用します。
    // スレッドドキュメントに直接コメントを追加するため、ここでは不要です。

    const newComment = {
      id: new Date().getTime().toString(), // commentIdをクライアント側で生成。getTime()はミリ秒単位の数値を返すので、toString()で文字列に変換。
      text,
      createdAt: createdAt, // クライアント側で生成したタイムスタンプを使用
      createdBy: userId,
      createdByUsername: userName,
      userPhotoURL: userPhotoURL,
    };

    await updateDoc(threadRef, {
      comments: arrayUnion(newComment),
    });

    return newComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const joinThread = async (threadId, userId) => {
  try {
    console.log(('joinThread関数に渡されたthreadId:', threadId));
    console.log(('joinThread関数に渡されたuserId:', userId));
    const threadDoc = doc(db, 'threads', threadId);
    await updateDoc(threadDoc, {
      participants: arrayUnion(userId),
    });
    console.log('User joined the thread successfully');
  } catch (error) {
    console.error('Error joining the thread:', error);
    throw error;
  }
};

export const deleteCommentFromThread = async (threadId, commentId) => {
  try {
    const threadRef = doc(db, 'threads', threadId);
    const threadDoc = await getDoc(threadRef); // threadドキュメントを取得
    const thread = threadDoc.data(); // threadデータを取得

    if (!thread) {
      throw new Error('Thread not found'); // threadが存在しない場合のエラー処理
    }

    const commentIdString =
      typeof commentId === 'string' ? commentId : commentId.toString();

    // Firestoreの配列からコメントを削除
    await updateDoc(threadRef, {
      comments: arrayRemove(
        thread.comments.find((comment) => comment.id === commentIdString)
      ),
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};
