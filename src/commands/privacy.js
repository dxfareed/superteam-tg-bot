const privacy = (bot) => {
  bot.onText(/\/privacy/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'This is the privacy command.');
  });
};

export default privacy;
