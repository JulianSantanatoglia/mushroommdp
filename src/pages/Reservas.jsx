import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/datepicker.css';
import { registerLocale } from "react-datepicker";
import es from 'date-fns/locale/es';
registerLocale('es', es);

const Reservas = () => {
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
    setAvailableTimes(generateTimeSlots());
  };

  const handleTimeSelect = async (time) => {
    setSelectedTime(time);
    const isAvailable = await checkAvailability(selectedDate, time);
    if (!isAvailable) {
      setError('Este horario ya está reservado');
    }
  };

  const getSelectedTimeSlots = () => {
    if (!selectedTime) return [];
    
    const slots = [];
    const [startHour, startMinute] = selectedTime.split(':').map(Number);
    const totalSlots = duration * 2; // Cada hora tiene 2 slots (0 y 30 minutos)
    
    for (let i = 0; i < totalSlots; i++) {
      const hour = startHour + Math.floor(i / 2);
      const minute = (i % 2) * 30;
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
    
    return slots;
  };

  const handleBoothSelect = (boothId) => {
    setSelectedBooth(boothId);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDurationChange = (hours) => {
    setDuration(hours);
    setSelectedTime(null);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleReservation = async () => {
    if (!selectedBooth || !selectedDate || !selectedTime || !formData.name || !formData.email || !formData.phone) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      startTime.setHours(parseInt(hours), parseInt(minutes), 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + duration);

      const reservationData = {
        boothId: selectedBooth,
        startTime,
        endTime,
        duration,
        ...formData,
        totalPrice: booths.find(b => b.id === selectedBooth).price * duration,
        status: 'pending',
        createdAt: new Date()
      };

      await addDoc(collection(db, 'reservations'), reservationData);
      
      // Limpiar el formulario
      setSelectedDate(null);
      setSelectedTime(null);
      setFormData({ name: '', email: '', phone: '' });
      setError(null);
      
      // Mostrar mensaje de éxito
      alert('Reserva realizada con éxito');
    } catch (err) {
      setError('Error al realizar la reserva');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black text-white py-20 px-4">
      <div className="container mx-auto reservas-container pb-40">
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
                  onClick={() => handleBoothSelect(booth.id)}
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
                <div className="date-picker-container">
                  <label className="block text-gray-300 mb-2 text-sm md:text-base">Fecha</label>
                  <div className="relative">
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateSelect}
                      minDate={new Date()}
                      dateFormat="dd/MM/yyyy"
                      locale="es"
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholderText="Selecciona una fecha"
                      popperPlacement="bottom-start"
                      popperModifiers={[
                        {
                          name: "preventOverflow",
                          options: {
                            boundary: "viewport",
                            altBoundary: true,
                            padding: 8
                          }
                        },
                        {
                          name: "flip",
                          options: {
                            fallbackPlacements: ["top", "bottom"]
                          }
                        },
                        {
                          name: "offset",
                          options: {
                            offset: [0, 8]
                          }
                        }
                      ]}
                      showPopperArrow={false}
                      calendarClassName="react-datepicker-calendar"
                      wrapperClassName="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm md:text-base">Duración</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 1.5, 2, 2.5, 3].map((hours) => (
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
                    {availableTimes.map((time) => {
                      const selectedSlots = getSelectedTimeSlots();
                      const isSelected = selectedSlots.includes(time);
                      const isPartOfSelection = selectedSlots.some(slot => {
                        const [slotHour, slotMinute] = slot.split(':').map(Number);
                        const [timeHour, timeMinute] = time.split(':').map(Number);
                        return slotHour === timeHour && Math.abs(slotMinute - timeMinute) <= 30;
                      });

                      return (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className={`py-2 rounded-lg transition-all duration-300 ${
                            isSelected
                              ? 'bg-green-500 hover:bg-green-600'
                              : isPartOfSelection
                              ? 'bg-green-500/50 hover:bg-green-600/50'
                              : 'bg-slate-700 hover:bg-slate-600'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {selectedDate && selectedTime && selectedBooth && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Nombre completo"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="Correo electrónico"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="Teléfono"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
    </div>
  );
};

export default Reservas; 