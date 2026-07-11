// Flag de entorno de pruebas. Se activa con VITE_TEST_MODE=true (ver .env.development).
// Al no estar seteada en build de producción, Vite reemplaza esto por `false` y elimina
// por dead-code-elimination todo lo que dependa de este flag — nunca llega al bundle final.
export const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true'
