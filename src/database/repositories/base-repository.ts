// BaseRepository.ts
import { Collection, Db } from 'mongodb';
import { IRepository } from '../../interfaces';

export abstract class BaseRepository<T> implements IRepository<T> {
	protected collection: Collection;

	constructor(protected db: Db, collectionName: string) {
		this.collection = db.collection(collectionName);
	}

	async create(item: T): Promise<T> {
		const result = await this.collection.insertOne(item);
		return result[0];
	}

	async getById(id: any): Promise<T | null> {
		return (await this.collection.findOne({ _id: id })) as T | null;
	}
}
