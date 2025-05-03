import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';

const Admin = () => {
  const { user, loading } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [loadingReservations, setLoadingReservations] = useState(true);

  useEffect(() => {
    if (user) {
      loadReservations();
    }
  }, [user, filter]);

  const loadReservations = async () => {
    try {
      setLoadingReservations(true);
      const reservationsRef = collection(db, 'reservations');
      let q = query(reservationsRef, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      let reservationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (filter !== 'all') {
        reservationsData = reservationsData.filter(res => res.status === filter);
      }

      setReservations(reservationsData);
    } catch (error) {
      console.error('Error loading reservations:', error);
      setError('Error al cargar las reservas');
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      setError('');
      setSuccess('');
      
      await updateDoc(doc(db, 'reservations', reservationId), {
        status: newStatus
      });

      setSuccess('Estado de la reserva actualizado correctamente');
      loadReservations();
    } catch (error) {
      console.error('Error updating reservation:', error);
      setError('Error al actualizar el estado de la reserva');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Acceso denegado</h2>
          <p className="text-gray-300">No tienes permisos para acceder a esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-md rounded-xl p-8"
        >
          <h1 className="text-2xl font-bold text-white mb-8">Panel de Administración</h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'pending'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'confirmed'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
              }`}
            >
              Confirmadas
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'cancelled'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
              }`}
            >
              Canceladas
            </button>
          </div>

          {loadingReservations ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : reservations.length === 0 ? (
            <p className="text-gray-300 text-center">No hay reservas para mostrar</p>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-300">Usuario: {reservation.name}</p>
                      <p className="text-gray-300">Email: {reservation.email}</p>
                      <p className="text-gray-300">Teléfono: {reservation.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-300">Cabina: {reservation.boothId === 1 ? 'Premium' : 'Estándar'}</p>
                      <p className="text-gray-300">Fecha: {new Date(reservation.startTime.toDate()).toLocaleDateString()}</p>
                      <p className="text-gray-300">Hora: {new Date(reservation.startTime.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div>
                      <p className="text-gray-300">Duración: {reservation.duration} hora{reservation.duration > 1 ? 's' : ''}</p>
                      <p className="text-gray-300">Precio Total: ${reservation.totalPrice}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-gray-300">Estado:</p>
                        <select
                          value={reservation.status}
                          onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                          className="bg-slate-700 text-white rounded-lg px-2 py-1"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="confirmed">Confirmada</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Admin; 