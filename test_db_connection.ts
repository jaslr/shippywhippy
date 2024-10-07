import pg from 'pg';
const { Client } = pg;

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'shippywippy_db',
    user: 'chippy',
    password: 'new_secure_password'  // Use the new password you set
});

async function testConnection() {
    try {
        console.log('Attempting to connect to PostgreSQL...');
        await client.connect();
        console.log('Successfully connected to PostgreSQL');
        const res = await client.query('SELECT current_user, current_database()');
        console.log('Current user:', res.rows[0].current_user);
        console.log('Current database:', res.rows[0].current_database);
        await client.end();
    } catch (error) {
        console.error('Error connecting to PostgreSQL:', error);
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
    }
}

testConnection();