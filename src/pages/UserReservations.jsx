import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import * as reservationService from '../services/reservationService';

const UserReservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    loadReservations();
  }, [user]);

  const loadReservations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userReservations = await reservationService.getUserReservations(user.uid);
      setReservations(userReservations);
    } catch (error) {
      console.error('Error loading reservations:', error);
      setError('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (reservation) => {
    setSelectedReservation(reservation);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await reservationService.cancelReservation(selectedReservation.id);
      await loadReservations();
      setShowDeleteModal(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      setError('Error al cancelar la reserva');
    }
  };

  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Confirmada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black text-white py-20 px-4">
        <div className="container mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black text-white py-20 px-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mis Reservas</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No tienes reservas activas</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reservations.map((reservation) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Cabina {reservation.boothId === 1 ? 'Premium' : 'Estándar'}
                    </h3>
                    <p className="text-gray-300">
                      {formatDate(reservation.startTime)}
                    </p>
                    <p className="text-gray-300">
                      Duración: {reservation.duration} {reservation.duration === 1 ? 'hora' : 'horas'}
                    </p>
                    <p className="text-green-400 font-semibold mt-2">
                      Total: ${reservation.totalPrice}
                    </p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full border ${getStatusBadgeClass(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                  </div>
                  <div className="mt-4 md:mt-0">
                    {reservation.status === 'active' && (
                      <button
                        onClick={() => handleDeleteClick(reservation)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
                      >
                        Cancelar Reserva
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold mb-4">¿Cancelar Reserva?</h3>
            <p className="text-gray-300 mb-6">
              Esta acción no se puede deshacer. ¿Estás seguro de que deseas cancelar esta reserva?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-all duration-300"
              >
                Volver
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-all duration-300"
              >
                Confirmar Cancelación
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserReservations; 