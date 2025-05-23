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
  orderBy,
  writeBatch
} from 'firebase/firestore';

// Función para inicializar los horarios disponibles
export const initializeTimeSlots = async (boothId, date) => {
  try {
    console.log('Iniciando initializeTimeSlots con:', { boothId, date });
    
    // Validar que la fecha no sea en el pasado
    const now = new Date();
    if (date < now) {
      throw new Error('No se pueden reservar fechas pasadas');
    }

    const workingHours = { start: 9, end: 21 }; // 9 AM a 9 PM
    const slotDuration = 30; // 30 minutos por slot
    const dateStr = date.toISOString().split('T')[0];
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    console.log('Verificando slots existentes...');
    // Verificar si ya existen slots para esta fecha y cabina
    const existingSlotsQuery = query(
      collection(db, 'timeSlots'),
      where('boothId', '==', boothId),
      where('date', '==', Timestamp.fromDate(startOfDay))
    );

    const existingSlots = await getDocs(existingSlotsQuery);
    console.log('Slots existentes encontrados:', existingSlots.size);
    
    // Si ya existen slots para esta fecha, verificar si necesitamos actualizarlos
    if (!existingSlots.empty) {
      const slotsData = existingSlots.docs.map(doc => doc.data());
      console.log('Datos de slots existentes:', slotsData);
      
      // Verificar si hay slots que necesitan ser actualizados
      const needsUpdate = slotsData.some(slot => !slot.isAvailable);
      if (needsUpdate) {
        console.log('Actualizando slots existentes...');
        const batch = writeBatch(db);
        existingSlots.docs.forEach(doc => {
          batch.update(doc.ref, { isAvailable: true });
        });
        await batch.commit();
        console.log('Slots actualizados exitosamente');
      }
      return;
    }

    console.log('Creando nuevos slots...');
    // Crear slots para cada hora y media hora
    const batch = writeBatch(db);
    let slotsCreated = 0;
    
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);

        // Si la fecha es hoy, no crear slots pasados
        if (date.toDateString() === now.toDateString()) {
          if (hour < now.getHours() || (hour === now.getHours() && minute <= now.getMinutes())) {
            console.log('Omitiendo slot pasado:', { hour, minute });
            continue;
          }
        }

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        const slotId = `${boothId}_${dateStr}_${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}`;
        
        const slotData = {
          id: slotId,
          boothId,
          date: Timestamp.fromDate(startOfDay),
          startTime: Timestamp.fromDate(slotStart),
          endTime: Timestamp.fromDate(slotEnd),
          isAvailable: true,
          timeString: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          duration: slotDuration
        };
        
        console.log('Creando slot:', slotId, slotData);
        const slotRef = doc(db, 'timeSlots', slotId);
        batch.set(slotRef, slotData);
        slotsCreated++;
      }
    }

    if (slotsCreated > 0) {
      console.log('Guardando batch de slots...');
      await batch.commit();
      console.log('Slots creados exitosamente:', slotsCreated);
    } else {
      console.log('No se crearon slots nuevos');
    }
  } catch (error) {
    console.error('Error detallado en initializeTimeSlots:', error);
    throw error;
  }
};

// Obtener horarios disponibles
export const getAvailableTimeSlots = async (boothId, date, duration = 1) => {
  try {
    console.log('Iniciando getAvailableTimeSlots con:', { boothId, date, duration });
    
    // Validar que la fecha no sea en el pasado
    const now = new Date();
    if (date < now) {
      throw new Error('No se pueden reservar fechas pasadas');
    }

    const dateStr = date.toISOString().split('T')[0];
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('Rango de fechas:', { startOfDay, endOfDay });

    // Primero inicializamos los slots para esta fecha si no existen
    await initializeTimeSlots(boothId, date);

    // Luego consultamos los slots usando una consulta más simple
    const slotsQuery = query(
      collection(db, 'timeSlots'),
      where('boothId', '==', boothId),
      where('date', '==', Timestamp.fromDate(startOfDay))
    );

    console.log('Ejecutando consulta de slots...');
    const slotsSnapshot = await getDocs(slotsQuery);
    console.log('Slots encontrados:', slotsSnapshot.size);

    let slots = slotsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filtrar slots pasados si la fecha es hoy
    if (date.toDateString() === now.toDateString()) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      slots = slots.filter(slot => {
        const [hours, minutes] = slot.timeString.split(':').map(Number);
        return (hours > currentHour) || (hours === currentHour && minutes > currentMinute);
      });
    }

    console.log('Slots mapeados:', slots.length);

    // Ordenar los slots por hora
    slots.sort((a, b) => {
      const [hoursA, minutesA] = a.timeString.split(':').map(Number);
      const [hoursB, minutesB] = b.timeString.split(':').map(Number);
      return (hoursA * 60 + minutesA) - (hoursB * 60 + minutesB);
    });

    console.log('Slots ordenados:', slots.length);
    return slots;
  } catch (error) {
    console.error('Error detallado en getAvailableTimeSlots:', error);
    throw new Error(error.message || 'Error al cargar los horarios disponibles. Por favor, intenta nuevamente.');
  }
};

