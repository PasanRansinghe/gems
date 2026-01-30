require('dotenv').config();

async function testDatabase() {
  console.log('🧪 Testing MariaDB connection...');
  console.log('📋 Connection details:');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   User: ${process.env.DB_USER}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  
  try {
    // Try the simple connection first
    const { testSimpleConnection } = require('./config/db-simple');
    console.log('🔧 Trying simple connection method...');
    const simpleConnected = await testSimpleConnection();
    
    if (simpleConnected) {
      console.log('✅ Simple connection method worked!');
      return;
    }
  } catch (error) {
    console.log('⚠️ Simple method failed, trying advanced method...');
  }
  
  try {
    // Try advanced connection method
    const { testConnection } = require('./config/db');
    const advancedConnected = await testConnection();
    
    if (advancedConnected) {
      console.log('✅ Advanced connection method worked!');
      return;
    }
  } catch (error) {
    console.error('❌ All connection methods failed');
    console.error('💡 Please check:');
    console.error('1. Is MariaDB running?');
    console.error('2. Are the credentials in .env correct?');
    console.error('3. Does the database "myapp" exist?');
  }
  
  process.exit(1);
}

testDatabase();