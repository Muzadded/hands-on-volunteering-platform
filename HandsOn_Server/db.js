const {Client} = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '1234',
    database: 'handson_db',
});

client.connect((err) => {
    if(err){
        console.error('connection error', err.stack);
    }else{
        console.log('connected to handson_db');
    }
});

module.exports = client;
