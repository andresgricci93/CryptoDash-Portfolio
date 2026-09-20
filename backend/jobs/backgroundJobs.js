import cron from 'node-cron';
import { fetchAndCacheCryptos } from '../controllers/cryptos.controller.js';
import {
  createDailyEditionIfMissing,
  DAILY_EDITION_TIME_ZONE
} from '../services/dailyEdition.service.js';

const ensureDailyEdition = async (trigger) => {
  try {
    const { created, edition } = await createDailyEditionIfMissing();
    console.log(
      `${trigger}: Daily edition ${edition.editionDate} ${created ? 'created' : 'already exists'}`
    );
  } catch (error) {
    console.error(`${trigger} error (daily news edition):`, error.message);
  }
};

export const startBackgroundJobs = async () => {
  await ensureDailyEdition('Startup');

  cron.schedule('0 */2 * * *', async () => {
    console.log('Cron: Updating crypto prices...');
    try {
      await fetchAndCacheCryptos();
    } catch (error) {
      console.error('Cron error (prices):', error.message);
    }
  });
  console.log(' Cron: Crypto prices (every 2 hours)');

  cron.schedule('0 1 * * *', async () => {
    console.log('Cron: Compiling daily news edition...');
    await ensureDailyEdition('Cron');
  }, {
    timezone: DAILY_EDITION_TIME_ZONE
  });
  console.log(` Cron: Daily news edition (1:00 AM ${DAILY_EDITION_TIME_ZONE})`);
};
