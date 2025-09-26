import https from 'https';
import { SUPER_TEAM_API_URL } from '../config/api-url.js';

const CATEGORIES = ['Development', 'Design', 'Content', 'Marketing', 'Community'];

const helpMessage = `
<b>🔍 Bounty Search Commands:</b>

1. Show all bounties:
   /bounties

2. Filter by category:
   /bounties category:development
   /bounties category:design
   /bounties category:content
   /bounties category:marketing
   /bounties category:community

3. Search by keyword:
   /bounties search:solana
   /bounties search:web3

4. Show this help:
   /bounties help

You can also combine filters:
/bounties category:development search:web3
`;

const fetchBounties = () => {
  return new Promise((resolve, reject) => {
    const url = SUPER_TEAM_API_URL
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const allBounties = JSON.parse(data);
          const irelandBounties = allBounties.filter(bounty => bounty.sponsor && bounty.sponsor.name === 'Superteam Ireland');
          resolve(irelandBounties);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
};

const formatBounty = (bounty) => {
  const deadline = new Date(bounty.deadline).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const bountyUrl = `https://earn.superteam.fun/listing/${bounty.slug}`;
  const formattedReward = Number(bounty.rewardAmount).toLocaleString('en-US', { maximumFractionDigits: 2 });
  
  return `🏆 <b><a href="${bountyUrl}">${bounty.title}</a></b>\n` +
         `💰 <b>Reward:</b> ${formattedReward} ${bounty.token}\n` +
         `📋 <b>Category:</b> ${bounty.category || 'Not specified'}\n` +
         `⏰ <b>Deadline:</b> ${deadline}\n\n`;
};

const filterBounties = (bounties, filters) => {
  return bounties.filter(bounty => {
    // If no filters, return all bounties
    if (!filters.category && !filters.search) return true;

    // Check category filter
    if (filters.category) {
      const bountyCategory = (bounty.category || '').toLowerCase();
      if (!bountyCategory.includes(filters.category.toLowerCase())) {
        return false;
      }
    }

    // Check search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const bountyTitle = bounty.title.toLowerCase();
      const bountyDescription = (bounty.description || '').toLowerCase();
      if (!bountyTitle.includes(searchTerm) && !bountyDescription.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });
};

const parseFilters = (text) => {
  const filters = {};
  
  // Check for help command
  if (text === '/bounties help') {
    return { help: true };
  }

  // Extract category filter
  const categoryMatch = text.match(/category:(\w+)/i);
  if (categoryMatch) {
    filters.category = categoryMatch[1];
  }

  // Extract search filter
  const searchMatch = text.match(/search:(\w+)/i);
  if (searchMatch) {
    filters.search = searchMatch[1];
  }

  return filters;
};

const bounties = (bot) => {
  bot.onText(/\/bounties(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const commandText = match[0];
    
    try {
      // Parse filters from command
      const filters = parseFilters(commandText);
      
      // Show help if requested
      if (filters.help) {
        await bot.sendMessage(chatId, helpMessage, { parse_mode: 'HTML' });
        return;
      }

      // Fetch bounties
      const allBounties = await fetchBounties();
      
      if (!allBounties || allBounties.length === 0) {
        await bot.sendMessage(chatId, 'No open bounties found.');
        return;
      }

      // Apply filters
      const filteredBounties = filterBounties(allBounties, filters);

      if (filteredBounties.length === 0) {
        let message = 'No bounties found';
        if (filters.category) message += ` in category "${filters.category}"`;
        if (filters.search) message += ` matching "${filters.search}"`;
        await bot.sendMessage(chatId, message + '.');
        return;
      }

      // Build response message
      let message = '<b>🟢 Open Bounties';
      if (filters.category) message += ` - Category: ${filters.category}`;
      if (filters.search) message += ` - Search: ${filters.search}`;
      message += `</b>\n\n`;

      // Add bounties to message
      filteredBounties.forEach(bounty => {
        message += formatBounty(bounty);
      });

      // Add help footer
      message += `\nUse /bounties help to see all search options.`;

      await bot.sendMessage(chatId, message, { 
        parse_mode: 'HTML', 
        disable_web_page_preview: true 
      });

    } catch (error) {
      console.error('Error handling bounties command:', error);
      bot.sendMessage(chatId, 'Sorry, there was an error fetching the bounties.');
    }
  });
};

export default bounties;
