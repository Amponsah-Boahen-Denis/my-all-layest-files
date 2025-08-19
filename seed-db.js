#!/usr/bin/env node

// Simple script to seed the database
// Run with: node seed-db.js

const { seedDatabase } = require('./src/lib/seedDatabase.ts');

console.log('🌱 Starting database seeding...');

seedDatabase()
  .then(() => {
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  });
