import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './Reservas.css';

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
      id: 'premium',
      name: 'Booth Premium',
      description: 'Equipamiento completo para DJs profesionales',
      price: 2500,
      features: [
        'Equipamiento de alta gama',
        'Sistema de sonido profesional',
        'Controladores MIDI',
        'Monitores de estudio',
        'Aislamiento acústico premium'
      ],
      image: '/images/booth-premium.jpg'
    },
    {
      id: 'standard',
      name: 'Booth Standard',
      description: 'Equipamiento básico para prácticas y grabaciones',
      price: 1500,
      features: [
        'Equipamiento básico',
        'Sistema de sonido estándar',
        'Controladores básicos',
        'Monitores de estudio',
        'Aislamiento acústico estándar'
      ],
      image: '/images/booth-standard.jpg'
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          Reserva tu Booth
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {booths.map((booth) => (
            <motion.div
              key={booth.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border-2 ${
                selectedBooth === booth.id
                  ? 'border-blue-500 shadow-lg shadow-blue-500/50'
                  : 'border-transparent'
              } transition-all duration-300`}
            >
              <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                <img
                  src={booth.image}
                  alt={booth.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">{booth.name}</h2>
              <p className="text-gray-300 mb-4">{booth.description}</p>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Características:</h3>
                <ul className="list-disc list-inside text-gray-300">
                  {booth.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-white">${booth.price}/hora</span>
                <button
                  onClick={() => handleBoothSelect(booth.id)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    selectedBooth === booth.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {selectedBooth === booth.id ? 'Seleccionado' : 'Seleccionar'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedBooth && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="date-time-section"
          >
            <h2 className="date-time-title">Selecciona Fecha y Hora</h2>
            <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="date-picker-container">
                  <label className="block text-gray-300 mb-2 text-sm md:text-base">Fecha</label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateSelect}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    className="date-picker"
                    placeholderText="Selecciona una fecha"
                    popperPlacement="bottom-start"
                    popperModifiers={[
                      {
                        name: "preventOverflow",
                        options: {
                          boundary: "viewport"
                        }
                      }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm md:text-base">Duración</label>
                  <div className="duration-buttons">
                    {[1, 1.5, 2, 2.5, 3].map((hours) => (
                      <button
                        key={hours}
                        onClick={() => handleDurationChange(hours)}
                        className={`duration-button ${
                          duration === hours
                            ? 'button-selected'
                            : 'button-default'
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
                  <div className="time-grid">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className={`time-button ${
                          selectedTime === time
                            ? 'button-selected'
                            : 'button-default'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
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
            className="confirmation-section"
          >
            <h2 className="confirmation-title">Confirmar Reserva</h2>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            <div className="space-y-4 md:space-y-6">
              <div className="reservation-details">
                <div className="space-y-2">
                  <p className="detail-item">
                    <span className="font-semibold">Booth:</span> {booths.find(b => b.id === selectedBooth).name}
                  </p>
                  <p className="detail-item">
                    <span className="font-semibold">Fecha:</span> {selectedDate.toLocaleDateString()}
                  </p>
                  <p className="detail-item">
                    <span className="font-semibold">Hora:</span> {selectedTime}
                  </p>
                  <p className="detail-item">
                    <span className="font-semibold">Duración:</span> {duration} {duration === 1 ? 'hora' : 'horas'}
                  </p>
                  <p className="detail-item">
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
                    className="form-input"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="Correo electrónico"
                    className="form-input"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="Teléfono"
                    className="form-input"
                  />
                </div>
              </div>
              <button
                onClick={handleReservation}
                disabled={loading}
                className={`confirm-button ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Procesando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Reservas; 