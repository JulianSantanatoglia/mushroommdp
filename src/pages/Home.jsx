import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Home = () => {
  const stats = [
    { number: "+10", text: "Años de experiencia" },
    { number: "+50", text: "Eventos al año" },
    { number: "24/7", text: "Respuesta inmediata" },
  ];

  const plans = [
    {
      title: "Alquiler de Equipos",
      description: "Sonido, iluminación y efectos especiales para tu evento.",
      features: [
        "Parlantes profesionales",
        "Consolas de mezcla",
        "Micrófonos inalámbricos",
        "Iluminación espectacular (luces, láser)",
        "Máquina de humo",
      ],
      price: "Consultar",
    },
    {
      title: "Espacio para Artistas",
      description: "Sala equipada para práctica, grabación y streaming.",
      features: [
        "Sala de ensayo insonorizada",
        "Equipamiento de grabación disponible",
        "Conexión a internet de alta velocidad",
        "Soporte técnico opcional",
        "Ideal para streaming",
      ],
      price: "Consultar",
    },
  ];

  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRotation((prevRotation) => prevRotation + 1);
    }, 75);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 to-black text-white">
      <section className="relative py-24 md:py-36 w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/70" />
          <img
            src="images/banner-2.jpg"
            alt="Banner de Mushroom-mdp"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-transparent to-indigo-400/10 animate-gradient-x" />
          <motion.div
            style={{ rotate: `${rotation}deg` }}
            className="absolute top-1/4 left-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-xl"
          />
          <motion.div
            style={{ rotate: `${-rotation * 0.8}deg` }}
            className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-indigo-500/10 rounded-full blur-xl"
          />
          <motion.div
            style={{ rotate: `${rotation * 1.2}deg` }}
            className="absolute top-1/3 right-1/4 w-32 h-32 bg-blue-300/10 rounded-full blur-xl"
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:8rem_8rem] [mask-image:radial-gradient(ellipseellipse_80%_50%_at_50%_50%,black,transparent)] opacity-30" />
        </div>

        <div className="relative z-20 w-full px-4 md:container md:mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold text-white mb-4"
          >
            Mushroom mdp
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8"
          >
            Sonido para tu evento, espacio para tu música.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <a
              href="/contacto"
              className="inline-block bg-transparent border-2 border-blue-300 hover:bg-blue-300 hover:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 text-blue-300 hover:text-white font-medium py-3 px-6 rounded-md shadow-md transition-colors duration-300"
            >
              Pedir presupuesto
            </a>
          </motion.div>
        </div>
      </section>

      <section className="py-20 w-full bg-transparent">
        <div className="w-full px-6 md:container md:mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="p-8 rounded-xl shadow-lg bg-slate-900/50 backdrop-blur-sm border border-slate-800"
            >
              <p className="text-4xl font-bold text-teal-400 mb-3">
                {stat.number}
              </p>
              <p className="text-gray-400 text-lg">{stat.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 w-full bg-transparent">
        <div className="w-full px-6 md:container md:mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:order-1"
          >
            <h2 className="text-4xl font-semibold text-white mb-8">
              Sobre Nosotros
            </h2>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              Profesionales con más de 10 años de experiencia en el mercado,
              creando experiencias sonoras y visuales impactantes. Ofrecemos un
              servicio integral para eventos y artistas, llevando nuestros
              equipos de alta calidad directamente a tu lugar en nuestro propio
              transporte. Realizamos pruebas de sonido exhaustivas y nos
              adaptamos acústicamente a cada espacio para garantizar una calidad
              sonora óptima.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Además, contamos con nuestro propio espacio equipado donde podrás
              practicar y grabar tus sets con la mejor tecnología a tu
              disposición. En Mushroom-mdp, nos apasiona apoyar tu visión
              creativa con profesionalismo y dedicación.{" "}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:order-2 rounded-xl overflow-hidden shadow-xl"
          >
            <img
              src="images/imagen-4.jpg"
              alt="Nuestro Espacio y Servicios"
              className="w-full h-full object-cover"
              style={{ maxHeight: "500px" }}
            />
          </motion.div>
        </div>
      </section>

      <section className="py-20 w-full bg-transparent">
        <div className="w-full px-6 md:container md:mx-auto">
          <h2 className="text-4xl font-semibold text-white text-center mb-16">
            Nuestros Servicios
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-lg p-12 flex flex-col items-center justify-center h-full hover:shadow-xl transition-shadow duration-300"
                style={{ maxWidth: "400px" }}
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-teal-400 mb-4">
                    {plan.title}
                  </h3>
                  <p className="text-gray-400 mb-6">{plan.description}</p>
                  <ul className="list-none space-y-2 mb-8">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="text-gray-300 text-sm flex items-center"
                      >
                        <svg
                          className="w-5 h-5 mr-3 text-teal-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-3xl font-bold text-white mb-6">
                    {plan.price}
                  </p>
                  <a
                    href="/contacto"
                    className="inline-block bg-transparent border-2 border-teal-400 hover:bg-teal-400 hover:border-teal-400 focus:ring-2 focus:ring-teal-300 focus:ring-opacity-50 text-teal-400 hover:text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-300"
                  >
                    Pedir presupuesto
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
