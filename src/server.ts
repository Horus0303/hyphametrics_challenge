import { Db, MongoClient } from 'mongodb';
import express, { Express } from 'express';
import { PresencesLogRepository, ViewerPresencesRepository, ViewerRepository } from './database/repositories';
import { globalConfig } from './config';
import { IEnvironment } from './interfaces';
import { ViewershipPresencesGenerator } from './viewer-presence';
import { constants } from './constants';

export class Server {
	public app: Express;
	private environment: IEnvironment;
	public connection: Db;

	constructor() {
		this.app = express();
		this.config();
	}

	config(): void {
		this.environment = globalConfig();
		this.app.set('port', this.environment.port);
	}

	async dbConnection(): Promise<Db> {
		const client = new MongoClient(this.environment.db.host);
		await client.connect();
		return client.db(this.environment.db.name);
	}

	async logic(): Promise<void> {
		/***** Create connection and declare repositories ******/
		const connection = await this.dbConnection();

		const viewershipCollection = new ViewerRepository(connection);
		const logPresencesCollection = new PresencesLogRepository(connection);
		const ViewerPresencesCollection = new ViewerPresencesRepository(connection);

		try {
			/***** Instance and run generate ******/
			const generator = new ViewershipPresencesGenerator(
				viewershipCollection,
				logPresencesCollection,
				ViewerPresencesCollection,
			);
			await generator.generate();
		} catch (error) {
			console.log(
				`${constants.colors.redColor} An unexpected error has occurred!!${constants.colors.reset}`,
			);

			throw new Error(error);
		}
	}
}
