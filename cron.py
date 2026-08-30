import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from dotenv import load_dotenv

# .env dosyasını oku
# PythonAnywhere üzerinde tam yolu belirtmek gerekebilir: load_dotenv('/home/senin_kullanici_adin/BirthdayApp/.env')
load_dotenv()

DATA_FILE = 'data.json' # PythonAnywhere üzerinde: '/home/senin_kullanici_adin/BirthdayApp/data.json'

def load_birthdays():
    if not os.path.exists(DATA_FILE):
        return {}
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {}

def send_email(receiver_email, subject, body):
    sender = os.getenv("EMAIL_ADDRESS")
    password = os.getenv("EMAIL_PASSWORD")

    if not sender or not password:
        print("Sistemde gönderici mail bilgileri (EMAIL_ADDRESS ve EMAIL_PASSWORD) eksik.")
        return

    msg = MIMEMultipart()
    msg['From'] = sender
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html', 'utf-8'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender, password)
        server.sendmail(sender, receiver_email, msg.as_string())
        server.quit()
        print(f"[{datetime.utcnow() + timedelta(hours=3)}] {receiver_email} adresine mail başarıyla gönderildi.")
    except Exception as e:
        print(f"Mail gönderme hatası ({receiver_email}): {e}")

def check_birthdays():
    # PythonAnywhere UTC kullanır, Türkiye saati için UTC+3 ekliyoruz
    today = datetime.utcnow() + timedelta(hours=3)
    month_day = f"{today.month:02d}-{today.day:02d}"
    db = load_birthdays()
    
    for user_email, birthdays in db.items():
        todays_people = [person for person in birthdays if person['date'].endswith(month_day)]
        
        for person in todays_people:
            name = person['name']
            subject = f"🎉 Bugün {name}'nin Doğum Günü!"
            body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2 style="color: #9d4edd;">Birthday Tracker Bildirimi</h2>
                <p>Merhaba,</p>
                <p>Otopilot takvimine kaydettiğin <strong>{name}</strong> adlı kişinin bugün doğum günü! 🎂</p>
                <p>Kutlamayı unutma!</p>
            </body>
            </html>
            """
            send_email(user_email, subject, body)

if __name__ == '__main__':
    print(f"[{datetime.now()}] Doğum günü kontrolü başlatılıyor (CRON)...")
    check_birthdays()
    print("Kontrol tamamlandı. Çıkış yapılıyor.")
