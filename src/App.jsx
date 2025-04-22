import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Servicios from './pages/Servicios';
import Reservas from './pages/Reservas';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';

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
          </Routes>
        </main>
      </AnimatePresence>
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
