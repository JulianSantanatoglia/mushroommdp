import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

// Verificar si un usuario es administrador
export const isUserAdmin = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return false;
    }
    return userDoc.data().isAdmin || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    throw new Error('Error al verificar el estado de administrador');
  }
};

// Hacer a un usuario administrador
export const makeUserAdmin = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isAdmin: true
    });
  } catch (error) {
    console.error('Error making user admin:', error);
    throw new Error('Error al convertir usuario en administrador');
  }
};

// Remover rol de administrador
export const removeAdminRole = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isAdmin: false
    });
  } catch (error) {
    console.error('Error removing admin role:', error);
    throw new Error('Error al remover rol de administrador');
  }
};

// Obtener todos los usuarios
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw new Error('Error al obtener usuarios');
  }
}; 