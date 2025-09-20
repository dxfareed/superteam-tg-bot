const help = (bot) => {
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;
    const chatTitle = msg.chat.title;

    console.log('Help command called from:');
    console.log('Chat ID:', chatId);
    console.log('Chat Type:', chatType);
    if (chatType === 'group' || chatType === 'supergroup') {
      console.log('Group Name:', chatTitle);
    }
    console.log('User ID:', msg.from.id);
    console.log('Username:', msg.from.username);
    console.log('------------------------');

    const helpMessage = `🤖 Available commands:
  /events -  Show upcoming events 🎉
  /bounties - List current bounties 💰🏆
  /privacy - View privacy policy 🔒
  /faq - Show frequently asked questions ❓
  /help - Show this help message 🆘
  /subscribe - Subscribe to DM notifications 🔔
  /unsubscribe - Unsubscribe from DM notifications 🔕`
  ;

    bot.sendMessage(chatId, helpMessage);
  });
};

export default help;
