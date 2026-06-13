const catalogData = {
    vdnh_fountain: {
        index: '08 / 15 — SERIES №3: ATMOSPHERE & HERITAGE',
        title: 'ВДНХ. Фонтан.<br>Атмосфера.',
        description: 'Сложная динамика водного потока на фоне монументальной купольной архитектуры ВДНХ. Контраст летящих брызг и статичного величия наследия ушедшей эпохи. Уникальная оптика исследователя городской среды превращает масштабное монументальное здание в чистый интерьерный арт-объект.',
        image: 'assets/IMG_20260525_011725_166.jpg',
        alt: 'ВДНХ фонтан.'
    },
    kosmaj: {
        index: '02 / 15 — SERIES №1: BRUTAL & FORM',
        title: 'Монумент Космай.<br>Сербия.',
        description: 'Бескомпромиссная геометрия югославского брутализма в зимней меланхолии. Монолитная бетонная звезда, уходящая в туманное небо, избавляет пространство от лишнего визуального шума. Графичный и сильный кадр, который идеально держит плоскость стены.',
        image: 'assets/пост 1.jpg',
        alt: 'Сербия. Монумент Космай.'
    },
    tsaritsyno: {
        index: '04 / 15 — SERIES №3: ATMOSPHERE & HERITAGE',
        title: 'Панорама дворца.<br>Царицыно.',
        description: 'Классическое архитектурное наследие, переосмысленное через строгую графику. Осенняя меланхолия и монументальный силуэт царицынской псевдоготики, очищенные от цветового шума с помощью глубокой черно-белой контрастности.',
        image: 'assets/PA111668.jpg',
        alt: 'Москва. Царицыно.'
    },
    tbilisi: {
        index: '01 / 15 — SERIES №1: BRUTAL & FORM',
        title: 'Геометрия формы.<br>Тбилиси.',
        description: 'Études urbaines представляет кураторский взгляд на культовую бруталистскую архитектуру Тбилиси. Жесткие тектонические блоки, чистая симметрия и контрастный бирюзовый акцент на фоне глубокого неба.',
        image: 'assets/P1050803.jpg',
        alt: 'Тбилиси. Банк Грузии.'
    },
    city: {
        index: '03 / 15 — SERIES №2: CYBER & NEON',
        title: 'Сити в тумане.<br>Москва.',
        description: 'Кинематографичный ночной урбанизм в духе Бегущего по лезвию. Плавная дуга эстакады на переднем плане задает глубокую динамику кадра, направляя взгляд к высоткам, растворяющимся в густом холодном тумане.',
        image: 'assets/IMG_20260306_104846_943.jpg',
        alt: 'Москва. Сити в тумане.'
    },
    kosmaj_r2: {
        index: '02Б / 15 — SERIES №1: BRUTAL & FORM',
        title: 'Космай. Ракурс 2.<br>Сербия.',
        description: 'Второй взгляд на геометрию монумента. Более детальный акцент на стыках бетонных плит и уходящих вверх направляющих линиях.',
        image: 'assets/IMG_20260104_201002_128.jpg',
        alt: 'Монумент Космай. Ракурс 2.'
    },
    kosmaj_r3: {
        index: '02В / 15 — SERIES №1: BRUTAL & FORM',
        title: 'Космай. Ракурс 3.<br>Сербия.',
        description: 'Контрастный архитектурный план бруталистского наследия. Очищенная от контекста форма, превращающая монумент в чистый абстрактный паттерн.',
        image: 'assets/пост 2.jpg',
        alt: 'Монумент Космай. Ракурс 3.'
    },
    panelka: {
        index: '05 / 15 — SERIES №1: BRUTAL & FORM',
        title: 'Панелька с вопросом.<br>Урбанизм.',
        description: 'Исследование ритма типовой жилой застройки постсоветского пространства. Геометрия оконных рам, игра света и тени.',
        image: 'assets/PB100206-3.jpg',
        alt: 'Панелька с вопросом.'
    },
    circular_house: {
        index: '06 / 15 — SERIES №1: BRUTAL & FORM',
        title: 'Circular House.<br>Архитектура.',
        description: 'Уникальная круговая панорама жилого массива. Архитектурный эксперимент советского модернизма, зафиксированный в вечернем освещении.',
        image: 'assets/P1012089.jpg',
        alt: 'Circular house.'
    },
    red_city: {
        index: '07 / 15 — SERIES №2: CYBER & NEON',
        title: 'Красный Сити.<br>Киберпанк.',
        description: 'Агрессивный, глубокий неоновый спектр ночного мегаполиса. Отражения, стекло, высотные доминанты и насыщенный красный тон.',
        image: 'assets/IMG_20260306_104817_033.jpg',
        alt: 'Красный сити.'
    },
    tsaritsyno_p2: {
        index: '04Б / 15 — SERIES №3: ATMOSPHERE & HERITAGE',
        title: 'Панорама дворца. Р2.<br>Царицыно.',
        description: 'Второй ракурс исторического ансамбля в Царицыно. Фокус на проработке кирпичной кладки и узорах готических оконных арок.',
        image: 'assets/PA111724.jpg',
        alt: 'Панорама дворца. Ракурс 2.'
    },
    vdnh_tower: {
        index: '09 / 15 — SERIES №3: ATMOSPHERE & HERITAGE',
        title: 'Останкинская башня.<br>ВДНХ.',
        description: 'Графичный силуэт телебашни, пробивающий предзакатное небо. Кадр выстроен через естественную рамку парковой зелени.',
        image: 'assets/IMG_20260525_163640_186.jpg',
        alt: 'ВДНХ Останкинская башня.'
    }
};

