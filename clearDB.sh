#!/bin/bash

# MongoDB Configuration
MONGODB_HOST="localhost"
MONGODB_PORT="27017"
MONGODB_DB="files_manager"

# Redis Configuration
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_DB="0"  # Redis database number to flush

# Clear MongoDB Database
echo "Clearing MongoDB database..."
mongo --host $MONGODB_HOST --port $MONGODB_PORT <<EOF
use $MONGODB_DB
db.dropDatabase()
EOF
echo "MongoDB database cleared."

# Clear Redis Database
echo "Clearing Redis database..."
redis-cli -h $REDIS_HOST -p $REDIS_PORT -n $REDIS_DB flushdb
echo "Redis database cleared."

# clear Old files in store
rm -rf /tmp/files_manager/*

echo "All databases cleared successfully."

curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com", "password": "toto1234!" }' ; echo ""
{"id":"66451d67cd515b21b5501a51","email":"bob@dylan.com"}
{"token":"6bf039e8-a4ec-4080-ad46-ea20971abdc2"}
{"id":"66451de7cd515b21b5501a52","userId":"66451d67cd515b21b5501a51","name":"myText.txt","type":"file","isPublic":false,"parentId":0}
