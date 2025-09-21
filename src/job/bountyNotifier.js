import https from 'https';
import { db } from '../config/firebaseConfig.js';
import { SUPER_TEAM_API_URL } from '../config/api-url.js';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const fetchBounties = () => {
  return new Promise((resolve, reject) => {
    const url = SUPER_TEAM_API_URL;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const bounties = JSON.parse(data);
          resolve(bounties);
        } catch (error) {
          reject('Error parsing bounties JSON:', error);
        }
      });
    }).on('error', (error) => {
      reject('Error fetching bounties:', error);
    });
  });
};

const processBounties = async (bot) => {
  try {
    const bounties = await fetchBounties();
    const bountiesCollection = collection(db, 'bounties');
    const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;

    for (const bounty of bounties) {
      const q = query(bountiesCollection, where('id', '==', bounty.id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Bounty does not exist, so add it
        await addDoc(bountiesCollection, bounty);
        console.log(`New bounty added: ${bounty.title}`);

        const deadline = new Date(bounty.deadline).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const bountyUrl = `https://earn.superteam.fun/listing/${bounty.slug}`;
        let message = `🚨<b>New Bounty Alert!</b> 🚨\n\n`;
        message += `🏆<b><a href="${bountyUrl}">${bounty.title}</a></b>\n`;
        message += `💰<b>Reward:</b> ${bounty.rewardAmount} ${bounty.token}\n`;
        message += `⏰<b>Deadline:</b> ${deadline}\n\n`;

        if (groupChatId) {
          try {
            await bot.sendMessage(groupChatId, message, { parse_mode: 'HTML', disable_web_page_preview: true });
          } catch (error) {
            console.error(`Failed to send message to group chat ${groupChatId}:`, error);
          }
        }
        
        const usersCollection = collection(db, 'susbcribedUser');
        const usersSnapshot = await getDocs(usersCollection);
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        for (const user of users) {
          try {
            await bot.sendMessage(user.id, message, { parse_mode: 'HTML', disable_web_page_preview: true });
          } catch (error) {
            console.error(`Failed to send message to user ${user.id}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing bounties:', error);
  }
};

export default processBounties;
