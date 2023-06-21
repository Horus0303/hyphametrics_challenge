import { Collection, Db } from 'mongodb';
import { IContent, IViewershipContent } from '../../interfaces';

export class ViewerRepository {
	private collection: Collection;

	constructor(connection: Db) {
		this.collection = connection.collection('viewershipcontents');
	}

	async create(item: IViewershipContent): Promise<IViewershipContent> {
		const result = await this.collection.insertOne(item);
		return result[0];
	}

	async getAll(): Promise<IContent[]> {
		const result = await this.collection.find().toArray();
		return result[0].metadata.contents;
	}
}
