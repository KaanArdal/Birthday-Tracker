document.addEventListener('DOMContentLoaded', () => {
    // Ekranlar
    const welcomeScreen = document.getElementById('welcome-screen');
    const appScreen = document.getElementById('app-screen');
    
    // Auth Formları
    const emailForm = document.getElementById('email-form');
    const passwordForm = document.getElementById('password-form');
    const emailInput = document.getElementById('user-email');
    const passwordInput = document.getElementById('user-password');
    const passwordConfirmGroup = document.getElementById('confirm-password-group');
    const passwordConfirmInput = document.getElementById('user-password-confirm');
    const authMessage = document.getElementById('auth-message');
    const authError = document.getElementById('auth-error');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const backBtn = document.getElementById('back-btn');

    const displayEmail = document.getElementById('display-email');
    const logoutBtn = document.getElementById('logout-btn');
    const globalReminderSelect = document.getElementById('global-reminder');

    // Dashboard Form & List
    const birthdayForm = document.getElementById('birthday-form');
    const bdayName = document.getElementById('name');
    const bdayDate = document.getElementById('date');
    const upcomingList = document.getElementById('upcoming-list');
    
    // New Event Type Elements
    const eventTypeRadios = document.getElementsByName('eventType');
    const specialDayAddon = document.getElementById('special-day-addon');

    eventTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'special') {
                bdayName.placeholder = "Örn: Kaan'ın Düğün Yıl Dönümü";
                specialDayAddon.classList.remove('hidden');
                bdayName.style.paddingRight = '55px';
            } else {
                bdayName.placeholder = "İsim";
                specialDayAddon.classList.add('hidden');
                bdayName.style.paddingRight = '12px';
            }
        });
    });

    // Takvim Elemanları
    const grid = document.getElementById('calendar-grid');
    const monthYearDisplay = document.getElementById('month-year-display');
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');

    // State
    let currentUser = localStorage.getItem('bt_user_email') || null;
    let currentDate = new Date();
    let birthdays = [];
    let isRegistering = false;
    let pendingEmail = "";
    let globalReminder = 0;

    // Resmi Tatiller (Sabit)
    const holidays = [
        { id: 'h1', name: "🇹🇷 Yeni Yıl", date: "0000-01-01", isHoliday: true },
        { id: 'h2', name: "🇹🇷 23 Nisan Çocuk Bayramı", date: "0000-04-23", isHoliday: true },
        { id: 'h3', name: "🇹🇷 1 Mayıs İşçi Bayramı", date: "0000-05-01", isHoliday: true },
        { id: 'h4', name: "🇹🇷 19 Mayıs Gençlik Bayramı", date: "0000-05-19", isHoliday: true },
        { id: 'h5', name: "🇹🇷 15 Temmuz Demokrasi Bayramı", date: "0000-07-15", isHoliday: true },
        { id: 'h6', name: "🇹🇷 30 Ağustos Zafer Bayramı", date: "0000-08-30", isHoliday: true },
        { id: 'h7', name: "🇹🇷 29 Ekim Cumhuriyet Bayramı", date: "0000-10-29", isHoliday: true }
    ];

    // Renk Paletini 12'ye çıkardık
    const pillColors = [
        '#ff477e', '#ff9f1c', '#06d6a0', '#118ab2', '#9d4edd', '#ffd166',
        '#ef476f', '#073b4c', '#118ab2', '#00b4d8', '#8338ec', '#ff006e'
    ];

    function getColorForName(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return pillColors[Math.abs(hash) % pillColors.length];
    }

    // Burç Algoritması
    function getZodiacSign(dateString) {
        if (!dateString || dateString.startsWith("0000-")) return "";
        const parts = dateString.split('-');
        if(parts.length !== 3) return "";
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);

        if ((month == 1 && day <= 20) || (month == 12 && day >= 22)) return "Oğlak ♑";
        if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) return "Kova ♒";
        if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Balık ♓";
        if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Koç ♈";
        if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Boğa ♉";
        if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "İkizler ♊";
        if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Yengeç ♋";
        if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Aslan ♌";
        if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Başak ♍";
        if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Terazi ♎";
        if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Akrep ♏";
        if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Yay ♐";
        return "";
    }

    // --- GİRİŞ / ÇIKIŞ SİSTEMİ (AUTH) ---
    if (currentUser) {
        showAppScreen();
    }

    emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        pendingEmail = emailInput.value.trim();
        if(!pendingEmail) return;

        try {
            const res = await fetch('/api/check_email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingEmail })
            });
            const data = await res.json();
            
            emailForm.classList.add('hidden');
            passwordForm.classList.remove('hidden');
            authError.textContent = "";
            passwordInput.value = "";
            passwordConfirmInput.value = "";

            if(data.exists) {
                isRegistering = false;
                authMessage.innerHTML = `Hoşgeldin <b>${pendingEmail}</b>.<br>Lütfen şifreni gir.`;
                passwordConfirmGroup.classList.add('hidden');
                passwordConfirmInput.removeAttribute('required');
                authSubmitBtn.innerHTML = "<span>Giriş Yap</span>";
            } else {
                isRegistering = true;
                authMessage.innerHTML = `Yeni Hesap Oluşturuluyor:<br><b>${pendingEmail}</b>`;
                passwordConfirmGroup.classList.remove('hidden');
                passwordConfirmInput.setAttribute('required', 'true');
                authSubmitBtn.innerHTML = "<span>Kayıt Ol</span>";
            }
        } catch (err) {
            console.error(err);
        }
    });

    backBtn.addEventListener('click', () => {
        passwordForm.classList.add('hidden');
        emailForm.classList.remove('hidden');
        authError.textContent = "";
    });

    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pwd = passwordInput.value;
        const confirmPwd = passwordConfirmInput.value;

        if(isRegistering && pwd !== confirmPwd) {
            authError.textContent = "Şifreler eşleşmiyor!";
            return;
        }

        const endpoint = isRegistering ? '/api/register' : '/api/login';
        
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingEmail, password: pwd })
            });
            
            const data = await res.json();
            
            if(res.ok) {
                currentUser = pendingEmail;
                localStorage.setItem('bt_user_email', currentUser);
                if (data.reminder !== undefined) {
                    globalReminderSelect.value = data.reminder;
                }
                showAppScreen();
            } else {
                authError.textContent = data.error || "Bir hata oluştu.";
            }
        } catch (err) {
            authError.textContent = "Bağlantı hatası.";
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('bt_user_email');
        currentUser = null;
        pendingEmail = "";
        appScreen.classList.add('hidden');
        appScreen.classList.remove('active');
        welcomeScreen.classList.remove('hidden');
        welcomeScreen.classList.add('active');
        
        emailInput.value = '';
        passwordForm.classList.add('hidden');
        emailForm.classList.remove('hidden');
    });

    // Hatırlatıcı Ayarını Değiştirme
    globalReminderSelect.addEventListener('change', async (e) => {
        const val = e.target.value;
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser, reminder: val })
            });
        } catch (error) {
            console.error("Ayar güncellenemedi:", error);
        }
    });

    function showAppScreen() {
        welcomeScreen.classList.add('hidden');
        welcomeScreen.classList.remove('active');
        appScreen.classList.remove('hidden');
        appScreen.classList.add('active');
        displayEmail.textContent = currentUser;
        
        bdayName.value = '';
        bdayDate.value = new Date().toISOString().split('T')[0];
        
        fetchBirthdays();
    }

    // --- API İŞLEMLERİ ---
    async function fetchBirthdays() {
        try {
            const res = await fetch(`/api/birthdays?email=${encodeURIComponent(currentUser)}`);
            if(res.ok) {
                const data = await res.json();
                birthdays = [...data.birthdays, ...holidays];
                if (data.reminder !== undefined) {
                    globalReminderSelect.value = data.reminder;
                }
                renderCalendar();
                renderUpcomingList();
            }
        } catch (error) {
            console.error("Veriler alınamadı:", error);
        }
    }

    async function addBirthday(name, dateStr) {
        let type = 'birthday';
        for (const radio of eventTypeRadios) {
            if (radio.checked) {
                type = radio.value;
                break;
            }
        }
        
        try {
            const res = await fetch('/api/birthdays', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser, name, date: dateStr, type: type })
            });
            if (res.ok) {
                bdayName.value = '';
                fetchBirthdays(); 
            }
        } catch (error) {
            console.error("Kayıt eklenemedi:", error);
        }
    }

    window.deleteBirthday = async (id, e) => {
        e.stopPropagation();
        if(typeof id === 'string' && id.startsWith('h')) return;
        
        try {
            const res = await fetch(`/api/birthdays/${encodeURIComponent(currentUser)}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchBirthdays();
            }
        } catch (error) {
            console.error("Kayıt silinemedi:", error);
        }
    }

    birthdayForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addBirthday(bdayName.value, bdayDate.value);
    });

    // --- LİSTE MANTIĞI ---
    function renderUpcomingList() {
        upcomingList.innerHTML = '';
        const today = new Date();
        const currentYear = today.getFullYear();
        
        let realPeople = birthdays.filter(b => !b.isHoliday);
        
        if (realPeople.length === 0) {
            upcomingList.innerHTML = '<li style="color:var(--text-main); font-size:12px; text-align:center; padding:10px;">Henüz kimseyi eklemedin.</li>';
            return;
        }

        let upcoming = realPeople.map(b => {
            let bDate = new Date(b.date);
            let nextBday = new Date(currentYear, bDate.getMonth(), bDate.getDate());
            
            if (nextBday < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                nextBday.setFullYear(currentYear + 1);
            }
            
            return {
                ...b,
                nextDate: nextBday,
                diffDays: Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24)),
                age: nextBday.getFullYear() - bDate.getFullYear()
            };
        });

        upcoming.sort((a, b) => a.diffDays - b.diffDays);
        
        upcoming.slice(0, 5).forEach(b => {
            const li = document.createElement('li');
            li.className = 'list-item';
            const options = { day: 'numeric', month: 'long' };
            const dateStr = b.nextDate.toLocaleDateString('tr-TR', options);
            let daysText = b.diffDays === 0 ? 'Bugün!' : (b.diffDays === 1 ? 'Yarın' : `${b.diffDays} gün kaldı`);
            
            let zodiacStr = "";
            let subText = "";
            
            if (b.type === 'special') {
                subText = `(${b.age}. Yılı)`;
            } else {
                const zodiac = getZodiacSign(b.date);
                zodiacStr = zodiac ? `(${zodiac})` : "";
                subText = `(${b.age} yaşına girecek)`;
            }

            li.innerHTML = `
                <div class="list-info">
                    <span class="list-name">${b.name} <span style="font-weight:400;">${zodiacStr}</span> <span style="font-size:11px; color:rgba(255,255,255,0.4);">${subText}</span></span>
                    <span class="list-date">${dateStr} (${daysText})</span>
                </div>
                <button class="pill-del-btn" onclick="deleteBirthday(${b.id}, event)" style="display:flex; position:static;">&times;</button>
            `;
            upcomingList.appendChild(li);
        });
    }

    // --- TAKVİM MANTIĞI ---
    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    function renderCalendar() {
        grid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        for (let i = 0; i < startDayIndex; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell empty';
            grid.appendChild(emptyCell);
        }

        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell';
            if (isCurrentMonth && day === today.getDate()) {
                cell.classList.add('today');
            }

            const dateNum = document.createElement('div');
            dateNum.className = 'date-num';
            dateNum.textContent = day;
            cell.appendChild(dateNum);

            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            const searchSuffix = `-${monthStr}-${dayStr}`;

            const todaysBdays = birthdays.filter(b => b.date.endsWith(searchSuffix));

            todaysBdays.forEach(b => {
                const pill = document.createElement('div');
                pill.className = 'bday-pill';
                
                let zodiacStr = "";
                if (b.type !== 'special') {
                    const zodiac = getZodiacSign(b.date);
                    zodiacStr = zodiac && !b.isHoliday ? `(${zodiac})` : "";
                }

                if (b.isHoliday) {
                    pill.style.backgroundColor = '#e63946';
                    pill.style.color = '#ffffff';
                } else {
                    pill.style.backgroundColor = getColorForName(b.name);
                    pill.style.color = "#050508";
                }

                pill.innerHTML = `
                    <span>${b.name} <span style="font-weight:400; font-size:10px;">${zodiacStr}</span></span>
                    ${!b.isHoliday ? `<button class="pill-del-btn" onclick="deleteBirthday(${b.id}, event)">&times;</button>` : ''}
                `;
                cell.appendChild(pill);
            });

            grid.appendChild(cell);
        }
    }

    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
});
