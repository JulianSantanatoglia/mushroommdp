import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail,
  getAuth
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, enableNetwork, disableNetwork } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      enableNetwork(db).catch(console.error);
    };

    const handleOffline = () => {
      setIsOnline(false);
      disableNetwork(db).catch(console.error);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      try {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              setUser({ ...user, ...userDoc.data() });
            } else {
              setUser(user);
            }
          } catch (error) {
            console.error('Error loading user data:', error);
            setUser(user);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, firstName, lastName, phone) => {
    try {
      setError(null);
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userData = {
        firstName,
        lastName,
        email,
        phone,
        createdAt: new Date().toISOString(),
        provider: 'email'
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      setUser({ ...user, ...userData });
      setIsRegisterModalOpen(false);
      
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUser({ ...user, ...userDoc.data() });
      } else {
        setUser(user);
      }
      
      setIsLoginModalOpen(false);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      await signOut(auth);
      setUser(null);
      window.location.href = '/';
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!isOnline) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión.');
      }

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Tiempo de espera agotado. Por favor, intenta nuevamente.'));
        }, 30000);
      });

      const result = await Promise.race([
        signInWithPopup(auth, googleProvider),
        timeoutPromise
      ]);

      const user = result.user;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          const userData = {
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            email: user.email,
            phone: '',
            createdAt: new Date().toISOString(),
            photoURL: user.photoURL || '',
            provider: 'google'
          };

          await setDoc(doc(db, 'users', user.uid), userData);
          setUser({ ...user, ...userData });
        } else {
          setUser({ ...user, ...userDoc.data() });
        }

        setIsLoginModalOpen(false);
        return user;
      } catch (dbError) {
        console.error('Error handling Google user data:', dbError);
        if (dbError.code === 'failed-precondition') {
          throw new Error('Error al guardar los datos del usuario. Por favor, intenta nuevamente.');
        } else {
          throw new Error('Error al procesar los datos del usuario.');
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('El inicio de sesión fue cancelado');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Solicitud de inicio de sesión cancelada');
      } else if (error.code === 'auth/popup-blocked') {
        setError('El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes para este sitio.');
      } else if (error.message.includes('No hay conexión')) {
        setError(error.message);
      } else if (error.message.includes('Tiempo de espera agotado')) {
        setError(error.message);
      } else {
        setError(`Error al iniciar sesión con Google: ${error.message}`);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const closeModals = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    setError(null);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
    setError(null);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
    setError(null);
  };

  const loadUserData = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          ...user,
          ...userData
        });
      } else {
        // Si no existe el documento, lo creamos
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          phone: '',
          isAdmin: false,
          createdAt: new Date()
        });
        setUser({
          ...user,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          phone: '',
          isAdmin: false
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const value = {
    user,
    loading,
    error,
    isOnline,
    isLoginModalOpen,
    isRegisterModalOpen,
    signup,
    login,
    logout,
    loginWithGoogle,
    resetPassword,
    openLoginModal,
    openRegisterModal,
    closeModals
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 