import { Collection, Db } from 'mongodb';
import { IViewershipContent } from '../../interfaces';

export class ViewerPresencesRepository {
	private collection: Collection;

	constructor(connection: Db) {
		this.collection = connection.collection('viewershippresences');
	}

	async create(item: any): Promise<IViewershipContent> {
		await this.collection.deleteMany({});

		const result = await this.collection.insertOne(item);
		return result[0];
	}

	async getAll(): Promise<any[]> {
		const result = await this.collection.find().toArray();
		return result[0].metadata.contents;
	}
}
