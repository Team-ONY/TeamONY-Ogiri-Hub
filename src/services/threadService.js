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

const threadsCollection = collection(db, 'threads');

export const createThread = async (title, content) => {
  try {
    const docRef = await addDoc(threadsCollection, {
      title,
      content,
      createdAt: new Date(),
      comments: [],
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

export const getThreads = async () => {
  const querySnapshot = await getDocs(threadsCollection);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
  const threadDoc = doc(db, 'threads', id);
  const docSnap = await getDoc(threadDoc);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    console.error('No such document!');
  }
};

export const addCommentToThread = async (id, comment) => {
  const threadDoc = doc(db, 'threads', id);
  await updateDoc(threadDoc, {
    comments: arrayUnion(comment),
  });
};
