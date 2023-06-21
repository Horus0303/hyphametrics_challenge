export interface IRepository<T> {
	create(item: T): Promise<T>;
	getById(id: any): Promise<T | null>;
}
