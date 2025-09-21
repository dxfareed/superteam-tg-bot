import { db } from '../config/firebaseConfig.js';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const checkSubscriptions = async () => {
  try {
    console.log('🔍 Checking subscriptions...\n');
    
    const usersCollection = collection(db, 'subscribedUsers');
    const snapshot = await getDocs(usersCollection);
    
    if (snapshot.empty) {
      console.log('No subscriptions found.');
      process.exit(0);
      return;
    }

    console.log('Current subscriptions:');
    console.log('=====================');
    
    for (const docRef of snapshot.docs) {
      const data = docRef.data();
      console.log(`\nUser ID: ${docRef.id}`);
      console.log(`Username: ${data.username}`);
      console.log(`Chat ID: ${data.chatId}`);
      console.log(`Chat Type: ${data.chatId.toString().startsWith('-') ? 'Group' : 'Private'}`);
      console.log(`Subscribed At: ${new Date(data.subscribedAt.toDate()).toLocaleString()}`);
      
      
      if (data.chatId.toString().startsWith('-')) {
        console.log('❌ Invalid subscription: Group chat ID detected');
        
        try {
          await deleteDoc(doc(db, 'subscribedUsers', docRef.id));
          console.log('✅ Invalid subscription deleted');
        } catch (error) {
          console.error('Error deleting invalid subscription:', error);
        }
      }
    }
    
    console.log('\n✅ Subscription check completed!');
    console.log('\nTo subscribe properly:');
    console.log('1. Start a private chat with the bot');
    console.log('2. Send /subscribe in the private chat');
    process.exit(0);
    
  } catch (error) {
    console.error('Error checking subscriptions:', error);
    process.exit(1);
  }
};

checkSubscriptions(); 