const privacy = (bot) => {
  bot.onText(/\/privacy/, (msg) => {
    const chatId = msg.chat.id;
    const privacyPolicy = `
*Privacy Policy*

Last updated: September 20, 2025

We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Telegram bot.

*Information We Collect*

We may collect and store the following information:
- Your Telegram user ID and username, to provide personalized services.

*How We Use Your Information*

We use the information we collect to:
- Send you personalized alerts for upcoming events.

*Data Storage*

All data is securely stored on Google Cloud Storage. We take reasonable measures to protect your information from unauthorized access, use, or disclosure.

*Data Sharing*

We do not sell, trade, or otherwise transfer your personal information to third parties.

*Changes to This Privacy Policy*

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy within the bot.

*Contact Us*

If you have any questions about this Privacy Policy, please contact us @dxFareed.
`;
    bot.sendMessage(chatId, privacyPolicy, { parse_mode: 'Markdown' });
  });
};

export default privacy;
