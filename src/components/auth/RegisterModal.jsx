import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const RegisterModal = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, isRegisterModalOpen, closeModals, openLoginModal } = useAuth();

  if (!isRegisterModalOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!firstName || !lastName) {
      setError('Por favor ingresa tu nombre y apellido');
      return;
    }

    if (!phone) {
      setError('Por favor ingresa tu número de teléfono');
      return;
    }

    try {
      await signup(email, password, firstName, lastName, phone);
    } catch (error) {
      console.error('Register error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres');
      } else if (error.code === 'auth/invalid-email') {
        setError('El correo electrónico no es válido');
      } else {
        setError(`Error: ${error.message}`);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900/90 backdrop-blur-md rounded-xl p-8 w-full max-w-md mx-4 relative"
      >
        <button
          onClick={closeModals}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-transparent"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">Crear Cuenta</h2>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Nombre</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Apellido</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none text-white"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none text-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none text-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none text-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none text-white"
              required
            />
          </div>
          <div className="flex justify-between space-x-4">
            <button
              type="button"
              onClick={() => {
                closeModals();
                openLoginModal();
              }}
              className="w-1/2 bg-slate-800/50 hover:bg-slate-700/50 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 border border-slate-700"
            >
              Volver
            </button>
            <button
              type="submit"
              className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Registrarse
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default RegisterModal; 