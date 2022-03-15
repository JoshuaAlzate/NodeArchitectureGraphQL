export const __prod__ = process.env.ENVIRONMENT === 'production';
export const __dbName__ = process.env.DB_NAME;
export const __dbpassword__ = process.env.DB_PASSWORD;
export const __port__ = process.env.PORT;
export const __redisSecret__ = process.env.REDIS_SECRET || '';
export const COOKIE_NAME = 'qid';