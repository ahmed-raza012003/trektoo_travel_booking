// lib/api/klookApi.js
const KLOOK_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://yourdomain.com/api/klook' 
  : 'http://localhost:8000/api/klook';

const LOCAL_API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://yourdomain.com/api'
  : 'http://localhost:8000/api';

export { KLOOK_API_BASE, LOCAL_API_BASE };
export default KLOOK_API_BASE; // Keep default export for backward compatibility