let currentArtTitle = 'ВДНХ. Фонтан. Атмосфера';

function sendLeadToTelegram() {
    const botToken = '8678397591:AAGj-5YIw4ITiLsMpgJW4PVbeyJtKyqX17c';
    const chatId = '1000351665';

    const nameInput = document.getElementById('client-name');
    const contactInput = document.getElementById('client-contact');
    const btn = document.getElementById('submit-btn');

    if (!nameInput || !contactInput || !btn) return;

    const name = nameInput.value.trim();
    const contact = contactInput.value.trim();
    
    const activeBtn = document.querySelector('.format-btn.active');
    let activeFormat = 'Не выбран';
    if (activeBtn) {
        activeFormat = activeBtn.innerText.split('\n')[0].trim();
    }

    if (!name || !contact) {
        alert('Пожалуйста, заполните оба поля, чтобы мы могли связаться с вами.');
        return;
    }

    btn.innerText = 'ОТПРАВКА...';
    btn.disabled = true;

    const message = `🔔 *Новый лид [ÉTUDES URBAINES]*\n\n👤 *Имя:* ${name}\n📱 *Контакт:* ${contact}\n🖼 *Арт:* ${currentArtTitle}\n📐 *Формат:* ${activeFormat}`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' })
    })
    .then(response => {
        if (response.ok) {
            document.getElementById('order-form-container').innerHTML = `
                <div style="padding: 20px; background: #e6f4ea; color: #137333; text-align: center; font-size: 14px; font-weight: 500; letter-spacing: 0.05em;">
                    ЗАЯВКА ПРИНЯТА.<br><span style="font-size: 12px; font-weight: 400;">Мы свяжемся с вами для примерки арта в интерьер.</span>
                </div>
            `;
        } else {
            return response.json().then(err => { throw new Error(JSON.stringify(err)); });
        }
    })
    .catch(error => {
        alert('Произошла ошибка при отправке.');
        btn.innerText = 'ОФОРМИТЬ ПОД КЛЮЧ';
        btn.disabled = false;
    });
}

function selectArt(artKey) {
    const data = catalogData[artKey];
    if (data) {
        document.querySelector('.catalog-index').innerText = data.index;
        document.querySelector('.item-title').innerHTML = data.title;
        document.querySelector('.item-description').innerText = data.description;
        
        const mainImg = document.querySelector('.photo-frame img');
        mainImg.src = data.image;
        mainImg.alt = data.alt;
        
        currentArtTitle = data.title.replace('<br>', ' ');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Форматы
    const formatButtons = document.querySelectorAll('.format-btn');
    formatButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            formatButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 2. Клик по карточкам витрины
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => {
        item.addEventListener('click', function() {
            const artKey = this.getAttribute('data-art');
            selectArt(artKey);
            document.getElementById('back-to-archive-btn').style.display = 'none';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // 3. Управление навигацией
    const logoClickable = document.getElementById('logo-clickable');
    const navCollections = document.getElementById('nav-collections');
    const navArchive = document.getElementById('nav-archive');
    const navContacts = document.getElementById('nav-contacts');
    const backToArchiveBtn = document.getElementById('back-to-archive-btn');
    
    const mainHero = document.getElementById('main-hero');
    const mainShowcase = document.getElementById('main-showcase');
    const fullArchivePage = document.getElementById('full-archive-page');
    const aboutPage = document.getElementById('about-page');

    function showMainView() {
        mainHero.style.display = 'grid';
        mainShowcase.style.display = 'grid';
        fullArchivePage.style.display = 'none';
        aboutPage.style.display = 'none';
        backToArchiveBtn.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showArchiveView() {
        mainHero.style.display = 'none';
        mainShowcase.style.display = 'none';
        fullArchivePage.style.display = 'block';
        aboutPage.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showAboutView() {
        mainHero.style.display = 'none';
        mainShowcase.style.display = 'none';
        fullArchivePage.style.display = 'none';
        aboutPage.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    logoClickable.addEventListener('click', showMainView);
    navCollections.addEventListener('click', (e) => { e.preventDefault(); showMainView(); });
    navArchive.addEventListener('click', (e) => { e.preventDefault(); showArchiveView(); });
    navContacts.addEventListener('click', (e) => { e.preventDefault(); showAboutView(); });
    backToArchiveBtn.addEventListener('click', (e) => { e.preventDefault(); showArchiveView(); });

    // Клик по фото внутри архива
    const archiveItems = document.querySelectorAll('.archive-item');
    archiveItems.forEach(item => {
        item.addEventListener('click', function() {
            const artKey = this.getAttribute('data-art');
            
            mainHero.style.display = 'grid';
            mainShowcase.style.display = 'grid';
            fullArchivePage.style.display = 'none';
            aboutPage.style.display = 'none';
            backToArchiveBtn.style.display = 'block'; // Включаем кнопку назад в архив
            
            selectArt(artKey);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
});