const events = (bot) => {
  bot.onText(/\/events/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'This is the events command.');
  });
};

export default events;
