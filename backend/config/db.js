const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'myapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+00:00',
  
  // MariaDB specific setting to handle authentication
  authPlugins: {
    mysql_native_password: () => require('mysql2/lib/auth/mysql_native_password')
  }
};

const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MariaDB database successfully!');
    
    // Check database version
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log(`📊 Database Version: ${rows[0].version}`);
    
    // Check current database
    const [dbRows] = await connection.execute('SELECT DATABASE() as current_db');
    console.log(`🗃️ Current Database: ${dbRows[0].current_db}`);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MariaDB connection failed:', error.message);
    console.error('💡 Troubleshooting tips:');
    console.error('1. Check if MariaDB service is running');
    console.error('2. Verify database credentials in .env file');
    console.error('3. Ensure user has correct privileges');
    return false;
  }
};

module.exports = { pool, testConnection };