# 🎉 Otopilot Birthday Tracker

Bu proje, F/P (Fiyat/Performans) mantığıyla tasarlanmış, tamamen otopilot çalışan, şifre korumalı ve modern (Glassmorphism & Synthwave) arayüzlü bir **Doğum Günü Hatırlatma Sistemi**dir.

## 🚀 Özellikler
- **Kimlik Doğrulama (Auth):** Her e-posta adresi kendi özel şifresiyle sisteme giriş yapar. Şifreler `werkzeug.security` kullanılarak güvenli bir şekilde hash'lenir (kriptolanır). Başkaları sizin mailinizi bilse bile verilerinize erişemez.
- **Otopilot Bildirimler:** Projeyi lokalde çalıştırdığınızda (veya bir sunucuya yüklediğinizde), arka planda çalışan `APScheduler` her gün saat 00:00 ve 07:00'da veritabanını tarar ve o gün doğum günü olan kişileri, kullanıcının mail adresine bildirir.
- **Dinamik Takvim:** Liste görünümü yerine Vanilla JS ile sıfırdan yazılmış interaktif bir takvim kullanılır.
- **Synthwave Tema:** Neon Mor, Pembe ve Turuncu renk tonlarıyla karanlık modun mükemmel uyumu.

## ⚙️ Kurulum (Nasıl Çalıştırılır?)

Bu projeyi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin.

### 1. Gereksinimleri Yükleyin
Proje Python ve Flask ile çalışır. Terminalde (veya Komut İsteminde) aşağıdaki kütüphaneleri yükleyin:
```bash
pip install flask apscheduler python-dotenv werkzeug
```

### 2. Ortam Değişkenlerini (Postane) Ayarlayın
Proje ana dizininde bir `.env` dosyası oluşturun (Bu dosya güvenlik sebebiyle GitHub'da yoktur). İçine şu bilgileri girin:
```env
EMAIL_ADDRESS=senin_bot_hesabin@gmail.com
EMAIL_PASSWORD=16_haneli_uygulama_sifresi
```
*(Not: Gmail kullanıyorsanız, Google hesap ayarlarından 2-Adımlı Doğrulamayı açıp bir **Uygulama Şifresi** almanız gerekmektedir).*

### 3. Uygulamayı Başlatın
Terminal üzerinden uygulamayı başlatın:
```bash
python app.py
```
Tarayıcınızdan `http://127.0.0.1:5000` adresine gidin. E-posta adresinizi girin, kendinize bir şifre belirleyin ve takviminizi oluşturmaya başlayın!

---
**Mimari ve Tasarım:** Kaan Ardal & Ekko (AI)
