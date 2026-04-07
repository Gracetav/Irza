const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    console.log('--- Database Migration Started ---');
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
        const queries = sql.split(';').filter(q => q.trim() !== '');

        for (let query of queries) {
            await connection.query(query);
            console.log('Executed query successfully.');
        }

        console.log('--- Migration Completed Successfully! ---');
        console.log('Admin account created: admin@motoparts.com / admin123');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await connection.end();
    }
}

migrate();
