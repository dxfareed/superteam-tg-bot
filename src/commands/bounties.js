import https from 'https';
import { SUPER_TEAM_API_URL } from '../config/api-url.js';

const bounties = (bot) => {
  bot.onText(/\/bounties/, (msg) => {
    const chatId = msg.chat.id;
    const url = SUPER_TEAM_API_URL;
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const bounties = JSON.parse(data);
          if (bounties && bounties.length > 0) {
            let message = '<b>🟢 Open Bounties:</b>\n\n';
            bounties.forEach(bounty => {
              const deadline = new Date(bounty.deadline).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
              const bountyUrl = `https://earn.superteam.fun/listing/${bounty.slug}`;
              const formattedReward = Number(bounty.rewardAmount).toLocaleString('en-US', { maximumFractionDigits: 2 });
              message += `🏆 <b><a href="${bountyUrl}">${bounty.title}</a></b>\n`;
              message += `💰 <b>Reward:</b> ${formattedReward} ${bounty.token}\n`;
              message += `⏰ <b>Deadline:</b> ${deadline}\n\n`;
            });
            bot.sendMessage(chatId, message, { parse_mode: 'HTML', disable_web_page_preview: true });
          } else {
            bot.sendMessage(chatId, 'No open bounties found.');
          }
        } catch (error) {
          console.error('Error parsing bounties JSON:', error);
          bot.sendMessage(chatId, 'Sorry, there was an error fetching the bounties.');
        }
      });
    }).on('error', (error) => {
      console.error('Error fetching bounties:', error);
      bot.sendMessage(chatId, 'Sorry, there was an error fetching the bounties.');
    });
  });
};

export default bounties;
