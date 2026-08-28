# Birthday Tracker

A lightweight, serverless web application that helps users track birthdays and sends automated email reminders. Built with Python (Flask) and Vanilla JavaScript.

## Features
- **Secure Authentication:** Multi-user support with hashed passwords using `werkzeug.security`.
- **Automated Email Reminders:** Designed to run in a serverless environment. An external cron job triggers daily checks and sends email notifications.
- **Dynamic Calendar UI:** A fully custom, interactive calendar built with Vanilla JS (no heavy frontend frameworks).
- **Smart Calculations:** Automatically calculates the person's upcoming age and determines their Zodiac sign based on their birth date.
- **Customizable Alerts:** Users can configure their notification preferences (e.g., Same day, 1 day before, 1 week before).

## Tech Stack
- **Backend:** Python, Flask
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Data Storage:** JSON (File-based, designed for lightweight deployments)

## Installation & Setup

### 1. Requirements
Ensure you have Python installed. Install the required dependencies using pip:
```bash
pip install flask python-dotenv werkzeug
```

### 2. Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```env
EMAIL_ADDRESS=your_bot_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
CRON_SECRET=your_secure_cron_trigger_key
```
*(Note: If using Gmail, you must generate an "App Password" from your Google Account security settings).*

### 3. Running Locally
Start the Flask development server:
```bash
python app.py
```
Visit `http://127.0.0.1:5000` in your browser to access the application.

## Serverless Deployment (Cloud Cron)
This application is designed to be hosted on platforms like PythonAnywhere. Instead of running a continuous background scheduler (which consumes resources), it exposes a secure endpoint for external triggers.

To trigger the daily email checks, set up a free external cron service (like cron-job.org) to hit the following endpoint every day at 00:00:
```
GET https://your-domain.com/api/run_cron?key=your_secure_cron_trigger_key
```

---
**Creator:** Darkeas
