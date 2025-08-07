#!/usr/bin/env node

/**
 * Database initialization script
 * 
 * This script helps with initializing the PostgreSQL database for the application.
 * It creates the database if it doesn't exist and runs migrations and seeders.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  DB_HOST,
  DB_PORT,
  NODE_ENV
} = process.env;

if (!DB_USERNAME || !DB_PASSWORD || !DB_NAME || !DB_HOST || !DB_PORT) {
  console.error('Error: Database configuration is incomplete. Please check your .env file.');
  process.exit(1);
}

const runCommand = (command, options = {}) => {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    if (options.ignoreError) {
      console.warn(`Command failed, but continuing: ${command}`);
      return false;
    }
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
};

const createDatabase = () => {
  // Create database if it doesn't exist
  const createDbCommand = `npx sequelize-cli db:create --env ${NODE_ENV || 'development'}`;
  runCommand(createDbCommand, { ignoreError: true });
};

const runMigrations = () => {
  // Run migrations
  const migrateCommand = `npx sequelize-cli db:migrate --env ${NODE_ENV || 'development'}`;
  runCommand(migrateCommand);
};

const runSeeders = () => {
  // Run seeders
  const seedCommand = `npx sequelize-cli db:seed:all --env ${NODE_ENV || 'development'}`;
  runCommand(seedCommand, { ignoreError: true });
};

const main = () => {
  console.log('=== Database Initialization Script ===');
  console.log(`Environment: ${NODE_ENV || 'development'}`);
  console.log(`Database: ${DB_NAME} on ${DB_HOST}:${DB_PORT}`);
  
  createDatabase();
  runMigrations();
  
  // Only run seeders in development environment by default
  if (NODE_ENV === 'development' || process.argv.includes('--seed')) {
    runSeeders();
  }
  
  console.log('=== Database initialization completed successfully ===');
};

main();