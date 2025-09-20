import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import * as commands from './commands/index.js';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN not found in .env file');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('Bot started...');

Object.values(commands).forEach(command => {
  command(bot);
});