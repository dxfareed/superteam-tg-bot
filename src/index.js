import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import * as commands from './commands/index.js';
import processEvents from './job/eventNotifier.js';
import processBounties from './job/bountyNotifier.js';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN not found in .env file');
  process.exit(1);
}

if (!groupChatId) {
  console.warn('Warning: TELEGRAM_GROUP_CHAT_ID not found in .env file. Group notifications will be disabled.');
}

const bot = new TelegramBot(token, { polling: true });

console.log('Bot started...');
console.log('Group Chat ID:', groupChatId);

Object.values(commands).forEach(command => {
  command(bot);
});

// Schedule the notifiers to run every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  const now = new Date().toLocaleString();
  console.log(`\n[${now}] Running scheduled notification check...`);
  
  try {
    console.log('Checking for new events...');
    await processEvents(bot);
    
    console.log('Checking for new bounties...');
    await processBounties(bot);
    
    console.log('Notification check completed successfully');
  } catch (error) {
    console.error('Error during notification check:', error);
  }
});
