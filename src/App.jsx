import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Servicios from './pages/Servicios';
import Reservas from './pages/Reservas';
import Sets from './pages/Sets';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import WhatsAppButton from './components/WhatsAppButton';

function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      <AnimatePresence mode="wait">
        <main key={location.pathname} className="flex-grow w-full">
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/galeria" element={<Gallery />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/sets" element={<Sets />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </AnimatePresence>
      <WhatsAppButton />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
