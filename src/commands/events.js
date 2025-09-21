import https from 'https';
import { LUMA_W_API } from '../config/api-url.js';

const events = (bot) => {
  bot.onText(/\/events/, (msg) => {
    const chatId = msg.chat.id;

    const host_url = LUMA_W_API;

    const options = {
      hostname: host_url,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const events = JSON.parse(data);
          if (events && events.length > 0) {
            let message = '<b>🎉 Upcoming Events:</b>\n\n';
            events.forEach(event => {
              const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
              });
              message += `<b>📌 <a href="${event.eventUrl}">${event.eventName}</a></b>\n`;
              message += `<b>🗓️ Date:</b> ${eventDate}\n`;
              message += `<b>📍 Location:</b> ${event.eventLocation}\n`;
              message += `<a href="${event.eventUrl}">&#8205;</a>\n`;
            });
            bot.sendMessage(chatId, message, { parse_mode: 'HTML', disable_web_page_preview: false });
          } else {
            bot.sendMessage(chatId, 'No upcoming events found.');
          }
        } catch (error) {
          console.error('Error parsing events JSON:', error);
          bot.sendMessage(chatId, 'Sorry, there was an error fetching the events.');
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error fetching events:', error);
      bot.sendMessage(chatId, 'Sorry, there was an error fetching the events.');
    });

    req.end();
  });
};

export default events;
