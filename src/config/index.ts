import { config as dotenv } from 'dotenv';
dotenv({ path: `.env` });

const { env } = process;

export enum Environment {
	Local = 'local',
	Production = 'production',
	Development = 'development',
	Testing = 'testing',
}

export const globalConfig = (): any => ({
	environment: process.env.ENVIRONMENT || `${Environment.Local}`,
	port: +process.env.PORT,
	db: {
		host: process.env.DB_HOST,
		port: +process.env.DB_PORT || 8081,
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		name: process.env.DB_NAME,
	},
	cache: {
		host: process.env.CACHE_HOST,
		port: process.env.CACHE_PORT,
		password: process.env.CACHE_PASSWORD,
		ttl: +process.env.CACHE_TTL,
	},
	jwt: {
		secret: process.env.JWT_SECRET,
		expiresIn: process.env.JWT_EXPIRATION_TIME,
	},
	redis: {
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
		password: process.env.REDIS_PASSWORD,
		ttl: +process.env.CACHE_TTL,
	},
});
