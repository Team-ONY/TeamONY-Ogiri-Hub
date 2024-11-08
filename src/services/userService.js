import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const getUserById = async (userId) => {
  const userDoc = doc(db, 'users', userId);
  const docSnap = await getDoc(userDoc);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.error('No such user document!');
    return null;
  }
};
