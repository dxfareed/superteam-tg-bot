<div align="center">
  <br />
  <h1>Superteam Ireland Telegram Bot</h1>
  <p>
    Your AI-powered community assistant for Superteam Ireland, designed to keep members informed and engaged.
  </p>
</div>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A sophisticated Telegram bot that serves as a central hub for the Superteam Ireland community. It provides instant answers to frequently asked questions, delivers real-time updates on events and bounties, and sends automated notifications to keep everyone in the loop.

## 🌟 Core Features

-   **🤖 AI-Powered Q&A:** Leverages **Google's Gemini AI** for intelligent, context-aware answers to community questions about the Superteam ecosystem, programs, and resources.
-   **📅 Real-Time Event Updates:** Automatically fetches and displays the latest event information from Luma, complete with descriptions, schedules, and RSVP links.
-   **💰 Live Bounty Listings:** Keeps the community informed about new earning opportunities by providing live updates on bounties from the Superteam platform.
-   **🔔 Smart Notification System:** Delivers instant announcements to the main group chat and allows users to subscribe for personal DM notifications about new events and bounties.
-   **✅ Simple & Intuitive Commands:** A straightforward command interface that makes it easy for anyone to interact with the bot.

## 🛠️ Tech Stack

-   **Backend:** Node.js
-   **Database:** Google Firebase (Firestore)
-   **Telegram API:** `node-telegram-bot-api`
-   **AI:** Google Gemini (`@genkit-ai/google-genai`)
-   **Deployment:** Docker, Google Cloud Run

## 🚀 Getting Started

Follow these instructions to set up the project on your local machine for development and testing.

### Prerequisites

Before you begin, ensure you have the following:

-   [**Node.js**](https://nodejs.org/) (v18 or later)
-   A **Telegram Bot Token** (get one from [@BotFather](https://t.me/BotFather) on Telegram)
-   A **Google Firebase Project** ([create one here](https://firebase.google.com/))

### Installation & Configuration

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/dxfareed/superteam-tg-bot.git
    cd superteam-tg-bot
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    -   Create a `.env` file by copying the example file:
        ```bash
        cp .env.example .env
        ```
    -   Open the `.env` file and populate it with your credentials.

### Firebase Configuration

To get your Firebase credentials:

1.  Go to your Firebase project dashboard.
2.  Click on **Project Settings** (the gear icon).
3.  Under the **General** tab, scroll down to "Your apps".
4.  Click on the **Web app** (`</>`) icon to create a new web app or select your existing one.
5.  You will find the configuration object containing `apiKey`, `authDomain`, `projectId`, etc. Copy these values into your `.env` file.

| Variable                      | Description                                        |
| ----------------------------- | -------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN`          | Your Telegram bot token from BotFather.            |
| `FIREBASE_API_KEY`            | Your Firebase project's API key.                   |
| `FIREGRAM_AUTH_DOMAIN`        | Your Firebase project's auth domain.               |
| `FIREBASE_PROJECT_ID`         | Your Firebase project's ID.                        |
| `FIREBASE_STORAGE_BUCKET`     | Your Firebase project's storage bucket.            |
| `FIREBASE_MESSAGING_SENDER_ID`| Your Firebase project's messaging sender ID.       |
| `FIREBASE_APP_ID`             | Your Firebase project's app ID.                    |
| `TELEGRAM_GROUP_CHAT_ID`      | The ID of the Telegram group for notifications.    |
| `SUPER_TEAM_API_URL`          | The API URL for fetching bounties.                 |
| `LUMA_W_API`                  | The API URL for fetching events.                   |

### Running the Bot Locally

Once your `.env` file is configured, start the bot with:

```bash
npm start
```

## 🤖 Bot Commands

Interact with the bot using these commands in any chat it's a member of:

| Command             | Description                                       | Example Usage                             |
| ------------------- | ------------------------------------------------- | ----------------------------------------- |
| `/help`             | Shows the list of available commands.             | `/help`                                   |
| `/faq`              | Answers frequently asked questions.               | `/faq what is buildstation?`              |
| `/events`           | Shows upcoming Superteam Ireland events.          | `/events`                                 |
| `/bounties`         | Lists currently open bounties.                    | `/bounties`                               |
| `/subscribe`        | Get DM notifications for new events & bounties.   | `/subscribe`                              |
| `/unsubscribe`      | Stop receiving DM notifications.                  | `/unsubscribe`                            |
| `/privacy`          | Shows the bot's privacy policy.                   | `/privacy`                                |

## 🐳 Deployment

This bot is optimized for deployment as a container, particularly on **Google Cloud Run**.

### Docker

A `Dockerfile` is included for easy containerization.

1.  **Build the Docker image:**
    ```bash
    docker build -t superteam-tg-bot .
    ```

2.  **Run the container locally:**
    You'll need to pass your environment variables to the container.
    ```bash
    docker run --env-file .env superteam-tg-bot
    ```

### Google Cloud Run

1.  **Build and push the image to Google Container Registry (GCR):**
    ```bash
    gcloud builds submit --tag gcr.io/YOUR_GCP_PROJECT_ID/superteam-tg-bot
    ```
2.  **Deploy to Cloud Run:**
    Deploy the container image, making sure to set the environment variables from your `.env` file in the Cloud Run service configuration.
    ```bash
    gcloud run deploy superteam-tg-bot \
      --image gcr.io/YOUR_GCP_PROJECT_ID/superteam-tg-bot \
      --platform managed \
      --region YOUR_REGION \
      --allow-unauthenticated \
      --set-env-vars "TELEGRAM_BOT_TOKEN=your_token,FIREBASE_PROJECT_ID=your_project_id,..."
    ```

## 💰 Cost Estimation

This bot is architected to be extremely cost-effective by leveraging the generous free tiers of Google Cloud services.

-   **Hosting (Google Cloud Run):** The free tier includes 2 million requests per month, which is more than sufficient for a typical community bot.
-   **Database (Firebase Firestore):** The free tier includes 1 GiB of storage and substantial daily read/write quotas, easily covering the bot's needs.
-   **AI (Google Gemini API):** The API calls for the `/faq` command fall within a free tier suitable for moderate usage.

For most communities, the estimated monthly cost to run this bot is **$0**.

You would only incur costs if the bot experiences exceptionally high traffic (e.g., many thousands of active users and constant API calls), and even then, the costs would be minimal, likely starting at **$1-5 per month**.

## 📁 Project Structure

```
/
├── .dockerignore         # Specifies files to ignore in the Docker build
├── .env.example          # Example environment variables
├── Dockerfile            # Instructions for building the Docker image
├── package.json          # Project dependencies and scripts
├── README.md             # You are here!
└── src/
    ├── index.js          # Main application entry point
    ├── commands/         # Handlers for each bot command
    ├── config/           # Firebase and API configuration
    ├── faq-data/         # Stores the FAQ knowledge base
    ├── job/              # Scheduled tasks for notifications
    └── test/             # Test scripts for the application
```

## 🤝 Contributing

We welcome contributions! If you'd like to improve the bot, please follow these steps:

1.  **Fork the repository.**
2.  **Create a new feature branch:** `git checkout -b feat/your-amazing-feature`
3.  **Commit your changes:** `git commit -m 'feat: Add some amazing feature'`
4.  **Push to the branch:** `git push origin feat/your-amazing-feature`
5.  **Open a pull request** with a clear description of your changes.

Please check the [issues tab](https://github.com/dxfareed/superteam-tg-bot/issues) for bugs or feature requests.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
