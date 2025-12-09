const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_FILE = path.join(__dirname, 'config.json');

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  database_path: path.join(os.homedir(), '.prompt-refiner', 'prompt_refiner.db'),
  description: 'Change database_path to your preferred location. Use :memory: for no persistence.'
};

/**
 * Load configuration from config.json or create default
 */
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
      const config = JSON.parse(configData);
      
      // Expand ~ to home directory if present
      if (config.database_path && config.database_path.startsWith('~')) {
        config.database_path = config.database_path.replace('~', os.homedir());
      }
      
      return config;
    } else {
      // Create default config file on first run
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
      console.error(`Created default config at: ${CONFIG_FILE}`);
      console.error('Edit this file to change database location.\n');
      return DEFAULT_CONFIG;
    }
  } catch (error) {
    console.error('Error loading config:', error.message);
    return DEFAULT_CONFIG;
  }
}

/**
 * Get database path with graceful fallback
 * Returns: { path: string, location: string }
 */
function getDatabasePath() {
  const config = loadConfig();
  let dbPath = config.database_path;
  
  // If in-memory is explicitly set
  if (dbPath === ':memory:') {
    console.error('\n' + '='.repeat(60));
    console.error('NOTICE: Using in-memory database');
    console.error('Your prompt history will NOT be saved between sessions');
    console.error('='.repeat(60) + '\n');
    return { path: ':memory:', location: 'memory' };
  }
  
  // Try to use configured path
  try {
    const dbDir = path.dirname(dbPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Test write access by attempting to create/open the database file
    const testPath = path.join(dbDir, '.test_write');
    fs.writeFileSync(testPath, 'test');
    fs.unlinkSync(testPath);
    
    console.error(`✓ Using database: ${dbPath}\n`);
    return { path: dbPath, location: 'configured' };
    
  } catch (error) {
    console.error(`⚠ Warning: Cannot use configured path (${error.message})`);
    console.error('Trying fallback locations...\n');
  }
  
  // Fallback 1: Temp directory
  try {
    const tempDir = path.join(os.tmpdir(), '.prompt-refiner');
    const tempDbPath = path.join(tempDir, 'prompt_refiner.db');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Test write access
    const testPath = path.join(tempDir, '.test_write');
    fs.writeFileSync(testPath, 'test');
    fs.unlinkSync(testPath);
    
    console.error(`✓ Using temp directory: ${tempDbPath}`);
    console.error('⚠ Note: This location may be cleaned up by the system\n');
    return { path: tempDbPath, location: 'temp' };
    
  } catch (error) {
    console.error(`⚠ Warning: Cannot use temp directory (${error.message})`);
    console.error('Falling back to in-memory database...\n');
  }
  
  // Fallback 2: In-memory (last resort)
  console.error('\n' + '='.repeat(60));
  console.error('WARNING: Using in-memory database (last resort)');
  console.error('Your prompt history will NOT be saved between sessions');
  console.error('='.repeat(60) + '\n');
  return { path: ':memory:', location: 'memory' };
}

module.exports = {
  loadConfig,
  getDatabasePath
};
