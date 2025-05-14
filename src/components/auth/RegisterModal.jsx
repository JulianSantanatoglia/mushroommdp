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
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { signup, isRegisterModalOpen, closeModals, openLoginModal } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'El correo electrónico es requerido';
    if (!emailRegex.test(email)) return 'Ingresa un correo electrónico válido (ejemplo@dominio.com)';
    return '';
  };

  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password)
    };
    return validations;
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setValidationErrors(prev => ({
      ...prev,
      email: validateEmail(newEmail)
    }));
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const passwordValidations = validatePassword(newPassword);
    setValidationErrors(prev => ({
      ...prev,
      password: passwordValidations
    }));
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setValidationErrors(prev => ({
      ...prev,
      confirmPassword: newConfirmPassword !== password ? 'Las contraseñas no coinciden' : ''
    }));
  };

  if (!isRegisterModalOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const emailError = validateEmail(email);
    const passwordValidations = validatePassword(password);
    const confirmPasswordError = confirmPassword !== password ? 'Las contraseñas no coinciden' : '';

    if (emailError || !Object.values(passwordValidations).every(Boolean) || confirmPasswordError) {
      setValidationErrors({
        email: emailError,
        password: passwordValidations,
        confirmPassword: confirmPasswordError
      });
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
              onChange={handleEmailChange}
              className={`w-full px-4 py-2 rounded-lg bg-slate-800 border ${
                validationErrors.email ? 'border-red-500' : 'border-slate-700'
              } focus:border-blue-500 focus:outline-none text-white`}
              required
            />
            {validationErrors.email && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
            )}
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
              onChange={handlePasswordChange}
              className={`w-full px-4 py-2 rounded-lg bg-slate-800 border ${
                Object.values(validationErrors.password || {}).some(v => !v) ? 'border-red-500' : 'border-slate-700'
              } focus:border-blue-500 focus:outline-none text-white`}
              required
            />
            <div className="mt-2 space-y-1">
              <div className="flex items-center space-x-2">
                {validationErrors.password?.length ? (
                  <svg className={`w-4 h-4 ${validationErrors.password.length ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {validationErrors.password.length ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="text-sm text-gray-400">Al menos 8 caracteres</span>
              </div>
              <div className="flex items-center space-x-2">
                {validationErrors.password?.uppercase !== undefined ? (
                  <svg className={`w-4 h-4 ${validationErrors.password.uppercase ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {validationErrors.password.uppercase ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="text-sm text-gray-400">Al menos una letra mayúscula</span>
              </div>
              <div className="flex items-center space-x-2">
                {validationErrors.password?.number !== undefined ? (
                  <svg className={`w-4 h-4 ${validationErrors.password.number ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {validationErrors.password.number ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="text-sm text-gray-400">Al menos un número</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={`w-full px-4 py-2 rounded-lg bg-slate-800 border ${
                validationErrors.confirmPassword ? 'border-red-500' : 'border-slate-700'
              } focus:border-blue-500 focus:outline-none text-white`}
              required
            />
            {validationErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
            )}
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
              className="w-1/2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20"
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