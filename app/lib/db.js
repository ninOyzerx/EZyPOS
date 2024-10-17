// lib/db.js
import mysql from 'mysql2/promise';

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pos_db',
});

export default connection;
