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

const bot = new TelegramBot(token, { 
  polling: true,
  request: {
    timeout: 30000,
    retry: 5,
  }
});

bot.on('polling_error', (error) => {
  if (error.code === 'EFATAL') {
    console.error('Fatal polling error occurred, attempting to restart polling...');
    try {
      bot.stopPolling();
      setTimeout(() => {
        bot.startPolling();
        console.log('Polling restarted successfully');
      }, 5000); 
    } catch (restartError) {
      console.error('Failed to restart polling:', restartError);
    }
  } else {
    console.error('Polling error:', error);
  }
});

bot.on('error', (error) => {
  console.error('Bot error:', error);
});

console.log('Bot started...');
console.log('Group Chat ID:', groupChatId);

Object.values(commands).forEach(command => {
  command(bot);
});

const scheduledTask = cron.schedule('*/30 * * * *', async () => {
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

const shutdown = async () => {
  console.log('\nShutting down...');
  
  scheduledTask.stop();
  
  try {
    await bot.stopPolling();
    console.log('Bot polling stopped');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGQUIT', shutdown);
