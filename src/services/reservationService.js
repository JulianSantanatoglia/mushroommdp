import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  Timestamp, 
  doc, 
  updateDoc,
  setDoc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';

// Función para inicializar los horarios disponibles
export const initializeTimeSlots = async (boothId, date) => {
  try {
    const workingHours = { start: 9, end: 21 }; // 9 AM a 9 PM
    const slotDuration = 60; // 1 hora por defecto

    for (let hour = workingHours.start; hour <= workingHours.end; hour++) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setHours(slotEnd.getHours() + 1);

      const slotId = `${boothId}_${date.toISOString().split('T')[0]}_${hour.toString().padStart(2, '0')}00`;
      
      // Verificar si el slot ya existe
      const slotDoc = await getDoc(doc(db, 'timeSlots', slotId));
      if (!slotDoc.exists()) {
        await setDoc(doc(db, 'timeSlots', slotId), {
          boothId,
          date: Timestamp.fromDate(date),
          startTime: Timestamp.fromDate(slotStart),
          endTime: Timestamp.fromDate(slotEnd),
          isAvailable: true,
          timeString: `${hour.toString().padStart(2, '0')}:00`,
          duration: 1 // duración en horas
        });
      }
    }
  } catch (error) {
    console.error('Error initializing time slots:', error);
    throw error;
  }
};

// Obtener horarios disponibles
export const getAvailableTimeSlots = async (boothId, date, duration = 1) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Verificar si existen slots para este día
    const slotsQuery = query(
      collection(db, 'timeSlots'),
      where('boothId', '==', boothId),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay))
    );

    const slotsSnapshot = await getDocs(slotsQuery);
    
    if (slotsSnapshot.empty) {
      await initializeTimeSlots(boothId, date);
      return getAvailableTimeSlots(boothId, date, duration);
    }

    const slots = slotsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filtrar slots disponibles considerando la duración
    const availableSlots = [];
    for (let i = 0; i < slots.length; i++) {
      let isAvailable = true;
      // Verificar si hay suficientes slots consecutivos disponibles
      for (let j = 0; j < duration; j++) {
        const nextSlot = slots[i + j];
        if (!nextSlot || !nextSlot.isAvailable) {
          isAvailable = false;
          break;
        }
      }
      if (isAvailable) {
        availableSlots.push({
          ...slots[i],
          duration
        });
      }
    }

    return availableSlots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
};

// Crear una nueva reserva
export const createReservation = async (reservationData) => {
  try {
    const { boothId, date, timeSlot, duration } = reservationData;
    
    // Verificar disponibilidad para la duración completa
    const startHour = parseInt(timeSlot.split(':')[0]);
    const slotsToCheck = [];
    
    for (let i = 0; i < duration; i++) {
      const slotId = `${boothId}_${date.toISOString().split('T')[0]}_${(startHour + i).toString().padStart(2, '0')}00`;
      slotsToCheck.push(slotId);
    }

    // Verificar que todos los slots estén disponibles
    for (const slotId of slotsToCheck) {
      const slotDoc = await getDoc(doc(db, 'timeSlots', slotId));
      if (!slotDoc.exists() || !slotDoc.data().isAvailable) {
        throw new Error('El horario seleccionado no está disponible');
      }
    }

    // Crear la reserva
    const reservationsRef = collection(db, 'reservations');
    const newReservation = {
      ...reservationData,
      createdAt: Timestamp.now(),
      status: 'active',
      totalPrice: 50 * duration // precio por hora * duración
    };
    const docRef = await addDoc(reservationsRef, newReservation);

    // Marcar los slots como no disponibles
    for (const slotId of slotsToCheck) {
      await updateDoc(doc(db, 'timeSlots', slotId), {
        isAvailable: false,
        reservationId: docRef.id
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

// Obtener reservas por usuario
export const getUserReservations = async (userId) => {
  try {
    const reservationsRef = collection(db, 'reservations');
    const q = query(reservationsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user reservations:', error);
    throw error;
  }
};

// Obtener todas las reservas (para admin)
export const getAllReservations = async () => {
  try {
    const reservationsRef = collection(db, 'reservations');
    const querySnapshot = await getDocs(reservationsRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all reservations:', error);
    throw error;
  }
};

// Actualizar una reserva
export const updateReservation = async (reservationId, updateData) => {
  try {
    const reservationRef = doc(db, 'reservations', reservationId);
    await updateDoc(reservationRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating reservation:', error);
    throw error;
  }
};

// Cancelar una reserva
export const cancelReservation = async (reservationId) => {
  try {
    const reservationRef = doc(db, 'reservations', reservationId);
    const reservationDoc = await getDoc(reservationRef);
    
    if (!reservationDoc.exists()) {
      throw new Error('Reserva no encontrada');
    }

    const reservation = reservationDoc.data();
    
    // Marcar la reserva como cancelada
    await updateDoc(reservationRef, {
      status: 'cancelled',
      cancelledAt: Timestamp.now()
    });

    // Liberar los slots de tiempo
    const startHour = parseInt(reservation.timeSlot.split(':')[0]);
    for (let i = 0; i < reservation.duration; i++) {
      const slotId = `${reservation.boothId}_${reservation.date.toDate().toISOString().split('T')[0]}_${(startHour + i).toString().padStart(2, '0')}00`;
      await updateDoc(doc(db, 'timeSlots', slotId), {
        isAvailable: true,
        reservationId: null
      });
    }

    return true;
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    throw error;
  }
};

// Verificar disponibilidad de horarios
export const checkTimeSlotAvailability = async (date, boothId) => {
  try {
    const reservationsRef = collection(db, 'reservations');
    const q = query(
      reservationsRef,
      where('date', '==', date),
      where('boothId', '==', boothId),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().timeSlot);
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    throw error;
  }
}; 