// Crear una nueva reserva
export const createReservation = async (boothId, userId, startTime, duration) => {
  try {
    console.log('Iniciando creación de reserva:', { boothId, userId, startTime, duration });
    
    // Validar que todos los campos requeridos estén presentes
    if (!boothId || !userId || !startTime || !duration) {
      console.error('Datos de reserva incompletos:', { boothId, userId, startTime, duration });
      throw new Error('Faltan datos requeridos para crear la reserva');
    }

    // Verificar que la fecha no sea en el pasado
    const now = new Date();
    const reservationTime = new Date(startTime);
    if (reservationTime < now) {
      throw new Error('No se pueden hacer reservas en el pasado');
    }

    // Inicializar los slots para la fecha si no existen
    await initializeTimeSlots(boothId, new Date(startTime));

    // Generar IDs de los slots que necesitamos verificar
    const dateStr = new Date(startTime).toISOString().split('T')[0];
    const slotIds = [];
    for (let i = 0; i < duration * 2; i++) { // 2 slots por hora
      const slotTime = new Date(startTime);
      slotTime.setMinutes(slotTime.getMinutes() + (i * 30));
      const slotId = `${boothId}_${dateStr}_${slotTime.getHours().toString().padStart(2, '0')}${slotTime.getMinutes().toString().padStart(2, '0')}`;
      slotIds.push(slotId);
    }

    console.log('Slots a verificar:', slotIds);

    // Verificar disponibilidad de cada slot
    const batch = writeBatch(db);
    for (const slotId of slotIds) {
      const slotRef = doc(db, 'timeSlots', slotId);
      const slotDoc = await getDoc(slotRef);

      if (!slotDoc.exists()) {
        throw new Error('El horario seleccionado no está disponible');
      }

      const slotData = slotDoc.data();
      if (!slotData.isAvailable) {
        throw new Error('El horario seleccionado no está disponible');
      }

      // Marcar el slot como no disponible
      batch.update(slotRef, { isAvailable: false });
    }

    // Crear la reserva
    const reservationRef = collection(db, 'reservations');
    const reservationData = {
      boothId: Number(boothId),
      userId: String(userId),
      startTime: Timestamp.fromDate(new Date(startTime)),
      duration: Number(duration),
      status: 'active',
      totalPrice: 50 * Number(duration),
      createdAt: Timestamp.now()
    };

    console.log('Datos de la reserva a crear:', reservationData);

    // Ejecutar todas las operaciones en una transacción
    await batch.commit();
    const newReservationRef = await addDoc(reservationRef, reservationData);

    console.log('Reserva creada exitosamente:', reservationData);
    return newReservationRef.id;
  } catch (error) {
    console.error('Error en createReservation:', error);
    throw new Error(error.message || 'Error al crear la reserva');
  }
};

// Obtener reservas por usuario
export const getUserReservations = async (userId) => {
  try {
    const reservationsRef = collection(db, 'reservations');
    const q = query(
      reservationsRef,
      where('userId', '==', userId),
      orderBy('startTime', 'desc')
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
    const q = query(reservationsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all reservations:', error);
    throw new Error('Error al obtener las reservas');
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
    // Obtener la reserva
    const reservationRef = doc(db, 'reservations', reservationId);
    const reservationDoc = await getDoc(reservationRef);
    
    if (!reservationDoc.exists()) {
      throw new Error('Reserva no encontrada');
    }

    const reservation = reservationDoc.data();
    
    // Verificar que la reserva esté activa
    if (reservation.status !== 'active') {
      throw new Error('La reserva ya no está activa');
    }

    // Actualizar el estado de la reserva
    await updateDoc(reservationRef, {
      status: 'cancelled',
      cancelledAt: Timestamp.now()
    });

    // Liberar los slots de tiempo
    const dateStr = reservation.startTime.toDate().toISOString().split('T')[0];
    const slotsNeeded = reservation.duration * 2; // 2 slots por hora

    for (let i = 0; i < slotsNeeded; i++) {
      const slotTime = new Date(reservation.startTime.toDate());
      slotTime.setMinutes(slotTime.getMinutes() + (i * 30));
      const slotId = `${reservation.boothId}_${dateStr}_${slotTime.getHours().toString().padStart(2, '0')}${slotTime.getMinutes().toString().padStart(2, '0')}`;
      
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