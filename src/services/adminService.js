import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const makeUserAdmin = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      role: 'admin',
      isAdmin: true
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error making user admin:', error);
    throw error;
  }
};

export const isUserAdmin = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data().role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}; 