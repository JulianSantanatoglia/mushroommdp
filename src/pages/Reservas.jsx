import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Reservas = () => {
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [duration, setDuration] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const booths = [
    {
      id: 'premium',
      name: 'Cabina Premium',
      description: 'Equipada con lo último en tecnología de audio y video',
      price: 2500,
      features: [
        'Equipo de audio profesional',
        'Monitores de estudio',
        'Micrófonos de condensador',
        'Interfaz de audio de alta calidad',
        'Software de grabación profesional',
      ],
      image: '/images/booth-premium.jpg',
    },
    {
      id: 'standard',
      name: 'Cabina Standard',
      description: 'Perfecta para prácticas y grabaciones básicas',
      price: 1500,
      features: [
        'Equipo de audio básico',
        'Monitores de estudio',
        'Micrófonos dinámicos',
        'Interfaz de audio estándar',
        'Software de grabación básico',
      ],
      image: '/images/booth-standard.jpg',
    },
  ];

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 22;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }

    return slots;
  };

  const checkAvailability = async (date, time) => {
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
        where('endTime', '<=', endTime)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  const handleBoothSelect = (booth) => {
    setSelectedBooth(booth.id);
    setSelectedDate(null);
    setSelectedTime(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
    });
    setError(null);
    setSuccess(false);
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setError(null);

    const slots = generateTimeSlots();
    const availableSlots = [];

    for (const slot of slots) {
      const isAvailable = await checkAvailability(date, slot);
      if (isAvailable) {
        availableSlots.push(slot);
      }
    }

    setAvailableTimes(availableSlots);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setError(null);
  };

  const handleDurationChange = (hours) => {
    setDuration(hours);
    setSelectedTime(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!selectedBooth || !selectedDate || !selectedTime) {
        throw new Error('Por favor, complete todos los campos requeridos');
      }

      const startTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      startTime.setHours(parseInt(hours), parseInt(minutes), 0);

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + duration);

      const isAvailable = await checkAvailability(selectedDate, selectedTime);
      if (!isAvailable) {
        throw new Error('Lo sentimos, este horario ya no está disponible');
      }

      const booth = booths.find((b) => b.id === selectedBooth);
      const totalPrice = booth.price * duration;

      await addDoc(collection(db, 'reservations'), {
        boothId: selectedBooth,
        startTime,
        endTime,
        duration,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        totalPrice,
        status: 'pending',
        createdAt: new Date(),
      });

      setSuccess(true);
      setSelectedBooth(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setDuration(1);
      setFormData({
        name: '',
        email: '',
        phone: '',
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-800 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Reservas</h1>
          <p className="text-lg text-gray-300">
            Selecciona una cabina y elige tu horario preferido
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {booths.map((booth) => (
            <motion.div
              key={booth.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                selectedBooth === booth.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="relative h-48">
                <img
                  src={booth.image}
                  alt={booth.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="text-2xl font-bold text-white">{booth.name}</h2>
                  <p className="text-white/80">{booth.description}</p>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Características
                  </h3>
                  <ul className="space-y-2">
                    {booth.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2"
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
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      ${booth.price}
                    </span>
                    <span className="text-gray-500">/hora</span>
                  </div>
                  <button
                    onClick={() => handleBoothSelect(booth)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Seleccionar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedBooth && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Selecciona fecha y hora
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateSelect}
                  minDate={new Date()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholderText="Selecciona una fecha"
                />
              </div>
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración (horas)
                  </label>
                  <div className="flex space-x-2">
                    {[1, 1.5, 2, 2.5, 3].map((hours) => (
                      <button
                        key={hours}
                        onClick={() => handleDurationChange(hours)}
                        className={`px-4 py-2 rounded-lg ${
                          duration === hours
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {selectedDate && availableTimes.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horario disponible
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`px-4 py-2 rounded-lg ${
                        selectedTime === time
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {selectedBooth && selectedDate && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Confirmar reserva
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Detalles de la reserva
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Cabina:</span>{' '}
                    {booths.find((b) => b.id === selectedBooth)?.name}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Fecha:</span>{' '}
                    {selectedDate?.toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Hora:</span> {selectedTime}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Duración:</span> {duration} hora
                    {duration > 1 ? 's' : ''}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Precio total:</span> $
                    {booths.find((b) => b.id === selectedBooth)?.price * duration}
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                  ¡Reserva confirmada! Te enviaremos un email con los detalles.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : 'Confirmar reserva'}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Reservas; 