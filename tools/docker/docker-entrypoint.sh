#!/bin/bash
set -e

# Iniciar el servicio de MongoDB en segundo plano
mongod --fork --bind_ip_all --port 27017 --logpath /data/db/mongodb.log

# Esperar a que MongoDB esté listo
sleep 10

# Crear la colección viewershippresences si no existe
mongosh --eval 'db = db.getSiblingDB("metric_db"); if (!db.viewershippresences.countDocuments()) { db.createCollection("viewershippresences"); }'

# Importar las colecciones JSON
mongoimport --host localhost --port 27017 --db metric_db --collection hd_logpresences --file ./json/hd_logpresences.json --jsonArray

mongoimport --host localhost --port 27017 --db metric_db --collection viewershipcontents --file ./json/viewershipcontents.json --jsonArray

# Mantener el script en ejecución para mantener la conexión de MongoDB abierta
tail -f /dev/null
