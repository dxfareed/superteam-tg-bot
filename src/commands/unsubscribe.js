const unsubscribe = (bot) => {
  bot.onText(/\/unsubscribe/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'This is the unsubscribe command.');
  });
};

export default unsubscribe;
