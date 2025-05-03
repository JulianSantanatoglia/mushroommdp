import { db } from './config';
import { doc, setDoc } from 'firebase/firestore';

export const initializeBooths = async () => {
  try {
    // Cabina Premium
    await setDoc(doc(db, 'booths', '1'), {
      name: 'Cabina Premium',
      description: 'Cabina equipada con equipos de alta gama, ideal para grabaciones profesionales y sesiones de DJ avanzadas.',
      price: 2000,
      features: [
        'Pioneer DJM-900NXS2',
        'CDJ-3000 x 2',
        'Monitores KRK Rokit 8',
        'Aislamiento acústico premium',
        'Sistema de iluminación LED',
        'Mesa de mezclas profesional'
      ],
      image: '/images/cabina1.jpg'
    });

    // Cabina Estándar
    await setDoc(doc(db, 'booths', '2'), {
      name: 'Cabina Estándar',
      description: 'Cabina perfecta para practicar y sesiones de DJ principiantes o intermedios.',
      price: 1500,
      features: [
        'Pioneer DJM-450',
        'CDJ-2000NXS2 x 2',
        'Monitores KRK Rokit 5',
        'Aislamiento acústico estándar',
        'Iluminación básica',
        'Mesa de mezclas estándar'
      ],
      image: '/images/cabina2.jpg'
    });

    console.log('Booths initialized successfully');
  } catch (error) {
    console.error('Error initializing booths:', error);
    throw error;
  }
}; 