import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createReservation, getAvailableTimeSlots } from '../services/reservationService';

const ReservationForm = ({ boothId }) => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedDuration]);

  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      const slots = await getAvailableTimeSlots(boothId, new Date(selectedDate), selectedDuration);
      setAvailableSlots(slots.filter(slot => slot.isAvailable));
    } catch (err) {
      setError('Error al cargar los horarios disponibles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Debes iniciar sesión para hacer una reserva');
      return;
    }

    try {
      setLoading(true);
      const reservationData = {
        boothId,
        userId: currentUser.uid,
        date: new Date(selectedDate),
        timeSlot: selectedSlot,
        duration: selectedDuration,
        status: 'active'
      };

      await createReservation(reservationData);
      alert('Reserva creada exitosamente');
      // Limpiar el formulario
      setSelectedDate('');
      setSelectedSlot('');
      setSelectedDuration(1);
      setAvailableSlots([]);
    } catch (err) {
      setError('Error al crear la reserva');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Reservar Cabina</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duración
          </label>
          <select
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(Number(e.target.value))}
            className="w-full p-2 border rounded"
            required
          >
            <option value={1}>1 hora</option>
            <option value={2}>2 horas</option>
            <option value={3}>3 horas</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horario Disponible
            </label>
            {loading ? (
              <div className="p-2">Cargando horarios...</div>
            ) : availableSlots.length > 0 ? (
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecciona un horario</option>
                {availableSlots.map((slot) => (
                  <option key={slot.id} value={slot.timeString}>
                    {slot.timeString} - {slot.duration} hora(s)
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-2 text-gray-500">
                No hay horarios disponibles para esta fecha y duración
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedDate || !selectedSlot}
          className={`w-full py-2 px-4 rounded text-white ${
            loading || !selectedDate || !selectedSlot
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Procesando...' : 'Reservar'}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm; 