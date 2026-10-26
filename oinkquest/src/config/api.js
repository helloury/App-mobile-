// Endereço do backend. Defina EXPO_PUBLIC_API_URL no arquivo .env do app
// (ex.: EXPO_PUBLIC_API_URL=http://192.168.0.10:3000). No celular, "localhost" NÃO funciona:
// use o IP do computador que está rodando o backend, na mesma rede Wi-Fi.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');
export const TEMPO_LIMITE_MS = 30000;
