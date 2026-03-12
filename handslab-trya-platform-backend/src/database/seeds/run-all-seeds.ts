import { Logger } from '@nestjs/common';
import { execSync } from 'child_process';

const logger = new Logger('RunAllSeeds');

async function runAllSeeds() {
  try {
    logger.log('🌱 Starting all seeds...');
    logger.log('');

    // Run initial users seed
    logger.log('Running initial users seed...');
    execSync('npm run seed:initial', { stdio: 'inherit' });
    logger.log('');

    // Run initial companies seed
    logger.log('Running initial companies seed...');
    execSync('npm run seed:companies', { stdio: 'inherit' });
    logger.log('');

    logger.log('✅ All seeds completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to run all seeds', error);
    process.exit(1);
  }
}

runAllSeeds();
