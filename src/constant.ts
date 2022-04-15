export const __prod__ = process.env.ENVIRONMENT === 'production';
export const __dbName__ = process.env.DB_NAME;
export const __dbpassword__ = process.env.DB_PASSWORD;
export const __port__ = process.env.PORT;
export const __redisSecret__ = process.env.REDIS_SECRET || '';
export const COOKIE_NAME = 'qid';
export const __mailerUser__ = process.env.MAILER_USER;
export const __mailerPassword__ = process.env.MAILER_PASSWORD;

export const FORGET_PASSWORD_TOKEN = 'forget-password:'