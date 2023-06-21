import express, { Express } from 'express';
import cluster from 'cluster';
import os from 'os';

export class Server {
	public app: Express;
	public numCPUs: number;

	constructor() {
		console.log(os);

		this.numCPUs = os.cpus().length;
		this.app = express();
	}

	start(): void {
		if (cluster.isPrimary) {
			for (let index = 0; index < this.numCPUs; index++) {
				cluster.fork();
			}

			cluster.on('exit', (worker) => {
				console.log(`Worker ${worker.process.pid} died`);
				console.log('Restarting worker...');
				cluster.fork();
			});
		} else {
			this.app.listen(8081, () => {
				console.log('🚀 Invoices service ready at:', 8081);
			});
		}
	}
}
