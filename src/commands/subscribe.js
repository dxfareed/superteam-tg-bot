const subscribe = (bot) => {
  bot.onText(/\/subscribe/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'This is the subscribe command.');
  });
};

export default subscribe;
