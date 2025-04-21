import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "../../public/images/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
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
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
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

          <div className="hidden md:flex items-center space-x-1">
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
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="ml-4"
            >
              <Link
                to="/contacto"
                className="relative px-5 py-2 text-white rounded-lg border border-blue-400/50 hover:border-blue-400 transition-all duration-300"
              >
                <span className="relative z-10">Contactar</span>
                <motion.div
                  className="absolute inset-0 bg-blue-500/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </Link>
            </motion.div>
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
                <Link
                  to="/contacto"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 px-4 py-3 text-white rounded-lg text-center border border-blue-400/50 hover:border-blue-400 transition-all duration-300"
                >
                  Contactar
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
