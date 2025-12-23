
import { MatrixRain } from './matrix.js';
import { YouTubePlayer } from './youtube.js';
import { Character3D } from './character3d.js';
import { MatrixClock, MiniMatrixClock } from './matrixClock.js';

// --- Configuration ---
const CONFIG = {
    // Default Location
    LAT: 51.5074,
    LON: -0.1278,
    WEATHER_API: 'https://api.open-meteo.com/v1/forecast',
    LOCATION_NAME: 'London, UK',

    // Fallback APIs (Customize/Proxy as needed)
    API_NEWS: 'https://api.rss2json.com/v1/api.json', // Direct usage for demo, or use your own proxy

    // Tools
    RSS2JSON: 'https://api.rss2json.com/v1/api.json?rss_url=',
    NEWS_BASE_RSS: 'https://news.google.com/rss/search?q={QUERY}&hl={HL}&gl={GL}&ceid={GL}:{HL}',
    NEWS_HEADLINES_RSS: 'https://news.google.com/rss?hl={HL}&gl={GL}&ceid={GL}:{HL}',

    // Finance APIs
    COINGECKO: 'https://api.coingecko.com/api/v3/simple/price',
    FRANKFURTER: 'https://api.frankfurter.app/latest',

    // Defaults
    FINANCE_BASE: 'USD',
    FINANCE_MONITORED: ['EUR', 'BTC', 'ETH'],

    CURRENCIES: [
        { code: 'USD', name: 'Dollar (USD)', symbol: '$' },
        { code: 'EUR', name: 'Euro (EUR)', symbol: '€' },
        { code: 'GBP', name: 'Pound (GBP)', symbol: '£' },
        { code: 'JPY', name: 'Yen (JPY)', symbol: '¥' },
        { code: 'BRL', name: 'Real (BRL)', symbol: 'R$' },
        { code: 'CAD', name: 'Canadian Dollar (CAD)', symbol: '$' },
        { code: 'AUD', name: 'Australian Dollar (AUD)', symbol: '$' },
        { code: 'CHF', name: 'Swiss Franc (CHF)', symbol: 'Fr' },
        { code: 'CNY', name: 'Yuan (CNY)', symbol: '¥' }
    ],
    CRYPTOS: [
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
        { id: 'solana', symbol: 'SOL', name: 'Solana' },
        { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
        { id: 'ripple', symbol: 'XRP', name: 'XRP' }
    ]
};

const NEWS_TOPICS = [
    { id: 'headlines', title: 'Headlines', query: '' },
    { id: 'technology', title: 'Technology', query: 'technology' },
    { id: 'science', title: 'Science', query: 'science' },
    { id: 'business', title: 'Business', query: 'economy+business' },
    { id: 'gaming', title: 'Gaming', query: 'video+games' },
    { id: 'sports', title: 'Sports', query: 'sports' },
    { id: 'health', title: 'Health', query: 'health' },
    { id: 'entertainment', title: 'Entertainment', query: 'entertainment' }
];

const COUNTRY_CONFIG = {
    'US': { name: 'United States', flag: '🇺🇸', gl: 'US', hl: 'en-US' },
    'GB': { name: 'United Kingdom', flag: '🇬🇧', gl: 'GB', hl: 'en-GB' },
    'BR': { name: 'Brazil', flag: '🇧🇷', gl: 'BR', hl: 'pt-BR' },
    'FR': { name: 'France', flag: '🇫🇷', gl: 'FR', hl: 'fr-FR' },
    'DE': { name: 'Germany', flag: '🇩🇪', gl: 'DE', hl: 'de-DE' },
    'JP': { name: 'Japan', flag: '🇯🇵', gl: 'JP', hl: 'ja-JP' },
    'World': { name: 'World (Intl)', flag: '🌍', gl: 'US', hl: 'en-US' }
};

let currentNewsIndex = 0;
let currentNewsCountry = 'US';
let currentVisionIndex = 2; // Pet

// State
let isNightMode = false;
let currentLocationTimeZone = 'auto'; // Default to auto/local until fetched
let bedtimeSleep = '01:00';
let bedtimeWake = '09:00';
let isSleeping = false;
let enabledNewsTopics = NEWS_TOPICS.map((_, i) => i);

const VISION_VIEWS = [
    { id: 'clock', title: 'ANALOG CLOCK' },
    { id: 'youtube', title: "80'S TUBE VISION" },
    { id: 'pet', title: 'CORE SYSTEM' }
];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    setupMobileViewport();

    // Components
    const matrixRain = new MatrixRain('matrix-canvas');
    window.matrixRain = matrixRain;

    // Default video
    const initialVideo = localStorage.getItem('youtubeInitialVideo') || 'PLhGipfv0juZXQwciXts3t3RWZyIzDBgOt';
    new YouTubePlayer('youtube-player', initialVideo);

    const character = new Character3D('character-3d');
    window.character3D = character;

    // Load Settings
    loadSettings();

    // Start Loops
    updateClock();
    setInterval(updateClock, 1000);

    fetchWeather();
    fetchNews();
    fetchFinance();
    renderCalendar();

    // UI Setups
    setupTickerInteraction();
    setupNewsNavigation();
    setupNewsFullscreen();
    setupBedtime();
    setupVisionNavigation();
    setupPetFullscreen();
    setupYoutubeFullscreen();
    setupWelcomeScreen();
    setupSettings();

    // Clocks
    const matrixClock = new MatrixClock('matrix-clock-canvas');
    window.matrixClock = matrixClock;
    const miniMatrixClock = new MiniMatrixClock('mini-clock-canvas');
    window.miniMatrixClock = miniMatrixClock;

    // Periodic Refreshes
    setInterval(fetchWeather, 60000 * 30);
    setInterval(fetchNews, 60000 * 15);
    setInterval(fetchFinance, 60000 * 5);
    setInterval(checkBedtime, 30000);
});


