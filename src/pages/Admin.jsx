import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../services/adminService';
import * as reservationService from '../services/reservationService';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('reservations');
  const [reservationFilter, setReservationFilter] = useState('all');

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  useEffect(() => {
    filterReservations();
  }, [reservations, reservationFilter]);

  const filterReservations = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let filtered = [...reservations];

    switch (reservationFilter) {
      case 'today':
        filtered = filtered.filter(reservation => {
          const reservationDate = reservation.startTime.toDate();
          return reservationDate.toDateString() === today.toDateString();
        });
        break;
      case 'tomorrow':
        filtered = filtered.filter(reservation => {
          const reservationDate = reservation.startTime.toDate();
          return reservationDate.toDateString() === tomorrow.toDateString();
        });
        break;
      case 'active':
        filtered = filtered.filter(reservation => reservation.status === 'active');
        break;
      case 'cancelled':
        filtered = filtered.filter(reservation => reservation.status === 'cancelled');
        break;
      default:
        break;
    }

    // Ordenar por fecha y hora (más temprano a más tarde)
    filtered.sort((a, b) => {
      const dateA = a.startTime.toDate();
      const dateB = b.startTime.toDate();
      return dateA - dateB;
    });

    setFilteredReservations(filtered);
  };

  const checkAdminAccess = async () => {
    try {
      const isAdmin = await adminService.isUserAdmin(user.uid);
      if (!isAdmin) {
        navigate('/');
        return;
      }
      loadData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      setError('Error al verificar acceso de administrador');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, reservationsData] = await Promise.all([
        adminService.getAllUsers(),
        reservationService.getAllReservations()
      ]);
      setUsers(usersData);
      setReservations(reservationsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      setLoading(true);
      await adminService.makeUserAdmin(userId);
      await loadData();
      setSuccess('Usuario convertido en administrador exitosamente');
    } catch (error) {
      console.error('Error making user admin:', error);
      setError('Error al convertir usuario en administrador');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    try {
      setLoading(true);
      await adminService.removeAdminRole(userId);
      await loadData();
      setSuccess('Rol de administrador removido exitosamente');
    } catch (error) {
      console.error('Error removing admin role:', error);
      setError('Error al remover rol de administrador');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      setLoading(true);
      await reservationService.cancelReservation(reservationId);
      await loadData();
      setSuccess('Reserva cancelada exitosamente');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      setError('Error al cancelar la reserva');
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'reservations'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Reservas
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Usuarios
          </button>
        </div>

        {activeTab === 'reservations' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setReservationFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  reservationFilter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setReservationFilter('today')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  reservationFilter === 'today'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setReservationFilter('tomorrow')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  reservationFilter === 'tomorrow'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                }`}
              >
                Mañana
              </button>
              <button
                onClick={() => setReservationFilter('active')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  reservationFilter === 'active'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                }`}
              >
                Activas
              </button>
              <button
                onClick={() => setReservationFilter('cancelled')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  reservationFilter === 'cancelled'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                }`}
              >
                Canceladas
              </button>
            </div>

            {filteredReservations.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No hay reservas</p>
            ) : (
              <div className="grid gap-6">
                {filteredReservations.map((reservation) => {
                  const user = users.find(u => u.id === reservation.userId);
                  return (
                    <div
                      key={reservation.id}
                      className={`bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 shadow-lg hover:shadow-xl ${
                        reservation.status === 'cancelled' ? 'opacity-75' : ''
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  reservation.status === 'active'
                                    ? 'bg-green-500'
                                    : reservation.status === 'cancelled'
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500'
                                }`}></div>
                                <h3 className={`text-xl font-semibold ${
                                  reservation.status === 'cancelled' ? 'line-through text-gray-400' : ''
                                }`}>
                                  Cabina {reservation.boothId === 1 ? 'Premium' : 'Estándar'}
                                </h3>
                              </div>
                              <div className={`space-y-2 ${
                                reservation.status === 'cancelled' ? 'text-gray-400' : ''
                              }`}>
                                <p className="flex items-center gap-2">
                                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {new Date(reservation.startTime.toDate()).toLocaleDateString()}
                                </p>
                                <p className="flex items-center gap-2">
                                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {new Date(reservation.startTime.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="flex items-center gap-2">
                                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {reservation.duration} {reservation.duration === 1 ? 'hora' : 'horas'}
                                </p>
                                <p className={`font-semibold flex items-center gap-2 ${
                                  reservation.status === 'cancelled' ? 'text-gray-400' : 'text-green-400'
                                }`}>
                                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  ${reservation.totalPrice}
                                </p>
                              </div>
                            </div>
                            <div className={`space-y-4 ${
                              reservation.status === 'cancelled' ? 'text-gray-400' : ''
                            }`}>
                              <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <h3 className="text-xl font-semibold">Datos del Usuario</h3>
                              </div>
                              {user ? (
                                <div className="space-y-2">
                                  <p className="flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="flex items-center gap-2 break-all">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="truncate">{user.email}</span>
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {user.phone || 'No especificado'}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-gray-400">Usuario no encontrado</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center md:justify-end md:w-40">
                          {reservation.status === 'active' && (
                            <button
                              onClick={() => handleCancelReservation(reservation.id)}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-md transition-all duration-300 flex items-center gap-1.5 text-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {users.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No hay usuarios</p>
            ) : (
              <div className="grid gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-gray-300">{user.email}</p>
                        <p className="text-gray-300">{user.phone}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full border ${
                          user.isAdmin
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500'
                            : 'bg-gray-500/20 text-gray-300 border-gray-500'
                        }`}>
                          {user.isAdmin ? 'Administrador' : 'Usuario'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {user.isAdmin ? (
                          <button
                            onClick={() => handleRemoveAdmin(user.id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300"
                          >
                            Remover Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMakeAdmin(user.id)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300"
                          >
                            Hacer Admin
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Admin; 