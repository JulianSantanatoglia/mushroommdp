import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Servicios = () => {
  const serviciosSonido = [
    {
      titulo: "Sonido Profesional",
      descripcion:
        "Equipamiento de alta calidad para eventos de cualquier tamaño.",
      icono: (
        <svg
          className="w-10 h-10 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      ),
    },
    {
      titulo: "Iluminación",
      descripcion:
        "Sistemas profesionales para crear ambientes únicos y visuales.",
      icono: (
        <svg
          className="w-10 h-10 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
    {
      titulo: "Efectos Especiales",
      descripcion:
        "Humo, niebla y otros efectos para una experiencia inmersiva.",
      icono: (
        <svg
          className="w-10 h-10 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.2V9.5m-8 8.6l-3.2-3.2m6.4 6.4l-3.2-3.2m0 0V9.5"
          />
        </svg>
      ),
    },
    {
      titulo: "Equipamiento Completo",
      descripcion: "Todo lo necesario en un solo lugar, fácil y conveniente.",
      icono: (
        <svg
          className="w-10 h-10 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      ),
    },
  ];

  const serviciosEspacio = [
    {
      titulo: "Espacio de Práctica",
      descripcion: "Sala equipada para ensayos y perfeccionamiento.",
      icono: (
        <svg
          className="w-10 h-10 text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      ),
    },
    {
      titulo: "Grabación de Sets",
      descripcion:
        "Grabación profesional de audio y video de tus sets en vivo.",
      icono: (
        <svg
          className="w-10 h-10 text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m-4-7.072a5 5 0 010 7.072m-1.964-7.072a5 5 0 010 7.072M6.464 16.364a5 5 0 010-7.072m9.757-7.072a9 9 0 00-12.728 0m12.728 0a9 9 0 0112.728 0"
          />
        </svg>
      ),
    },
    {
      titulo: "Streaming",
      descripcion: "Transmite tus actuaciones en vivo a todo el mundo.",
      icono: (
        <svg
          className="w-10 h-10 text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-.447.894L15 14m5 1.228A9.033 9.033 0 0020.049 15m-5 5v-5m0-5l-4.553 2.276A1 1 0 0110 10.382v6.764a1 1 0 01.447.894L15 14m-5 1.228A9.033 0 013.951 15m5-5v5"
          />
        </svg>
      ),
    },
  ];

  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRotation((prevRotation) => prevRotation + 2);
    }, 50);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-950">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-indigo-500/5 animate-gradient-x" />

          <motion.div
            style={{ rotate: `${rotation}deg` }}
            className="absolute top-1/4 left-1/4 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl"
          />
          <motion.div
            style={{ rotate: `${-rotation}deg` }}
            className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-indigo-600/10 rounded-full blur-2xl"
          />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)] opacity-50" />
        </div>

        <div className="relative z-20 text-center px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 md:mb-8"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg
                className="w-8 h-8 md:w-10 md:h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl md:text-3xl font-semibold mb-3 md:mb-4 text-white"
          >
            Servicios Destacados
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-md md:text-lg text-gray-200 max-w-2xl mx-auto"
          >
            Explora nuestras soluciones para llevar tu evento o proyecto musical
            al siguiente nivel.
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
      </motion.div>

      <section className="py-10 md:py-12">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-semibold text-white mb-6 md:mb-8 text-center"
          >
            ¿Qué necesitas?
          </motion.h2>
          <div className="md:grid md:grid-cols-2 md:gap-6 lg:gap-8">
            <div className="mb-8 md:mb-0">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4 text-center"
              >
                Alquiler de Sonido y Equipamiento
              </motion.h3>
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {serviciosSonido.map((servicio, index) => (
                  <motion.div
                    key={servicio.titulo}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-indigo-900/20 backdrop-blur-md rounded-xl p-4 md:p-6 border border-indigo-800/20 hover:border-blue-400/30 transition-all duration-300 flex flex-col justify-between h-full"
                  >
                    <div className="mb-3 md:mb-4 flex justify-center md:justify-start">
                      <div className="w-10 h-10 rounded-md flex items-center justify-center bg-indigo-800/30">
                        {servicio.icono}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-1 md:mb-2 text-white text-center md:text-left">
                        {servicio.titulo}
                      </h4>
                      <p className="text-gray-300 text-sm text-center md:text-left">
                        {servicio.descripcion}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4 text-center"
              >
                Espacio para Práctica y Grabación
              </motion.h3>
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {serviciosEspacio.map((servicio, index) => (
                  <motion.div
                    key={servicio.titulo}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-indigo-900/20 backdrop-blur-md rounded-xl p-4 md:p-6 border border-indigo-800/20 hover:border-indigo-400/30 transition-all duration-300 flex flex-col justify-between h-full"
                  >
                    <div className="mb-3 md:mb-4 flex justify-center md:justify-start">
                      <div className="w-10 h-10 rounded-md flex items-center justify-center bg-bg-indigo-800/30">
                        {servicio.icono}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-1 md:mb-2 text-white text-center md:text-left">
                        {servicio.titulo}
                      </h4>
                      <p className="text-gray-300 text-sm text-center md:text-left">
                        {servicio.descripcion}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Servicios;
