import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRotation((prevRotation) => prevRotation + 0.8);
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  const images = [
    { id: 1, src: "images/imagen-1.jpg", alt: "Evento 1" },
    { id: 2, src: "images/imagen-2.jpg", alt: "Evento 2" },
    { id: 3, src: "images/imagen-3.jpg", alt: "Evento 3" },
    { id: 4, src: "images/imagen-4.jpg", alt: "Evento 4" },
    { id: 5, src: "images/imagen-5.jpg", alt: "Evento 5" },
    { id: 6, src: "images/imagen-6.jpg", alt: "Evento 6" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        transition={{ duration: 0.8 }}
        className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-indigo-950 to-black text-white"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-950 z-0" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-indigo-500/5 animate-gradient-x" />

          <motion.div
            style={{ rotate: `${rotation}deg` }}
            className="absolute top-1/3 left-1/3 w-32 h-32 bg-blue-600/5 rounded-full blur-xl"
          />
          <motion.div
            style={{ rotate: `${-rotation * 1.1}deg` }}
            className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-indigo-600/5 rounded-full blur-xl"
          />
          <motion.div
            style={{ rotate: `${rotation * 0.9}deg` }}
            className="absolute top-1/4 right-1/4 w-24 h-24 bg-blue-400/5 rounded-full blur-xl"
          />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:8rem_8rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)] opacity-20" />
        </div>

        <div className="relative z-20 text-center px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
          >
            Nuestra Galería
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto"
          >
            Revive los momentos más destacados de nuestros eventos y
            celebraciones.
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
      </motion.div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group shadow-md hover:shadow-lg transition-shadow duration-300"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m14-4l-3-3m0 6l-3 3"
                  />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              onClick={() => setSelectedImage(null)}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-auto rounded-lg shadow-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
