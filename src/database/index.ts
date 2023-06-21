import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const dbName = 'nombre_de_tu_base_de_datos';

const client = new MongoClient(url);

client.connect((err) => {
	if (err) {
		console.error('Error al conectar a MongoDB:', err);
		return;
	}

	console.log('Conexión exitosa a MongoDB');

	client.close(); // Cerrar la conexión cuando hayas terminado
});
