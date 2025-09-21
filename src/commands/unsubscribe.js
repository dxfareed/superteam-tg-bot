import { db } from '../config/firebaseConfig.js';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';

const unsubscribe = (bot) => {
  bot.onText(/\/unsubscribe/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    const userId = msg.from.id;
    const chatType = msg.chat.type;

    console.log(`Received /unsubscribe command from username: ${username} in ${chatType} chat`);

    // Only allow unsubscribe from private chats
    if (chatType !== 'private') {
      bot.sendMessage(chatId, 'Please send the /unsubscribe command in a private message to the bot, not in a group chat.');
      return;
    }

    try {
      const userRef = doc(db, 'subscribedUsers', userId.toString());
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        try {
          await deleteDoc(userRef);
          console.log(`User ${username} unsubscribed successfully`);
          bot.sendMessage(
            chatId, 
            'You have been successfully unsubscribed from notifications.\n\n' +
            'To subscribe again in the future, just send /subscribe'
          );
        } catch (deleteError) {
          console.error('Error deleting user document:', deleteError);
          bot.sendMessage(chatId, 'Sorry, there was an error unsubscribing. Please try again later.');
        }
      } else {
        console.log(`User ${username} attempted to unsubscribe but was not subscribed`);
        bot.sendMessage(
          chatId, 
          'You are not currently subscribed to notifications.\n\n' +
          'To subscribe, send /subscribe'
        );
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      bot.sendMessage(chatId, 'Sorry, there was an error checking your subscription. Please try again later.');
    }
  });
};

export default unsubscribe;
