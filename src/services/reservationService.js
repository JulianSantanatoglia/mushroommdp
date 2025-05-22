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
  deleteDoc,
  orderBy
} from 'firebase/firestore';

// Función para inicializar los horarios disponibles
export const initializeTimeSlots = async (boothId, date) => {
  try {
    const workingHours = { start: 9, end: 21 }; // 9 AM a 9 PM
    const slotDuration = 30; // 30 minutos por slot
    const dateStr = date.toISOString().split('T')[0];

    console.log('Inicializando slots para:', { boothId, date: dateStr });

    // Verificar si ya existen slots para esta fecha y cabina
    const existingSlotsQuery = query(
      collection(db, 'timeSlots'),
      where('boothId', '==', boothId)
    );

    const existingSlots = await getDocs(existingSlotsQuery);
    const slotsForDate = existingSlots.docs
      .map(doc => doc.data())
      .filter(slot => {
        const slotDate = slot.date.toDate();
        return slotDate.toISOString().split('T')[0] === dateStr;
      });
    
    console.log('Slots existentes para la fecha:', slotsForDate.length);
    
    // Si ya existen slots para esta fecha, no crear nuevos
    if (slotsForDate.length > 0) {
      console.log('Slots ya existen para esta fecha');
      return;
    }

    // Crear slots para cada hora y media hora
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        const slotId = `${boothId}_${dateStr}_${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}`;
        
        const slotData = {
          id: slotId, // Agregar el ID al documento
          boothId,
          date: Timestamp.fromDate(date),
          startTime: Timestamp.fromDate(slotStart),
          endTime: Timestamp.fromDate(slotEnd),
          isAvailable: true,
          timeString: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          duration: slotDuration
        };
        
        await setDoc(doc(db, 'timeSlots', slotId), slotData);
        console.log('Slot creado:', slotId);
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

    // Primero inicializamos los slots para esta fecha
    await initializeTimeSlots(boothId, date);

    // Luego consultamos los slots (consulta simplificada)
    const slotsQuery = query(
      collection(db, 'timeSlots'),
      where('boothId', '==', boothId)
    );

    const slotsSnapshot = await getDocs(slotsQuery);
    const slots = slotsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(slot => {
        const slotDate = slot.date.toDate();
        return slotDate >= startOfDay && slotDate <= endOfDay;
      });

    // Filtrar slots disponibles considerando la duración
    const availableSlots = [];
    const slotsNeeded = duration * 2; // 2 slots por hora (30 minutos cada uno)

    for (let i = 0; i < slots.length - slotsNeeded + 1; i++) {
      let isAvailable = true;
      // Verificar si hay suficientes slots consecutivos disponibles
      for (let j = 0; j < slotsNeeded; j++) {
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
    throw new Error('Error al cargar los horarios disponibles. Por favor, intenta nuevamente.');
  }
};

// Crear una nueva reserva
export const createReservation = async (reservationData) => {
  try {
    const { boothId, userId, startTime, duration } = reservationData;
    console.log('Iniciando reserva con datos:', { boothId, userId, startTime, duration });
    
    // Verificar disponibilidad para la duración completa
    const slotsNeeded = duration * 2; // 2 slots por hora
    const slotsToCheck = [];
    const dateStr = startTime.toISOString().split('T')[0];
    
    // Generar los IDs de los slots que necesitamos verificar
    for (let i = 0; i < slotsNeeded; i++) {
      const slotTime = new Date(startTime);
      slotTime.setMinutes(slotTime.getMinutes() + (i * 30));
      const slotId = `${boothId}_${dateStr}_${slotTime.getHours().toString().padStart(2, '0')}${slotTime.getMinutes().toString().padStart(2, '0')}`;
      slotsToCheck.push(slotId);
    }
    console.log('Slots a verificar:', slotsToCheck);

    // Verificar que todos los slots estén disponibles
    const slotsQuery = query(
      collection(db, 'timeSlots'),
      where('boothId', '==', boothId)
    );

    const slotsSnapshot = await getDocs(slotsQuery);
    const slots = slotsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('Slots encontrados:', slots.map(s => ({ id: s.id, isAvailable: s.isAvailable })));

    // Verificar disponibilidad de cada slot
    for (const slotId of slotsToCheck) {
      const slot = slots.find(s => s.id === slotId);
      console.log('Verificando slot:', slotId, 'Estado:', slot ? { isAvailable: slot.isAvailable } : 'No encontrado');
      if (!slot || !slot.isAvailable) {
        throw new Error('El horario seleccionado no está disponible');
      }
    }

    // Crear la reserva
    const reservationsRef = collection(db, 'reservations');
    const newReservation = {
      boothId,
      userId,
      startTime: Timestamp.fromDate(startTime),
      duration,
      createdAt: Timestamp.now(),
      status: 'active',
      totalPrice: 50 * duration // precio por hora * duración
    };
    console.log('Creando reserva:', newReservation);
    const docRef = await addDoc(reservationsRef, newReservation);

    // Marcar los slots como no disponibles
    for (const slotId of slotsToCheck) {
      console.log('Marcando slot como no disponible:', slotId);
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
    const q = query(
      reservationsRef,
      where('userId', '==', userId),
      where('startTime', '>=', new Date()),
      orderBy('startTime', 'asc')
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
    await deleteDoc(reservationRef);
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