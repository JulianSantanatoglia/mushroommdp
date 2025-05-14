import React, { useState, useEffect } from 'react';
import { getAllBooths } from '../services/boothService';
import ReservationForm from './ReservationForm';

const BoothList = () => {
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooth, setSelectedBooth] = useState(null);

  useEffect(() => {
    loadBooths();
  }, []);

  const loadBooths = async () => {
    try {
      setLoading(true);
      const allBooths = await getAllBooths();
      setBooths(allBooths);
    } catch (err) {
      setError('Error al cargar las cabinas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Cabinas Disponibles</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {booths.map((booth) => (
          <div
            key={booth.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{booth.name}</h3>
              <p className="text-gray-600 mb-4">{booth.description}</p>
              <p className="text-gray-800 font-medium mb-4">
                Precio: ${booth.price}/hora
              </p>
              
              {selectedBooth === booth.id ? (
                <div className="mt-4">
                  <ReservationForm boothId={booth.id} />
                  <button
                    onClick={() => setSelectedBooth(null)}
                    className="mt-4 text-blue-500 hover:text-blue-600"
                  >
                    Cancelar selección
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedBooth(booth.id)}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Reservar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoothList; 