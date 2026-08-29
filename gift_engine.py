import random

def get_gift_suggestions(age, zodiac, event_type):
    suggestions = []
    
    if event_type == 'special':
        special_gifts = [
            "Baş harflerinizin işlendiği veya kişiselleştirilmiş şık bir anı eşyası.",
            "Birlikte vakit geçirebileceğiniz güzel bir akşam yemeği rezervasyonu.",
            "İkiniz için tasarlanmış özel bir fotoğraf albümü veya anı defteri.",
            "Birlikte katılabileceğiniz bir atölye çalışması (seramik, aşçılık vb.).",
            "Şık bir ev dekorasyon ürünü (minimalist bir vazo veya tablo).",
            "Hafta sonu kaçamağı veya küçük bir tatil planı.",
            "Spa veya masaj hediye çeki.",
            "Özel tasarım çift fincanları veya takıları.",
            "Nostaljik bir pikap ve sevdiğiniz şarkıların olduğu bir plak.",
            "İkinizin ismine özel şarap veya şampanya kadehleri."
        ]
        suggestions = random.sample(special_gifts, 3)
        return suggestions
        
    # Doğum Günü için Yaş ve Burç bazlı
    base_gifts = []
    if age < 12:
        base_gifts = [
            "Yaşına uygun zeka geliştirici bir kutu oyunu.",
            "Renkli ve eğlenceli bir Lego seti.",
            "İlgisini çekecek resimli bir masal veya bilim kitabı.",
            "Uzaktan kumandalı veya interaktif bir oyuncak.",
            "Eğlenceli bir kırtasiye seti veya boyama malzemeleri."
        ]
    elif 12 <= age <= 19:
        base_gifts = [
            "Bluetooth kulaklık veya şık bir teknolojik aksesuar.",
            "İlgilendiği bir oyunun veya dijital platformun hediye çeki.",
            "Trend bir giysi veya şık bir sneaker.",
            "Oda dekorasyonu için neon ışıklar veya poster.",
            "Popüler bir yazarın çok satan genç kurgu kitabı."
        ]
    elif 20 <= age <= 50:
        base_gifts = [
            "Gündelik kullanıma uygun şık bir akıllı saat kordonu veya kılıf.",
            "Kaliteli bir kahve demleme ekipmanı (French Press, Moka Pot).",
            "İş veya günlük hayatı için premium deri bir cüzdan/kartlık.",
            "Spor yapmayı seviyorsa şık bir mat veya termos.",
            "Günün yorgunluğunu alacak aromaterapi difüzörü ve uçucu yağlar."
        ]
    else:
        base_gifts = [
            "Nostaljik ve kaliteli bir müzik çalar (radyo/pikap).",
            "Şık ve konforlu bir ev giyim ürünü (kaşmir şal vs.).",
            "Gurme lezzetler içeren özel bir hediye sepeti.",
            "Aile fotoğraflarını dijital olarak gösterebilen bir çerçeve.",
            "Bahçe veya ev bitkileri için şık bir bakım seti."
        ]
        
    # Burç Dokunuşları (Ekstra 1 seçenek burçtan gelir)
    zodiac_gifts = {
        "Koç ♈": "Enerjisini atabileceği bir spor ekipmanı veya macera deneyimi.",
        "Boğa ♉": "Damak tadına hitap eden gurme bir çikolata veya şarap seti.",
        "İkizler ♊": "Yeni bir hobiye başlaması için başlangıç seti veya kitap.",
        "Yengeç ♋": "Evini güzelleştirecek ve anıları canlandıracak bir çerçeve.",
        "Aslan ♌": "Gösterişli, kişiselleştirilmiş ve premium hissettiren bir aksesuar.",
        "Başak ♍": "Hayatını kolaylaştıracak pratik, şık ve düzenleyici bir ürün.",
        "Terazi ♎": "Estetik yönü yüksek, şık tasarımlı bir takı veya dekoratif obje.",
        "Akrep ♏": "Gizemli ve derinlikli bir roman veya şık bir parfüm.",
        "Yay ♐": "Seyahat etmeyi sevdiği için şık bir pasaport kılıfı veya termos.",
        "Oğlak ♑": "Kariyerinde veya masasında kullanabileceği prestijli bir dolma kalem.",
        "Kova ♒": "En son çıkan, ilginç ve yenilikçi bir teknolojik alet.",
        "Balık ♓": "Sanatsal yönüne hitap eden bir müzik kutusu veya el işi malzemesi."
    }
    
    # 2 Hediye yaş grubundan, 1 Hediye burçtan alıp karıştır
    selected_base = random.sample(base_gifts, 2)
    zodiac_gift = zodiac_gifts.get(zodiac, "Kendini şımartabileceği bir hediye çeki.")
    
    suggestions = selected_base + [zodiac_gift]
    random.shuffle(suggestions)
    
    return suggestions
