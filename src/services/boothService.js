import { db } from '../firebase/config';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';

// Inicializar las cabinas en la base de datos
export const initializeBooths = async () => {
  try {
    const boothsRef = collection(db, 'booths');
    const boothsSnapshot = await getDocs(boothsRef);

    if (boothsSnapshot.empty) {
      // Crear las dos cabinas
      await setDoc(doc(db, 'booths', 'cabina1'), {
        id: 'cabina1',
        name: 'Cabina 1',
        description: 'Cabina de masaje individual',
        price: 50, // precio por hora
        status: 'active'
      });

      await setDoc(doc(db, 'booths', 'cabina2'), {
        id: 'cabina2',
        name: 'Cabina 2',
        description: 'Cabina de masaje individual',
        price: 50, // precio por hora
        status: 'active'
      });
    }
  } catch (error) {
    console.error('Error initializing booths:', error);
    throw error;
  }
};

// Obtener todas las cabinas
export const getAllBooths = async () => {
  try {
    const boothsRef = collection(db, 'booths');
    const boothsSnapshot = await getDocs(boothsRef);
    return boothsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting booths:', error);
    throw error;
  }
}; 