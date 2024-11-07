import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

const threadsCollection = collection(db, 'threads');

export const createThread = async (title, content) => {
  try {
    const docRef = await addDoc(threadsCollection, {
      title,
      content,
      createdAt: new Date(),
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
