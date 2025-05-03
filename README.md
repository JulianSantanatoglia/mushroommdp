# Mushroom App

Aplicación web para reservas de cabinas de DJ.

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm o yarn
- Cuenta de Firebase

## Configuración del Proyecto

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd mushroom-app
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Configurar variables de entorno:
- Copiar el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```
- Obtener las credenciales de Firebase:
  1. Ir a la consola de Firebase (https://console.firebase.google.com/)
  2. Seleccionar el proyecto
  3. Ir a Configuración del proyecto > Configuración general
  4. En "Tus aplicaciones", seleccionar la web (</>)
  5. Registrar la aplicación y copiar las credenciales
- Actualizar el archivo `.env` con las credenciales obtenidas

4. Inicializar Firebase:
- Habilitar Firestore en la consola de Firebase
- Configurar las reglas de seguridad de Firestore
- Iniciar sesión como administrador en la aplicación
- Ir a la página de Reservas
- Hacer clic en el botón "Inicializar Cabinas"

## Desarrollo

Para iniciar el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

## Estructura del Proyecto

```
mushroom-app/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── context/        # Contextos de React
│   ├── firebase/       # Configuración de Firebase
│   ├── pages/          # Páginas de la aplicación
│   ├── services/       # Servicios y lógica de negocio
│   └── styles/         # Estilos CSS
├── public/             # Archivos estáticos
└── .env                # Variables de entorno (no incluido en el repositorio)
```

## Seguridad

- Las credenciales de Firebase están protegidas en el archivo `.env`
- Las reglas de Firestore están configuradas para proteger los datos
- La autenticación es manejada por Firebase Auth

## Despliegue

Para construir la aplicación para producción:
```bash
npm run build
# o
yarn build
```

## Licencia

[MIT](LICENSE)
