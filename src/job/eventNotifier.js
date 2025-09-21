import https from 'https';
import { db } from '../config/firebaseConfig.js';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { LUMA_W_API } from '../config/api-url.js';

const fetchEvents = () => {
  return new Promise((resolve, reject) => {
    const url = LUMA_W_API;
    const options = {
      hostname: url,
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
          resolve(events);
        } catch (error) {
          reject('Error parsing events JSON:', error);
        }
      });
    });

    req.on('error', (error) => {
      reject('Error fetching events:', error);
    });

    req.end();
  });
};

const processEvents = async (bot) => {
  try {
    const events = await fetchEvents();
    const eventsCollection = collection(db, 'events');
    const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;

    for (const event of events) {
      const q = query(eventsCollection, where('eventUrl', '==', event.eventUrl));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        
        await addDoc(eventsCollection, event);
        console.log(`New event added: ${event.eventName}`);

        const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        let message = `<b>🎉 New Superteam Ireland Event!</b>\n\n`;
        message += `<b><a href="${event.eventUrl}">${event.eventName}</a></b>\n\n`;
        message += `📅 <b>Date:</b> ${eventDate}\n`;
        message += `📍 <b>Location:</b> ${event.eventLocation}\n\n`;
        message += `🔗 <a href="${event.eventUrl}">Click here to RSVP</a>\n`;

        if (groupChatId) {
          try {
            await bot.sendMessage(groupChatId, message, { 
              parse_mode: 'HTML',
              disable_web_page_preview: false
            });
            console.log(`Event notification sent to group chat: ${groupChatId}`);
          } catch (error) {
            console.error(`Failed to send event notification to group chat ${groupChatId}:`, error);
          }
        }

        const usersCollection = collection(db, 'susbcribedUser');
        const usersSnapshot = await getDocs(usersCollection);
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        for (const user of users) {
          try {
            await bot.sendMessage(user.id, message, { 
              parse_mode: 'HTML',
              disable_web_page_preview: false 
            });
            console.log(`Event notification sent to user: ${user.id}`);
          } catch (error) {
            console.error(`Failed to send event notification to user ${user.id}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing events:', error);
  }
};

export default processEvents;
