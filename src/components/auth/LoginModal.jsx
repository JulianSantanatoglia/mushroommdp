import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const LoginModal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: ''
  });
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const { login, loginWithGoogle, resetPassword, isLoginModalOpen, closeModals, openRegisterModal, loading } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'El correo electrónico es requerido';
    if (!emailRegex.test(email)) return 'Ingresa un correo electrónico válido (ejemplo@dominio.com)';
    return '';
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setValidationErrors(prev => ({
      ...prev,
      email: validateEmail(newEmail)
    }));
  };

  const handleResetEmailChange = (e) => {
    const newEmail = e.target.value;
    setResetEmail(newEmail);
    setValidationErrors(prev => ({
      ...prev,
      email: validateEmail(newEmail)
    }));
  };

  if (!isLoginModalOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const emailError = validateEmail(email);
    if (emailError) {
      setValidationErrors(prev => ({
        ...prev,
        email: emailError
      }));
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-credential') {
        setError('Correo electrónico o contraseña incorrectos');
      } else if (error.code === 'auth/user-not-found') {
        setError('No existe una cuenta con este correo electrónico');
      } else if (error.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Por favor, intente más tarde');
      } else if (error.code === 'auth/invalid-email') {
        setError('El correo electrónico no es válido');
      } else if (error.code === 'auth/user-disabled') {
        setError('Esta cuenta ha sido deshabilitada');
      } else {
        setError(`Error al iniciar sesión: ${error.message}`);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      setError(`Error al iniciar sesión con Google: ${error.message}`);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    const emailError = validateEmail(resetEmail);
    if (emailError) {
      setValidationErrors(prev => ({
        ...prev,
        email: emailError
      }));
      return;
    }

    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No existe una cuenta con este correo electrónico');
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
          disabled={loading}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!isResetPassword ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Iniciar Sesión</h2>
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
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
                  disabled={loading}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none text-white"
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20 relative"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Iniciar sesión con Google</span>
              </button>
              <div className="text-center space-y-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsResetPassword(true);
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm inline-block"
                  style={{ pointerEvents: loading ? 'none' : 'auto' }}
                >
                  ¿Olvidaste tu contraseña?
                </a>
                <p className="text-gray-400 text-sm">
                  ¿No tienes cuenta?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      closeModals();
                      openRegisterModal();
                    }}
                    className="text-blue-400 hover:text-blue-300 inline-block"
                    style={{ pointerEvents: loading ? 'none' : 'auto' }}
                  >
                    Regístrate
                  </a>
                </p>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Recuperar Contraseña</h2>
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            {resetSent ? (
              <div className="bg-green-500/20 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-4">
                Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Correo Electrónico</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={handleResetEmailChange}
                    className={`w-full px-4 py-2 rounded-lg bg-slate-800 border ${
                      validationErrors.email ? 'border-red-500' : 'border-slate-700'
                    } focus:border-blue-500 focus:outline-none text-white`}
                    required
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>
                <div className="flex justify-between space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetPassword(false);
                      setResetSent(false);
                      setError('');
                    }}
                    className="w-1/2 bg-slate-800/50 hover:bg-slate-700/50 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 border border-slate-700"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20"
                  >
                    Enviar correo
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LoginModal; 