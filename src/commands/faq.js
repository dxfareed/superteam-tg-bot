import { googleAI } from '@genkit-ai/google-genai';
import { genkit } from 'genkit/beta'; 
import fs from 'fs';
import path from 'path';

const faqDatabase = JSON.parse(fs.readFileSync(path.resolve('src/faq-data/faq.json'), 'utf-8'));
const faqMarkdown = fs.readFileSync(path.resolve('src/faq-data/faq.md'), 'utf-8');

// Rate limiting map: userId -> lastQueryTime
const userQueries = new Map();
const RATE_LIMIT_MS = 2000; // 2 seconds between queries

const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-2.0-flash-lite'),
});

// Helper function to check rate limit
const isRateLimited = (userId) => {
  const lastQuery = userQueries.get(userId);
  const now = Date.now();
  if (lastQuery && (now - lastQuery) < RATE_LIMIT_MS) {
    return true;
  }
  userQueries.set(userId, now);
  return false;
};

// Helper function to retry failed requests
const retryWithBackoff = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

const faq = (bot) => {
  bot.onText(/\/faq(?:@\w+)? (.+)/, async (msg, match) => {
    try {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const username = msg.from.username || msg.from.first_name; 
      const query = match[1];

      // Check rate limit
      if (isRateLimited(userId)) {
        await bot.sendMessage(chatId, "Please wait a moment before asking another question.");
        return;
      }

      console.log(`[FAQ Log] User @${username} (ID: ${userId}) in chat ${chatId} searched FAQ for: "${query}"`);
      
      const prefix = "You are a smart FAQ bot, your goal is to help member of superteam ireland navigate the superteam ecosystem, I want you to answer the user question base on what is in the FAQ document, do not make up anything, answer or generate any content outside what is in the FAQ document. If you don't find the answer in the FAQ document, just say 'Sorry, I don't have the answer to that question. do not reply user with any information that you are reading from a document.'";
      const prompt = `
        ${prefix}
        Context:
        ${faqMarkdown}
      `;

      // Create chat with retry mechanism
      const chat = ai.chat({ system: prompt });
      const { text } = await retryWithBackoff(async () => {
        return await chat.send(`Answer the question: ${query}`);
      });

      // Send response with retry mechanism
      await retryWithBackoff(async () => {
        await bot.sendMessage(chatId, text, { 
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        });
      });

    } catch (error) {
      console.error('[FAQ Error]', error);
      try {
        await bot.sendMessage(msg.chat.id, 
          "Sorry, I'm having trouble answering right now. Please try again in a moment.",
          { parse_mode: 'Markdown' }
        );
      } catch (sendError) {
        console.error('[FAQ Send Error]', sendError);
      }
    }
  });

  bot.onText(/^\/faq(?:@\w+)?$/, async (msg) => {
    try {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const username = msg.from.username || msg.from.first_name;

      // Check rate limit
      if (isRateLimited(userId)) {
        await bot.sendMessage(chatId, "Please wait a moment before making another request.");
        return;
      }

      console.log(`[FAQ Log] User @${username} (ID: ${userId}) in chat ${chatId} used /faq command without a query.`);

      const topQuestions = faqDatabase.slice(0, 5);
      let response = "Here are some of the most frequently asked questions. To ask a specific question, use `/faq [your question]`\n\n";
      topQuestions.forEach((faq) => {
        response += `*${faq.title}*\n${faq.body}\n\n`;
      });

      await retryWithBackoff(async () => {
        await bot.sendMessage(chatId, response, { 
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        });
      });

    } catch (error) {
      console.error('[FAQ List Error]', error);
      try {
        await bot.sendMessage(msg.chat.id, 
          "Sorry, I'm having trouble showing the FAQ list right now. Please try again in a moment.",
          { parse_mode: 'Markdown' }
        );
      } catch (sendError) {
        console.error('[FAQ Send Error]', sendError);
      }
    }
  });
};

export default faq;
