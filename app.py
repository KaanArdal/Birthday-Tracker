import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, render_template
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
DATA_FILE = 'data.json'

# --- VERI ISLEMLERI ---
def load_data():
    if not os.path.exists(DATA_FILE):
        return {}
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {}

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

# --- EMAIL GONDERIMI (OTOPILOT) ---
def send_email(receiver_email, subject, body):
    sender = os.getenv("EMAIL_ADDRESS")
    password = os.getenv("EMAIL_PASSWORD")

    if not sender or not password:
        print("Sistemde gönderici mail bilgileri eksik. Lütfen .env dosyasını doldurun.")
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
        print(f"[{datetime.now()}] {receiver_email} adresine mail başarıyla gönderildi: {subject}")
    except Exception as e:
        print(f"Mail gönderme hatası ({receiver_email}): {e}")

def get_zodiac_sign(month, day):
    signs = [
        (1, 20, "Oğlak ♑"), (2, 19, "Kova ♒"), (3, 20, "Balık ♓"), 
        (4, 20, "Koç ♈"), (5, 21, "Boğa ♉"), (6, 21, "İkizler ♊"),
        (7, 22, "Yengeç ♋"), (8, 23, "Aslan ♌"), (9, 23, "Başak ♍"),
        (10, 23, "Terazi ♎"), (11, 22, "Akrep ♏"), (12, 22, "Yay ♐"),
        (12, 31, "Oğlak ♑")
    ]
    for m, d, sign in signs:
        if month == m and day <= d:
            return sign
        elif month == m and day > d:
            idx = signs.index((m, d, sign))
            return signs[idx + 1][2] if idx + 1 < len(signs) else "Oğlak ♑"
    return ""

def check_birthdays():
    today = datetime.now()
    db = load_data()
    
    for user_email, user_data in db.items():
        reminder_days = user_data.get("reminder", 0) # 0, 1, 3 veya 7 olabilir
        
        # O kullanıcının aradığı hedef tarih (Örn: Bugün ayın 10'u, reminder 7 ise, o kişinin hedef tarihi ayın 17'sidir)
        target_date = today + timedelta(days=reminder_days)
        target_month_day = f"{target_date.month:02d}-{target_date.day:02d}"
        
        birthdays = user_data.get("birthdays", [])
        todays_people = [person for person in birthdays if person['date'].endswith(target_month_day)]
        
        for person in todays_people:
            name = person['name']
            
            # Yaş hesaplama
            birth_year = int(person['date'].split('-')[0])
            new_age = target_date.year - birth_year
            
            # Burç tespiti
            birth_month = int(person['date'].split('-')[1])
            birth_day = int(person['date'].split('-')[2])
            zodiac = get_zodiac_sign(birth_month, birth_day)
            
            if reminder_days == 0:
                subject = f"🎉 Bugün {name}'nin Doğum Günü! ({new_age} Yaş)"
                intro_text = f"Takvimine kaydettiğin <strong>{name}</strong> bugün tam {new_age} yaşına girdi! 🎂"
            else:
                days_text = f"{reminder_days} gün" if reminder_days != 7 else "1 hafta"
                subject = f"⏳ {name}'nin Doğum Gününe {days_text} Kaldı!"
                intro_text = f"Takvimine kaydettiğin <strong>{name}</strong>, {days_text} sonra ({target_month_day}) {new_age} yaşına giriyor! Hediye almayı unutma. 🎁"
            
            body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2 style="color: #9d4edd;">Birthday Tracker Bildirimi</h2>
                <p>Merhaba,</p>
                <p>{intro_text}</p>
                <p><strong>Kişi:</strong> {name} ({zodiac})</p>
            </body>
            </html>
            """
            send_email(user_email, subject, body)

# --- API UÇLARI (AUTH & VERİ) ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/check_email', methods=['POST'])
def check_email():
    email = request.json.get('email')
    db = load_data()
    return jsonify({"exists": email in db})

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    db = load_data()
    if email in db:
        return jsonify({"error": "Email zaten kayıtlı"}), 400
        
    db[email] = {
        "password": generate_password_hash(password),
        "reminder": 0, # Varsayılan: Aynı gün
        "birthdays": []
    }
    save_data(db)
    return jsonify({"message": "Kayıt başarılı"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    db = load_data()
    if email not in db:
        return jsonify({"error": "Kullanıcı bulunamadı"}), 404
        
    if check_password_hash(db[email]["password"], password):
        return jsonify({"message": "Giriş başarılı", "reminder": db[email].get("reminder", 0)}), 200
    else:
        return jsonify({"error": "Hatalı şifre"}), 401

@app.route('/api/settings', methods=['POST'])
def update_settings():
    data = request.json
    email = data.get('email')
    reminder = data.get('reminder')
    
    db = load_data()
    if email in db:
        db[email]["reminder"] = int(reminder)
        save_data(db)
        return jsonify({"message": "Ayarlar güncellendi"})
    return jsonify({"error": "Kullanıcı yok"}), 404

@app.route('/api/birthdays', methods=['GET'])
def get_birthdays():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email zorunludur"}), 400
        
    db = load_data()
    if email in db:
        return jsonify({
            "birthdays": db[email]["birthdays"],
            "reminder": db[email].get("reminder", 0)
        })
    return jsonify({"birthdays": [], "reminder": 0})

@app.route('/api/birthdays', methods=['POST'])
def add_birthday():
    data = request.json
    email = data.get('email')
    name = data.get('name')
    date = data.get('date')
    
    if not email or not name or not date:
        return jsonify({"error": "Eksik bilgi"}), 400
        
    db = load_data()
    if email not in db:
        return jsonify({"error": "Kullanıcı yok"}), 404
        
    new_id = 1
    birthdays = db[email]["birthdays"]
    if birthdays:
        new_id = max([b['id'] for b in birthdays]) + 1
        
    birthdays.append({"id": new_id, "name": name, "date": date})
    db[email]["birthdays"] = birthdays
    save_data(db)
    
    return jsonify({"message": "Eklendi"}), 201

@app.route('/api/birthdays/<email>/<int:id>', methods=['DELETE'])
def delete_birthday(email, id):
    db = load_data()
    if email in db:
        db[email]["birthdays"] = [b for b in db[email]["birthdays"] if b['id'] != id]
        save_data(db)
    return jsonify({"message": "Silindi"})

# --- BULUT TETIKLEYICI (SERVERLESS CRON) ---
@app.route('/api/run_cron', methods=['GET'])
def run_cron():
    # Cron-job.org sitesinin bu adresi tetiklerken kullanacağı gizli şifre
    key = request.args.get('key')
    secret = os.getenv("CRON_SECRET", "gizli-sifremiz-123")
    
    if key != secret:
        return jsonify({"error": "Yetkisiz Erisim. Yanlis Sifre."}), 401
    
    # Şifre doğruysa sistemi kontrol et ve mailleri at
    check_birthdays()
    return jsonify({"message": "Otopilot calistirildi ve mailler atildi."}), 200

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, port=5000)
