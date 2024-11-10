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
          threadData.comments.map(async (comment) => {
            try {
              const userDoc = await getDoc(doc(db, 'users', comment.createdBy));
              const userData = userDoc.exists() ? userDoc.data() : null;

              return {
                ...comment,
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

export const addCommentToThread = async (id, comment) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to comment');
    }

    const threadDoc = doc(db, 'threads', id);
    const commentData = {
      text: comment,
      createdBy: user.uid,
      createdByUsername: user.displayName,
      userPhotoURL: user.photoURL,
      createdAt: new Date(),
    };

    await updateDoc(threadDoc, {
      comments: arrayUnion(commentData),
    });

    console.log('Comment added successfully:', commentData); // デバッグ用
    return commentData; // 追加したコメントデータを返す
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error; // エラーを上位に伝播
  }
};
