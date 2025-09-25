// lib/api/klookApi.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production'
    ? 'https://v2.api.trektoo.com/api'
    : 'http://localhost:8000/api');

console.log('API Configuration:', {
  API_BASE,
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
});

export default API_BASE;