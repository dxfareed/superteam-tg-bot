import { db } from '../config/firebaseConfig.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const subscribe = (bot) => {
  bot.onText(/\/subscribe/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    const userId = msg.from.id;
    const chatType = msg.chat.type;

    console.log(`Received /subscribe command from username: ${username} in ${chatType} chat`);

    // Only allow subscriptions from private chats
    if (chatType !== 'private') {
      bot.sendMessage(chatId, 'Please send the /subscribe command in a private message to the bot, not in a group chat.');
      return;
    }

    if (!username) {
      bot.sendMessage(chatId, 'You need a username to subscribe. Please set a username in Telegram settings and try again.');
      return;
    }

    try {
      const userRef = doc(db, 'subscribedUsers', userId.toString());
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        bot.sendMessage(chatId, 'You are already subscribed to notifications.');
        console.log(`User ${username} is already subscribed.`);
      } else {
        await setDoc(userRef, {
          username: username,
          chatId: chatId,  // This will now always be a private chat ID
          userId: userId,
          subscribedAt: new Date()
        });
        bot.sendMessage(
          chatId, 
          'Successfully subscribed! You will now receive event and bounty notifications.\n\n' +
          'To unsubscribe at any time, just send /unsubscribe'
        );
        console.log(`User ${username} (${chatId}) subscribed successfully.`);
      }
    } catch (error) {
      console.error('Error subscribing user:', error);
      bot.sendMessage(chatId, 'Sorry, there was an error subscribing. Please try again later.');
    }
  });
};

export default subscribe;
