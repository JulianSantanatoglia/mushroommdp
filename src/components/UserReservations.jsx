import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserReservations, cancelReservation } from '../services/reservationService';

const UserReservations = () => {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadReservations();
    }
  }, [currentUser]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const userReservations = await getUserReservations(currentUser.uid);
      setReservations(userReservations);
    } catch (err) {
      setError('Error al cargar tus reservas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      try {
        await cancelReservation(reservationId);
        await loadReservations();
      } catch (err) {
        setError('Error al cancelar la reserva');
        console.error(err);
      }
    }
  };

  if (loading) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!currentUser) return <div className="p-4">Debes iniciar sesión para ver tus reservas</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Mis Reservas</h2>
      
      {reservations.length === 0 ? (
        <div className="text-gray-500">No tienes reservas activas</div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white p-4 rounded-lg shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Cabina {reservation.boothId}</h3>
                  <p className="text-gray-600">
                    Fecha: {new Date(reservation.date.seconds * 1000).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    Hora: {reservation.timeSlot}
                  </p>
                  <p className="text-gray-600">
                    Estado: <span className={`font-medium ${
                      reservation.status === 'active' ? 'text-green-600' :
                      reservation.status === 'cancelled' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {reservation.status}
                    </span>
                  </p>
                </div>
                
                {reservation.status === 'active' && (
                  <button
                    onClick={() => handleCancelReservation(reservation.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserReservations; 