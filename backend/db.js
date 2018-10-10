const mongodb = require('mongodb');
const { MongoClient } = mongodb;
const MONGO_URL = `mongodb://localhost:27017/eshop`;

let _db;

const INITIALISE_DATABASE = cb => {
    if(_db) {
        console.log('Database is already initialised');
        return cb(null,_db);
    }
    MongoClient.connect(MONGO_URL,{ 
        useNewUrlParser: true
    }).then(client => {
        _db = client;
        cb(null,_db);
    }).catch(err => {
        cb(err);
    });
};

const GET_DATABASE = () => {    
    if(!_db) {
        throw Error('Database not initialised');
    }
    return _db;
}

module.exports = {
    INITIALISE_DATABASE,
    GET_DATABASE
}