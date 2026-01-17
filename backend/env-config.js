// Environment Configuration
module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'examp',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5500'
};
