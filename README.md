# MES-Chatbot

A Telegram chatbot project built with Node.js, Express, Firebase, and Telegraf.  
Originally created for an internship program in 2022.

## Features

- Telegram bot integration using Telegraf
- Express server with basic endpoints
- Firebase Firestore integration for notifications and scheduling
- Scheduled notifications using `node-schedule`
- Easily configurable via environment variables

## Project Structure

```
MES-Chatbot-public/
??? credentials/                # Firebase service account credentials (ignored by git)
??? functions/                  # Firebase Cloud Functions (optional)
??? src/
?   ??? app.js                  # Express app
?   ??? app.test.js             # Tests for Express app
?   ??? index.js                # Main entry point
??? .env                        # Environment variables (ignored by git)
??? database.js                 # Firebase admin and database helpers
??? scheduler.js                # Notification scheduling logic
??? package.json
??? README.md
??? ... (other config files)
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v17.x recommended)
- [npm](https://www.npmjs.com/)
- A [Firebase](https://firebase.google.com/) project with Firestore enabled
- A [Telegram Bot Token](https://core.telegram.org/bots#6-botfather)

### Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/MES-Chatbot-public.git
   cd MES-Chatbot-public
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Add your environment variables:**
   Create a `.env` file in the project root:
   ```
   TOKEN=your-telegram-bot-token
   PORT=3000
   ```

4. **Add your Firebase credentials:**
   - Download your Firebase service account JSON file.
   - Place it in the `credentials/` folder (e.g., `credentials/mes-chatbot-5495594e0cac.json`).

5. **Run the project:**
   ```sh
   npm start
   ```

6. **Run tests:**
   ```sh
   npm test
   ```

## Deployment

- You can deploy this project to Heroku or any Node.js hosting provider.
- GitHub Actions workflow is included for automated deployment to Heroku (configure your secrets and app name).

## Security

- **Never commit your `.env` or `credentials/` files.** They are ignored by `.gitignore`.
- Store sensitive keys and tokens in environment variables or GitHub secrets.

## License

MIT License

---

**Created by arif, 2022**