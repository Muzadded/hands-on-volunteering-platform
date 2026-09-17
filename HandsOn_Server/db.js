import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '12345',
    database: 'HandsOn',
});

client.connect((err) => {
    if(err){
        console.error('connection error', err.stack);
    }else{
        console.log('connected to handson_db');
    }
});

export default client;
