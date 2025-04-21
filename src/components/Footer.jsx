import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logoImage from "../../public/images/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-indigo-950/90 backdrop-blur-md border-t border-indigo-800/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center md:text-center"
          >
            <div className="flex items-center justify-center md:justify-center mb-4">
              <img
                src={logoImage}
                alt="Logo Mushroom Mdp"
                className="w-auto h-8 md:h-10 mr-2"
              />
              <h3 className="text-white font-bold text-xl">mushroom-mdp</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Sonido profesional para tus eventos. Calidad y experiencia a tu
              servicio.
            </p>
            <div className="flex space-x-4 justify-center md:justify-center">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                aria-label="Facebook"
              ></a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-pink-400 transition-colors duration-300"
                aria-label="Instagram"
              ></a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                aria-label="Twitter"
              ></a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-center md:text-center"
          >
            <h3 className="text-white font-semibold text-lg mb-4">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/servicios"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link
                  to="/galeria"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Galería
                </Link>
              </li>
              <li>
                <Link
                  to="/contacto"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center md:text-center"
          >
            <h3 className="text-white font-semibold text-lg mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-center md:justify-center text-gray-300">
                <svg
                  className="w-5 h-5 mr-2 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Mar del Plata, Argentina
              </li>
              <li className="flex items-center justify-center md:justify-center text-gray-300">
                <svg
                  className="w-5 h-5 mr-2 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                info@mushroommdp.com
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
