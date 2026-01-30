const mysql = require('mysql2');

// Create a simple connection without advanced authentication handling
const createSimpleConnection = () => {
  return mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'myapp',
    charset: 'utf8mb4'
  });
};

const testSimpleConnection = () => {
  return new Promise((resolve, reject) => {
    const connection = createSimpleConnection();
    
    connection.connect((err) => {
      if (err) {
        console.error('❌ Simple connection failed:', err.message);
        reject(err);
      } else {
        console.log('✅ Simple connection successful!');
        
        // Test a query
        connection.query('SELECT 1 + 1 AS solution', (error, results) => {
          if (error) {
            console.error('Query test failed:', error);
            reject(error);
          } else {
            console.log(`🧪 Query test passed: 1 + 1 = ${results[0].solution}`);
            connection.end();
            resolve(true);
          }
        });
      }
    });
  });
};

module.exports = { createSimpleConnection, testSimpleConnection };