import { mockBounties } from './mockData.js';
import { db } from '../config/firebaseConfig.js';
import { collection, getDocs } from 'firebase/firestore';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const validateConfig = () => {
  const requiredVars = {
    'TELEGRAM_BOT_TOKEN': process.env.TELEGRAM_BOT_TOKEN,
    'TELEGRAM_GROUP_CHAT_ID': process.env.TELEGRAM_GROUP_CHAT_ID
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }

  const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;
  if (!groupChatId.startsWith('-')) {
    console.error('Invalid group chat ID format. Group chat IDs should start with "-"');
    process.exit(1);
  }
};

const fetchBounties = async () => {
  return mockBounties;
};

const fetchSubscribedUsers = async () => {
  try {
    const usersCollection = collection(db, 'subscribedUsers');
    const usersSnapshot = await getDocs(usersCollection);
    const users = usersSnapshot.docs.map(doc => ({
      userId: doc.id,
      ...doc.data()
    }));
    return users;
  } catch (error) {
    console.error('Error fetching subscribed users:', error);
    return [];
  }
};

const formatBountyMessage = (bounty) => {
  const deadline = new Date(bounty.deadline).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedReward = Number(bounty.rewardAmount).toLocaleString('en-US', { 
    maximumFractionDigits: 2 
  });

  const bountyUrl = `https://earn.superteam.fun/listing/${bounty.slug}`;

  return {
    text: `🚨 <b>New Bounty Alert!</b> 🚨\n\n` +
          `🏆 <b><a href="${bountyUrl}">${bounty.title}</a></b>\n` +
          `💰 <b>Reward:</b> ${formattedReward} ${bounty.token}\n` +
          `⏰ <b>Deadline:</b> ${deadline}\n\n` +
          `Click the title to view more details and apply!`,
    options: {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    }
  };
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const testBountyNotifications = async () => {
  let bot;
  try {
    console.log('🧪 Bounty Notification System Test');
    console.log('================================');
    
    validateConfig();
    
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
    const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;

    console.log('\n📥 Fetching subscribed users from Firebase...');
    const subscribedUsers = await fetchSubscribedUsers();
    console.log(`Found ${subscribedUsers.length} subscribed users`);

    console.log('\n📋 Test Configuration:');
    console.log('Bot Token:', process.env.TELEGRAM_BOT_TOKEN.slice(0, 6) + '...');
    console.log('Group Chat ID:', groupChatId);

    console.log('\n📋 Test Data:');
    console.log('Bounties:', mockBounties);
    console.log('Subscribed Users:', subscribedUsers.map(user => ({
      username: user.username,
      chatId: user.chatId
    })));

    const bounties = await fetchBounties();

    console.log('\n📤 Processing notifications...');

    for (const bounty of bounties) {
      console.log(`\n💰 Processing bounty: ${bounty.title}`);
      
      const { text, options } = formatBountyMessage(bounty);
      
      console.log('\n📝 Message Preview:');
      console.log(text);

      console.log(`\n📢 Attempting group chat notification to: ${groupChatId}`);
      try {
        const chatInfo = await bot.getChat(groupChatId);
        console.log('✅ Group chat found:', chatInfo.title);
        
        await bot.sendMessage(groupChatId, text, options);
        console.log('✅ Group notification sent successfully');
      } catch (error) {
        console.error('❌ Group chat error:', error.message);
        if (error.message.includes('chat not found')) {
          console.log('💡 Tips for fixing group chat issues:');
          console.log('1. Make sure the bot is added to the group');
          console.log('2. Verify the group chat ID is correct');
          console.log('3. Make sure the bot has permission to send messages');
        }
      }

      if (subscribedUsers.length > 0) {
        console.log('\n📱 Processing DM notifications...');
        for (const user of subscribedUsers) {
          if (!user.chatId) {
            console.log(`⚠️ Skipping user ${user.username}: No chat ID found`);
            continue;
          }

          console.log(`\n📤 Attempting to send to user: ${user.username} (${user.chatId})`);
          try {
            const userInfo = await bot.getChat(user.chatId);
            console.log('✅ User chat found:', userInfo.type);
            
            await bot.sendMessage(user.chatId, text, options);
            console.log(`✅ DM sent successfully to ${user.username}`);
          } catch (error) {
            console.error(`❌ DM error for ${user.username}:`, error.message);
            if (error.message.includes('chat not found')) {
              console.log('💡 Tips for fixing DM issues:');
              console.log('1. Make sure the chat ID is correct');
              console.log('2. The user must have started a conversation with the bot');
              console.log(`3. Ask user to message @${process.env.BOT_USERNAME || 'your_bot'} first`);
            }
          }
        }
      } else {
        console.log('\n⚠️ No subscribed users found in Firebase');
      }
    }

    console.log('\n✅ Test completed!');
    await sleep(1000);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    try {
      if (bot) {
        await bot.close();
      }
    } catch (error) {
      if (error.message?.includes('Too Many Requests')) {
        const retryAfter = error.parameters?.retry_after || 1;
        console.log(`\n⚠️ Rate limited, waiting ${retryAfter} seconds before cleanup...`);
        await sleep(retryAfter * 1000);
        try {
          await bot.close();
        } catch (finalError) {
        }
      }
    }
    process.exit(0);
  }
};

testBountyNotifications(); 