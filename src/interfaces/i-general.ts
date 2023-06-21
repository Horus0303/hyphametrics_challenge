export interface IEnvironment {
	port: number;
	db: {
		host: string;
		name: string;
	};
}
