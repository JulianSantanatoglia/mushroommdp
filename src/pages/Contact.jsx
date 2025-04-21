import { useState } from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error on change
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', phone: '', message: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Por favor, ingresa tu nombre.';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Por favor, ingresa tu email.';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Por favor, ingresa un email válido.';
      isValid = false;
    }

    if (formData.phone.trim() && !/^[0-9\s+-]*$/.test(formData.phone)) {
      newErrors.phone = 'Por favor, ingresa un número de teléfono válido.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Por favor, ingresa tu mensaje.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you would typically send the form data to your backend
      console.log('Form submitted:', formData);
      // Reset form after submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
      alert('¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-950 via-blue-950 to-slate-950 text-white">
      <section className="py-20 md:py-32 w-full">
        <div className="w-full px-4 md:container md:mx-auto">
          <div className="w-full md:max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Contacto</h1>
              <p className="text-xl text-gray-300">
                ¿Tienes alguna pregunta o deseas solicitar un presupuesto? Estamos aquí para ayudarte.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-indigo-900/20 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-indigo-800/20 p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 bg-indigo-950/50 border ${
                        errors.name ? 'border-red-500' : 'border-indigo-800/30'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400`}
                      placeholder="Tu nombre"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 bg-indigo-950/50 border ${
                        errors.email ? 'border-red-500' : 'border-indigo-800/30'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400`}
                      placeholder="tu@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-indigo-950/50 border ${
                      errors.phone ? 'border-red-500' : 'border-indigo-800/30'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400`}
                    placeholder="Tu número de teléfono"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    className={`w-full px-4 py-3 bg-indigo-950/50 border ${
                      errors.message ? 'border-red-500' : 'border-indigo-800/30'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 resize-none`}
                    placeholder="Cuéntanos sobre tu evento para que podamos ofrecerte la mejor solución."
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary w-full md:w-auto"
                  >
                    Enviar Mensaje
                  </button>
                </div>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="text-center p-6 rounded-lg bg-indigo-900/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300 border border-indigo-800/20">
                <div className="text-blue-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-1">Teléfono</h3>
                <p className="text-gray-300">+54 9 223 123-4567</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-indigo-900/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300 border border-indigo-800/20">
                <div className="text-blue-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-1">Email</h3>
                <p className="text-gray-300">info@mushroommdp.com</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-indigo-900/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300 border border-indigo-800/20">
                <div className="text-blue-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-1">Ubicación</h3>
                <p className="text-gray-300">Mar del Plata, Argentina</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;