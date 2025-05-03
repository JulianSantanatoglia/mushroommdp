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
  getDoc
} from 'firebase/firestore';

// Función para inicializar los horarios disponibles
export const initializeTimeSlots = async (boothId, date) => {
  try {
    console.log('Initializing time slots for booth:', boothId, 'date:', date);
    const workingHours = { start: 9, end: 21 }; // 9 AM a 9 PM
    const slotDuration = 30; // minutos

    for (let hour = workingHours.start; hour <= workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        const slotId = `${boothId}_${date.toISOString().split('T')[0]}_${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}`;
        
        // Verificar si el slot ya existe
        const slotDoc = await getDoc(doc(db, 'timeSlots', slotId));
        if (!slotDoc.exists()) {
          await setDoc(doc(db, 'timeSlots', slotId), {
            boothId,
            date: Timestamp.fromDate(date),
            startTime: Timestamp.fromDate(slotStart),
            endTime: Timestamp.fromDate(slotEnd),
            isAvailable: true,
            timeString: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          });
          console.log('Created slot:', slotId);
        }
      }
    }
  } catch (error) {
    console.error('Error initializing time slots:', error);
    throw error;
  }
};

// Obtener horarios disponibles
export const getAvailableTimeSlots = async (boothId, date) => {
  try {
    console.log('Getting slots for booth:', boothId, 'date:', date);
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
    console.log('Found slots:', slotsSnapshot.size);
    
    if (slotsSnapshot.empty) {
      console.log('No slots found, initializing...');
      await initializeTimeSlots(boothId, date);
      return getAvailableTimeSlots(boothId, date); // Recursivamente obtener los slots
    }

    const slots = slotsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('Returning slots:', slots);
    return slots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
};

// Crear una reserva
export const createReservation = async (reservationData) => {
  try {
    console.log('Creating reservation with data:', reservationData);
    const { boothId, userId, startTime, duration } = reservationData;
    
    // Calcular el tiempo de fin
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + duration);

    // Obtener el precio de la cabina
    const boothDoc = await getDoc(doc(db, 'booths', boothId.toString()));
    if (!boothDoc.exists()) {
      throw new Error('Booth not found');
    }
    const boothData = boothDoc.data();
    const totalPrice = boothData.price * duration;

    // Crear la reserva
    const reservation = {
      boothId,
      userId,
      startTime: Timestamp.fromDate(new Date(startTime)),
      endTime: Timestamp.fromDate(endTime),
      duration,
      status: 'pending',
      totalPrice,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    console.log('Adding reservation to Firestore');
    const docRef = await addDoc(collection(db, 'reservations'), reservation);
    console.log('Reservation created with ID:', docRef.id);

    // Marcar los slots como no disponibles
    const slotDuration = 30; // minutos
    const slotsToUpdate = [];
    
    for (let i = 0; i < duration * 2; i++) {
      const slotTime = new Date(startTime);
      slotTime.setMinutes(slotTime.getMinutes() + (i * slotDuration));
      
      const slotId = `${boothId}_${slotTime.toISOString().split('T')[0]}_${slotTime.getHours().toString().padStart(2, '0')}${slotTime.getMinutes().toString().padStart(2, '0')}`;
      slotsToUpdate.push(slotId);
    }

    // Actualizar los slots
    console.log('Updating slots:', slotsToUpdate);
    for (const slotId of slotsToUpdate) {
      await updateDoc(doc(db, 'timeSlots', slotId), {
        isAvailable: false,
        reservationId: docRef.id
      });
    }

    return { id: docRef.id, ...reservation };
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

// Obtener reservas de un usuario
export const getUserReservations = async (userId) => {
  try {
    const q = query(
      collection(db, 'reservations'),
      where('userId', '==', userId)
    );

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

// Cancelar una reserva
export const cancelReservation = async (reservationId) => {
  try {
    // Obtener la reserva
    const reservationDoc = await getDoc(doc(db, 'reservations', reservationId));
    if (!reservationDoc.exists()) {
      throw new Error('Reservation not found');
    }
    const reservation = reservationDoc.data();

    // Marcar la reserva como cancelada
    await updateDoc(doc(db, 'reservations', reservationId), {
      status: 'cancelled',
      updatedAt: Timestamp.now()
    });

    // Marcar los slots como disponibles nuevamente
    const slotDuration = 30; // minutos
    const slotsToUpdate = [];
    
    for (let i = 0; i < reservation.duration * 2; i++) {
      const slotTime = reservation.startTime.toDate();
      slotTime.setMinutes(slotTime.getMinutes() + (i * slotDuration));
      
      const slotId = `${reservation.boothId}_${slotTime.toISOString().split('T')[0]}_${slotTime.getHours().toString().padStart(2, '0')}${slotTime.getMinutes().toString().padStart(2, '0')}`;
      slotsToUpdate.push(slotId);
    }

    // Actualizar los slots
    for (const slotId of slotsToUpdate) {
      await updateDoc(doc(db, 'timeSlots', slotId), {
        isAvailable: true,
        reservationId: null
      });
    }
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    throw error;
  }
}; 