// --- Simplified Handlers ---

function updateClock() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', timeZone: currentLocationTimeZone !== 'auto' ? currentLocationTimeZone : undefined };

    let timeStr;
    try { timeStr = now.toLocaleTimeString('en-US', timeOptions); }
    catch (e) { timeStr = now.toLocaleTimeString('en-US'); }

    document.getElementById('clock').textContent = timeStr;

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: currentLocationTimeZone !== 'auto' ? currentLocationTimeZone : undefined };
    let dateStr;
    try { dateStr = now.toLocaleDateString('en-US', dateOptions); }
    catch (e) { dateStr = now.toLocaleDateString('en-US'); }

    document.getElementById('date').textContent = dateStr;

    const fsClock = document.getElementById('news-fullscreen-clock');
    if (fsClock) fsClock.textContent = timeStr;
}

async function fetchWeather() {
    try {
        const url = `${CONFIG.WEATHER_API}?latitude=${CONFIG.LAT}&longitude=${CONFIG.LON}&current=temperature_2m,weather_code,is_day,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.timezone) currentLocationTimeZone = data.timezone;

        const currentTemp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;
        const isDay = data.current.is_day;
        const windSpeed = data.current.wind_speed_10m || 0;

        const newIsNightMode = (isDay === 0);
        if (isNightMode !== newIsNightMode) {
            isNightMode = newIsNightMode;
            applyDayNightMode();
        }

        // Update UI
        const info = getWeatherCodeInfo(code);
        const currentEl = document.getElementById('weather-current');
        currentEl.innerHTML = `
            <span class="temp">${currentTemp}°C</span>
            <span class="condition">${info.icon} ${info.text}</span>
            <span class="wind">💨 ${Math.round(windSpeed)} km/h</span>
            <span class="location">${CONFIG.LOCATION_NAME}</span>
        `;

        // Forecast
        const forecastEl = document.getElementById('weather-forecast');
        forecastEl.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const min = Math.round(data.daily.temperature_2m_min[i]);
            const max = Math.round(data.daily.temperature_2m_max[i]);
            const fCode = data.daily.weather_code[i];
            const fInfo = getWeatherCodeInfo(fCode);
            const date = new Date(data.daily.time[i]);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3).toUpperCase();

            const div = document.createElement('div');
            div.className = 'forecast-item';
            div.innerHTML = `<span class="day">${dayName}</span><span class="icon">${fInfo.icon}</span><span class="temp">${max}° / ${min}°</span>`;
            forecastEl.appendChild(div);
        }

        // Notify 3D System (Stubbed)
        if (window.character3D) {
            window.character3D.setWind(windSpeed, 0);
            window.character3D.setNightMode(isNightMode);
        }

    } catch (e) {
        console.error('Weather error:', e);
    }
}

function applyDayNightMode() {
    if (isNightMode) document.body.classList.add('night-mode');
    else document.body.classList.remove('night-mode');

    if (window.matrixRain) window.matrixRain.setNightMode(isNightMode);
    if (window.character3D) window.character3D.setNightMode(isNightMode);
    if (window.matrixClock) window.matrixClock.setNightMode(isNightMode);
    if (window.miniMatrixClock) window.miniMatrixClock.setNightMode(isNightMode);
}

function getWeatherCodeInfo(code) {
    if (code === 0) return { icon: '☀️', text: 'Clear' };
    if (code >= 1 && code <= 3) return { icon: '⛅', text: 'Cloudy' };
    if (code >= 45 && code <= 48) return { icon: '🌫️', text: 'Fog' };
    if (code >= 51 && code <= 67) return { icon: '🌧️', text: 'Rain' };
    if (code >= 71 && code <= 77) return { icon: '❄️', text: 'Snow' };
    if (code >= 80 && code <= 99) return { icon: '⛈️', text: 'Storm' };
    return { icon: '❓', text: 'Unknown' };
}

// --- News ---
async function fetchNews() {
    const list = document.getElementById('news-list');
    const topic = NEWS_TOPICS[currentNewsIndex];
    const country = COUNTRY_CONFIG[currentNewsCountry];

    let query = topic.query;
    let url;

    // Construct Google News RSS URL
    if (topic.id === 'headlines') {
        url = CONFIG.NEWS_HEADLINES_RSS.replace(/{HL}/g, country.hl).replace(/{GL}/g, country.gl);
    } else {
        url = CONFIG.NEWS_BASE_RSS.replace('{QUERY}', encodeURIComponent(query)).replace(/{HL}/g, country.hl).replace(/{GL}/g, country.gl);
    }

    // Proxy through RSS2JSON (Free tier limit applies!)
    // NOTE: In the private version we used a local Python proxy. For public web demo, we use a public API or you must host a backend.
    // Making this client-side via rss2json for 'skeleton' simplicity.
    const apiUrl = `${CONFIG.RSS2JSON}${encodeURIComponent(url)}`;

    list.innerHTML = '<div class="loading-spinner">Loading news...</div>';

    try {
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (data.status === 'ok') {
            renderNews(data.items);
        } else {
            console.warn('RSS API Error:', data);
            list.innerHTML = '<div class="news-item"><h3>News feed unavailable (API Limit or Error)</h3></div>';
        }
    } catch (e) {
        console.error('Fetch news error:', e);
        list.innerHTML = '<div class="news-item"><h3>Error loading news</h3></div>';
    }
}

function renderNews(items) {
    const list = document.getElementById('news-list');
    if (items && items.length > 0) {
        list.innerHTML = '';
        items.slice(0, 15).forEach(item => {
            const div = document.createElement('div');
            div.className = 'news-item';
            div.innerHTML = `<h3><a href="${item.link}" target="_blank">${item.title}</a></h3><div class="meta">${item.pubDate}</div>`;
            list.appendChild(div);
        });
    }
}

// --- Finance ---
async function fetchFinance() {
    const ticker = document.getElementById('finance-ticker');
    const baseCurrency = CONFIG.FINANCE_BASE;
    const monitoredList = CONFIG.FINANCE_MONITORED;

    // Split Fiat/Crypto
    const monitoredFiat = monitoredList.filter(c => CONFIG.CURRENCIES.find(x => x.code === c));
    const monitoredCrypto = monitoredList.filter(c => CONFIG.CRYPTOS.find(x => x.symbol === c));

    // URLs relative to base
    // Note: Frankfurter and CoinGecko logic similar to original, simplified error handling
    const items = [];
    const baseSymbol = CONFIG.CURRENCIES.find(c => c.code === baseCurrency)?.symbol || '$';

    try {
        // Fetch Fiat
        if (monitoredFiat.length > 0) {
            const res = await fetch(`${CONFIG.FRANKFURTER}?from=${baseCurrency}&to=${monitoredFiat.join(',')}`);
            const data = await res.json();
            if (data.rates) {
                monitoredFiat.forEach(code => {
                    // Invert: 1 Base = X Target ? No, we want Price of Target in Base
                    // Frankfurter ?from=USD&to=EUR -> 1 USD = 0.9 EUR. 
                    // Price of 1 EUR in USD = 1/0.9 = 1.11 USD.
                    const rate = data.rates[code];
                    if (rate) items.push({ symbol: code, price: (1 / rate), prefix: baseSymbol });
                });
            }
        }

        // Fetch Crypto
        if (monitoredCrypto.length > 0) {
            const ids = monitoredCrypto.map(s => CONFIG.CRYPTOS.find(c => c.symbol === s).id).join(',');
            const res = await fetch(`${CONFIG.COINGECKO}?ids=${ids}&vs_currencies=${baseCurrency.toLowerCase()}`);
            const data = await res.json();
            monitoredCrypto.forEach(sym => {
                const id = CONFIG.CRYPTOS.find(c => c.symbol === sym).id;
                if (data[id]) {
                    items.push({ symbol: sym, price: data[id][baseCurrency.toLowerCase()], prefix: baseSymbol });
                }
            });
        }

        if (items.length === 0) {
            ticker.innerHTML = '<span class="ticker-item">No currencies monitored</span>';
            return;
        }

        const html = items.map(i => `
            <span class="ticker-item">
                <span class="ticker-symbol">${i.symbol}</span>
                <span class="ticker-price">${i.prefix} ${i.price.toFixed(2)}</span>
            </span>`).join('');

        ticker.innerHTML = new Array(5).fill(html).join('');

    } catch (e) {
        console.error('Finance error:', e);
        ticker.innerHTML = '<span class="ticker-item">Ticker Offline</span>';
    }
}

// --- Interaction Utils (Ticker, UI) ---
function setupTickerInteraction() {
    const container = document.querySelector('.finance-ticker-container');
    const ticker = document.getElementById('finance-ticker');
    if (container && ticker) {
        container.addEventListener('mouseenter', () => ticker.getAnimations().forEach(a => a.updatePlaybackRate(0.2)));
        container.addEventListener('mouseleave', () => ticker.getAnimations().forEach(a => a.updatePlaybackRate(1.0)));
    }
}

// --- Calendar ---
function renderCalendar() {
    const container = document.getElementById('calendar-container');
    if (!container) return;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    let html = `<div class="calendar-header"><span>${now.toLocaleString('default', { month: 'long' })} ${currentYear}</span></div><div class="calendar-grid">`;
    // Simply render days 1..n for visual effect (simplified)
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = (i === now.getDate());
        html += `<div class="calendar-day ${isToday ? 'today' : ''}">${i}</div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

// --- Settings & Welcome Screen (Condensed) ---
function loadSettings() {
    const saved = localStorage.getItem('op_settings');
    if (saved) {
        const s = JSON.parse(saved);
        if (s.weather) { CONFIG.LAT = s.weather.lat; CONFIG.LON = s.weather.lon; CONFIG.LOCATION_NAME = s.weather.name; }
    }
}

function saveSettings() {
    const s = {
        weather: { lat: CONFIG.LAT, lon: CONFIG.LON, name: CONFIG.LOCATION_NAME }
    };
    localStorage.setItem('op_settings', JSON.stringify(s));
}

function setupWelcomeScreen() {
    const modal = document.getElementById('welcome-modal');
    const initBtn = document.getElementById('initialize-system-btn');
    const hasSeen = localStorage.getItem('op_welcome');

    // Setup Country Select
    const countrySelect = document.getElementById('setup-country');
    if (countrySelect) {
        Object.entries(COUNTRY_CONFIG).forEach(([code, c]) => {
            const opt = document.createElement('option');
            opt.value = code;
            opt.textContent = c.name;
            countrySelect.appendChild(opt);
        });
    }

    if (!hasSeen) {
        if (modal) modal.style.display = 'flex';
        initBtn.addEventListener('click', async () => {
            const city = document.getElementById('setup-city').value;
            const country = countrySelect.value;
            currentNewsCountry = country;

            // Basic Geocoding
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
            const data = await res.json();
            if (data.results && data.results[0]) {
                CONFIG.LAT = data.results[0].latitude;
                CONFIG.LON = data.results[0].longitude;
                CONFIG.LOCATION_NAME = `${data.results[0].name}, ${data.results[0].country_code}`;
                saveSettings();
                fetchWeather();
            }

            localStorage.setItem('op_welcome', 'true');
            modal.style.display = 'none';
            toggleFullscreenDocument();
        });
    }
}

// --- Utils ---
function setupMobileViewport() {
    // Logic for meta viewport override if needed
}

function toggleFullscreenDocument() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(e => { });
    }
}

function checkBedtime() {
    // Simplified Bedtime Logic
    const now = new Date();
    const min = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = bedtimeSleep.split(':').map(Number);
    const [wh, wm] = bedtimeWake.split(':').map(Number);
    const sMin = sh * 60 + sm;
    const wMin = wh * 60 + wm;

    // Check range...
    // (omitted for brevity in skeleton, functionality retained in full version)
}

function setupNewsNavigation() {  /* ... */ }
function setupNewsFullscreen() { /* ... */ }
function setupVisionNavigation() { /* ... */ }
function setupPetFullscreen() { /* ... */ }
function setupYoutubeFullscreen() { /* ... */ }
function setupSettings() {
    // Basic wiring for the settings panel
    const btn = document.getElementById('settings-btn');
    const panel = document.getElementById('settings-panel');
    const close = document.getElementById('settings-close');
    if (btn) btn.addEventListener('click', () => panel.classList.toggle('active'));
    if (close) close.addEventListener('click', () => panel.classList.remove('active'));
}

