import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllReservations, updateReservation, cancelReservation } from '../services/reservationService';
import { makeUserAdmin, isUserAdmin } from '../services/adminService';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const allReservations = await getAllReservations();
      setReservations(allReservations);
    } catch (err) {
      setError('Error al cargar las reservas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReservation = async (reservationId, newStatus) => {
    try {
      await updateReservation(reservationId, { status: newStatus });
      await loadReservations();
    } catch (err) {
      setError('Error al actualizar la reserva');
      console.error(err);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      await cancelReservation(reservationId);
      await loadReservations();
    } catch (err) {
      setError('Error al cancelar la reserva');
      console.error(err);
    }
  };

  const handleMakeAdmin = async (e) => {
    e.preventDefault();
    try {
      await makeUserAdmin(adminEmail);
      setAdminEmail('');
      alert('Usuario convertido en admin exitosamente');
    } catch (err) {
      setError('Error al hacer admin al usuario');
      console.error(err);
    }
  };

  if (loading) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      
      {/* Sección para hacer admin a un usuario */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Hacer Admin a un Usuario</h2>
        <form onSubmit={handleMakeAdmin} className="flex gap-2">
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="Email del usuario"
            className="flex-1 p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Hacer Admin
          </button>
        </form>
      </div>

      {/* Lista de reservas */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold p-4 border-b">Reservas</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Usuario</th>
                <th className="p-4 text-left">Cabina</th>
                <th className="p-4 text-left">Fecha</th>
                <th className="p-4 text-left">Estado</th>
                <th className="p-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="border-t">
                  <td className="p-4">{reservation.id}</td>
                  <td className="p-4">{reservation.userId}</td>
                  <td className="p-4">{reservation.boothId}</td>
                  <td className="p-4">
                    {new Date(reservation.date.seconds * 1000).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded ${
                      reservation.status === 'active' ? 'bg-green-100 text-green-800' :
                      reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {reservation.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleUpdateReservation(reservation.id, 'completed')}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Completar
                          </button>
                          <button
                            onClick={() => handleCancelReservation(reservation.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 