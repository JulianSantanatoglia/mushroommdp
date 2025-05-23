import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import '../styles/datepicker.css';
import { registerLocale } from "react-datepicker";
import es from 'date-fns/locale/es';
import { useAuth } from '../context/AuthContext';
import { initializeBooths } from '../firebase/init';
import * as reservationService from '../services/reservationService';
registerLocale('es', es);

const Reservas = () => {
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [duration, setDuration] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);

  // Calcular fechas mínima y máxima
  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);

  useEffect(() => {
    if (user) {
      setFormData({
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone
      });
    }
  }, [user]);

  const booths = [
    {
      id: 1,
      name: 'Cabina Premium',
      description: 'Cabina equipada con equipos de alta gama, ideal para grabaciones profesionales y sesiones de DJ avanzadas.',
      price: 50,
      features: [
        'Pioneer DJM-900NXS2',
        'CDJ-3000 x 2',
        'Monitores KRK Rokit 8',
        'Aislamiento acústico premium',
        'Sistema de iluminación LED',
        'Mesa de mezclas profesional'
      ],
      image: '/images/cabina1.jpg'
    },
    {
      id: 2,
      name: 'Cabina Estándar',
      description: 'Cabina perfecta para practicar y sesiones de DJ principiantes o intermedios.',
      price: 30,
      features: [
        'Pioneer DJM-450',
        'CDJ-2000NXS2 x 2',
        'Monitores KRK Rokit 5',
        'Aislamiento acústico estándar',
        'Iluminación básica',
        'Mesa de mezclas estándar'
      ],
      image: '/images/cabina2.jpg'
    }
  ];

  // Generar horarios disponibles
  const generateTimeSlots = () => {
    const slots = [];
    const startTime = 9; // 9:00 AM
    const endTime = 22; // 10:00 PM
    
    for (let hour = startTime; hour < endTime; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    
    return slots;
  };

  // Verificar disponibilidad en Firebase
  const checkAvailability = async (date, time) => {
    if (!selectedBooth || !date || !time) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const startTime = new Date(date);
      const [hours, minutes] = time.split(':');
      startTime.setHours(parseInt(hours), parseInt(minutes), 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + duration);
      
      const reservationsRef = collection(db, 'reservations');
      const q = query(
        reservationsRef,
        where('boothId', '==', selectedBooth),
        where('startTime', '>=', startTime),
        where('startTime', '<', endTime)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (err) {
      setError('Error al verificar disponibilidad');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setSelectedSlots([]);
    setLoading(true);
    setError(null);
    
    if (selectedBooth) {
      try {
        console.log('Cargando slots para cabina:', selectedBooth, 'fecha:', date);
        const slots = await reservationService.getAvailableTimeSlots(selectedBooth, date, duration);
        console.log('Slots disponibles:', slots);
        
        if (slots.length === 0) {
          setError('No hay horarios disponibles para esta fecha');
        }
        
        setTimeSlots(slots);
      } catch (error) {
        console.error('Error al cargar los horarios:', error);
        setError(error.message || 'Error al cargar los horarios disponibles');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTimeSelect = (slot) => {
    if (!slot.isAvailable) return;

    const slotIndex = timeSlots.findIndex(s => s.timeString === slot.timeString);
    const slotsToSelect = [];

    // Calcular cuántos slots necesitamos seleccionar basado en la duración
    const slotsNeeded = duration * 2; // 2 slots por hora (30 minutos cada uno)

    // Verificar si hay suficientes slots disponibles
    let canSelect = true;
    for (let i = 0; i < slotsNeeded; i++) {
      if (slotIndex + i >= timeSlots.length || !timeSlots[slotIndex + i].isAvailable) {
        canSelect = false;
        break;
      }
    }

    if (canSelect) {
      // Seleccionar los slots necesarios
      for (let i = 0; i < slotsNeeded; i++) {
        slotsToSelect.push(timeSlots[slotIndex + i].timeString);
      }
      setSelectedSlots(slotsToSelect);
      setSelectedTime(slot.timeString);
    }
  };

  const getSlotClassName = (slot) => {
    if (!slot.isAvailable) {
      return 'bg-red-900/90 text-red-200 border-2 border-red-500 cursor-not-allowed relative group opacity-75';
    }
    if (selectedSlots.includes(slot.timeString)) {
      return 'bg-green-500/20 text-green-300 border-green-500';
    }
    return 'bg-slate-700/50 text-gray-300 border-slate-600 hover:bg-slate-700 hover:border-blue-500';
  };

  const handleBoothSelect = (boothId) => {
    setSelectedBooth(boothId);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDurationChange = (hours) => {
    setDuration(hours);
    setSelectedTime(null);
    setSelectedSlots([]);
    
    // Recargar los slots con la nueva duración
    if (selectedDate) {
      handleDateSelect(selectedDate);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleReservation = async () => {
    if (!user) {
      openLoginModal();
      return;
    }

    if (!selectedBooth || !selectedDate || !selectedTime) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      startTime.setHours(parseInt(hours), parseInt(minutes), 0);

      const result = await reservationService.createReservation(
        selectedBooth,
        user.uid,
        startTime,
        duration
      );
      
      console.log('Reservation created:', result);
      
      // Guardar detalles de la reserva para el modal
      setReservationDetails({
        boothName: booths.find(b => b.id === selectedBooth).name,
        date: selectedDate.toLocaleDateString(),
        time: selectedTime,
        duration,
        totalPrice: booths.find(b => b.id === selectedBooth).price * duration
      });
      
      setShowSuccessModal(true);
      
      // Limpiar el formulario
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedSlots([]);
      setError(null);
    } catch (err) {
      console.error('Error creating reservation:', err);
      setError('Error al realizar la reserva: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReservations = () => {
    navigate('/perfil');
  };

  const handleInitializeBooths = async () => {
    setIsInitializing(true);
    try {
      await initializeBooths();
      alert('Cabinas inicializadas correctamente');
    } catch (error) {
      console.error('Error initializing booths:', error);
      alert('Error al inicializar las cabinas: ' + error.message);
    } finally {
      setIsInitializing(false);
    }
  };

  const loadAvailableTimeSlots = async () => {
    if (!selectedDate || !selectedBooth) {
      setTimeSlots([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Cargando horarios para:', { selectedDate, selectedBooth });
      const slots = await reservationService.getAvailableTimeSlots(
        selectedBooth,
        selectedDate,
        selectedDuration
      );
      console.log('Horarios cargados:', slots);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      setError('Error al cargar los horarios disponibles. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black text-white py-20 px-4">
      <div className="container mx-auto reservas-container pb-40">
        {/* Botón de inicialización - solo visible para admins */}
        {user && user.role === 'admin' && (
          <div className="mb-8">
            <button
              onClick={handleInitializeBooths}
              disabled={isInitializing}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
            >
              {isInitializing ? 'Inicializando...' : 'Inicializar Cabinas'}
            </button>
          </div>
        )}

        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12"
        >
          Reserva tu Cabina
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
          {booths.map((booth) => (
            <motion.div
              key={booth.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: booth.id * 0.2 }}
              className={`bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 md:p-6 border-2 transition-all duration-300 flex flex-col ${
                selectedBooth === booth.id ? 'border-blue-500' : 'border-slate-700'
              }`}
            >
              <div className="relative h-40 md:h-48 mb-4 md:mb-6 rounded-lg overflow-hidden">
                <img
                  src={booth.image}
                  alt={booth.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl md:text-2xl font-bold">{booth.name}</h3>
                  <p className="text-blue-400 font-semibold">${booth.price}/hora</p>
                </div>
              </div>

              <p className="text-gray-300 mb-4 text-sm md:text-base">{booth.description}</p>

              <div className="mb-4 md:mb-6">
                <h4 className="text-lg md:text-xl font-semibold mb-2">Características:</h4>
                <ul className="flex flex-col gap-1 md:gap-2">
                  {booth.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300 text-sm md:text-base">
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5 text-blue-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                <button
                  onClick={() => {
                    if (!user) {
                      openLoginModal();
                      return;
                    }
                    setSelectedBooth(booth.id);
                  }}
                  className={`w-full py-2 md:py-3 rounded-lg transition-all duration-300 text-sm md:text-base ${
                    selectedBooth === booth.id 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {selectedBooth === booth.id ? 'Seleccionada' : 'Seleccionar'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedBooth && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 md:p-6 mb-8"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Selecciona Fecha y Hora</h2>
            <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="date-picker-container relative">
                  <label className="block text-gray-300 mb-2 text-sm md:text-base">Fecha</label>
                  <div className="relative">
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateSelect}
                      minDate={minDate}
                      maxDate={maxDate}
                      dateFormat="dd/MM/yyyy"
                      locale={es}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      placeholderText="Selecciona la fecha"
                      calendarClassName="react-datepicker-custom"
                      wrapperClassName="w-full"
                      popperClassName="react-datepicker-popper"
                      popperModifiers={[
                        {
                          name: "preventOverflow",
                          options: {
                            enabled: true,
                            escapeWithReference: false,
                            boundary: "viewport"
                          }
                        },
                        {
                          name: "offset",
                          options: {
                            offset: [0, 8]
                          }
                        }
                      ]}
                      popperPlacement="bottom-start"
                      shouldCloseOnSelect={true}
                      renderCustomHeader={({
                        date,
                        decreaseMonth,
                        increaseMonth,
                        prevMonthButtonDisabled,
                        nextMonthButtonDisabled,
                      }) => (
                        <div className="flex items-center justify-between px-2 py-2">
                          <button
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                            type="button"
                            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <span className="text-lg font-semibold">
                            {date.toLocaleString('es', { month: 'long', year: 'numeric' })}
                          </span>
                          <button
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                            type="button"
                            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      )}
                      showPopperArrow={false}
                      fixedHeight
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm md:text-base">Duración</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].map((hours) => (
                      <button
                        key={hours}
                        onClick={() => handleDurationChange(hours)}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                          duration === hours
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                      >
                        {hours} {hours === 1 ? 'hora' : 'horas'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-gray-300 mb-2 text-sm md:text-base">Hora</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {loading ? (
                      <div className="col-span-full text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-gray-400">Cargando horarios disponibles...</p>
                      </div>
                    ) : error ? (
                      <div className="col-span-full text-center py-4">
                        <p className="text-red-400">{error}</p>
                        {error.includes('índices necesarios') && (
                          <p className="text-gray-400 mt-2">Por favor, espera unos minutos y vuelve a intentarlo.</p>
                        )}
                      </div>
                    ) : timeSlots && timeSlots.length > 0 ? (
                      timeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleTimeSelect(slot)}
                          disabled={!slot.isAvailable}
                          className={`py-2 rounded-lg transition-all duration-300 border ${
                            !slot.isAvailable 
                              ? 'bg-red-900/90 text-red-200 border-2 border-red-500 cursor-not-allowed opacity-75' 
                              : selectedSlots.includes(slot.timeString)
                                ? 'bg-green-500/20 text-green-300 border-green-500'
                                : 'bg-slate-700/50 text-gray-300 border-slate-600 hover:bg-slate-700 hover:border-blue-500'
                          }`}
                        >
                          <div className="relative flex items-center justify-center">
                            <span className={`${!slot.isAvailable ? 'line-through opacity-50' : ''}`}>
                              {slot.timeString}
                            </span>
                            {!slot.isAvailable && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-400 col-span-full text-center py-4">
                        No hay horarios disponibles para esta fecha
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {selectedDate && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 md:p-6 max-w-2xl mx-auto"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Confirmar Reserva</h2>
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <p className="text-gray-300">
                <span className="font-semibold">Cabina:</span> {booths.find(b => b.id === selectedBooth).name}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Fecha:</span> {selectedDate.toLocaleDateString()}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Hora:</span> {selectedTime}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Duración:</span> {duration} {duration === 1 ? 'hora' : 'horas'}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Total:</span> ${booths.find(b => b.id === selectedBooth).price * duration}
              </p>
            </div>
            <button
              onClick={handleReservation}
              disabled={loading}
              className={`w-full mt-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 transition-all duration-300 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Procesando...' : 'Confirmar Reserva'}
            </button>
          </motion.div>
        )}
      </div>

      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">¡Reserva Exitosa!</h3>
              <div className="text-gray-300 mb-4">
                <p>Cabina: {reservationDetails.boothName}</p>
                <p>Fecha: {reservationDetails.date}</p>
                <p>Hora: {reservationDetails.time}</p>
                <p>Duración: {reservationDetails.duration} {reservationDetails.duration === 1 ? 'hora' : 'horas'}</p>
                <p className="text-green-400 font-semibold mt-2">Total: ${reservationDetails.totalPrice}</p>
              </div>
              <button
                onClick={handleViewReservations}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-all duration-300"
              >
                Ver mis reservas
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Reservas; 