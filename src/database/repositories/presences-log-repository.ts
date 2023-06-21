import { BaseRepository } from './base-repository';
import { Db } from 'mongodb';
import { IPresencesLog } from '../../interfaces';

export class PresencesLogRepository extends BaseRepository<IPresencesLog> {
	constructor(connection: Db) {
		super(connection, 'hd_logpresences');
		this.collection = connection.collection('hd_logpresences');
	}

	async create(item: any): Promise<IPresencesLog> {
		const result = await this.collection.insertOne(item);
		return result[0];
	}

	async getAll(): Promise<any[]> {
		return await this.collection.find().toArray();
	}
}
