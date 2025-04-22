import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./auth/LoginModal";
import RegisterModal from "./auth/RegisterModal";
import logoImage from "../../public/images/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const { user, logout, openLoginModal, openRegisterModal } = useAuth();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", path: "/" },
    { name: "Servicios", path: "/servicios" },
    { name: "Galería", path: "/galeria" },
    { name: "Reservas", path: "/reservas" },
    { name: "Contacto", path: "/contacto" },
  ];

  const isActive = (path) => location.pathname === path;

  if (!mounted) return null;

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-indigo-950/80 backdrop-blur-md shadow-lg py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <img
                  src={logoImage}
                  alt="Logo Mushroom Mdp"
                  className="w-auto h-8 md:h-10"
                />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(59, 130, 246, 0.5)",
                      "0 0 0 6px rgba(59, 130, 246, 0)",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                />
              </motion.div>
              <span className="text-white font-bold text-xl hidden sm:block"></span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive(link.path)
                        ? "text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {isActive(link.path) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-indigo-600/30 rounded-lg -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <span className="relative z-10">{link.name}</span>
                    {isActive(link.path) && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                        layoutId="underline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                ))}
              </div>

              <div className="flex items-center space-x-4 border-l border-slate-700 pl-6">
                {user ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={logout}
                      className="px-4 py-2 text-white rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-all duration-300"
                    >
                      Cerrar Sesión
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={openLoginModal}
                        className="px-4 py-2 text-white rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-all duration-300"
                      >
                        Iniciar Sesión
                      </button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={openRegisterModal}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20"
                      >
                        Registrarse
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <motion.span
                  animate={{
                    rotate: isOpen ? 45 : 0,
                    y: isOpen ? 8 : 0,
                  }}
                  className="block w-full h-0.5 bg-white rounded-full transform transition-all duration-300"
                />
                <motion.span
                  animate={{
                    opacity: isOpen ? 0 : 1,
                  }}
                  className="block w-full h-0.5 bg-white rounded-full transition-all duration-300"
                />
                <motion.span
                  animate={{
                    rotate: isOpen ? -45 : 0,
                    y: isOpen ? -8 : 0,
                  }}
                  className="block w-full h-0.5 bg-white rounded-full transform transition-all duration-300"
                />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-indigo-950/90 backdrop-blur-md"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`px-4 py-3 rounded-lg transition-all duration-300 ${
                        isActive(link.path)
                          ? "bg-indigo-800/50 text-white"
                          : "text-gray-300 hover:bg-indigo-800/30 hover:text-white"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="border-t border-slate-700 pt-4 mt-2">
                    {user ? (
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="w-full px-4 py-3 text-white rounded-lg text-center bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-all duration-300"
                      >
                        Cerrar Sesión
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            openLoginModal();
                            setIsOpen(false);
                          }}
                          className="w-full px-4 py-3 text-white rounded-lg text-center bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-all duration-300"
                        >
                          Iniciar Sesión
                        </button>
                        <button
                          onClick={() => {
                            openRegisterModal();
                            setIsOpen(false);
                          }}
                          className="w-full mt-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-center transition-all duration-300 shadow-lg shadow-blue-500/20"
                        >
                          Registrarse
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      <LoginModal />
      <RegisterModal />
    </>
  );
};

export default Navbar;
