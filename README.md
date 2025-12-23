
# Operator Panel (Open Source Skeleton)

<div align="center">
  <img src="public/favicon.svg" width="100" />
  <h1>Operator Panel</h1>
  <p>
    <strong>A cyberpunk ambient dashboard for your secondary monitor.</strong>
  </p>
  
  <a href="https://operatorpanel.app/">
    <img src="public/preview.png" alt="Operator Panel Preview" width="800" style="border-radius: 10px; border: 2px solid #00ff41;" />
  </a>

  <h3>
    <a href="https://operatorpanel.app/">🔴 LIVE APP DEMO</a>
  </h3>
</div>

---

## 💀 Why a Skeleton Version?
This repository contains the **architectural skeleton** of the Operator Panel. 

**Where is the "Living Pet"? Where are the events?**
The full "Live App" experience (available at [operatorpanel.app](https://operatorpanel.app/)) is designed to be full of **surprises, seasonal events, and hidden interactions**. To preserve the magic and prevent "spoilers" for our users, the proprietary assets (3D models, complex event logic, and audio) have been excluded from this open-source release.

Instead, this repo provides:
- The **complete Three.js + React/Vanilla JS integration**.
- A **reactive "Core" (Wireframe Sphere)** that demonstrates the interaction logic without revealing the characters.
- The full **Weather, News, and Finance** systems.

It serves as a perfect starting point for building your own ambient dashboard while showing how the original was built.

---

## 🔮 The Philosophy (Live App)
The **Operator Panel** was designed as a **low-stimulation, ambient companion** for focus and relaxation.

In a world of constant notifications and demanding interfaces, this dashboard sits quietly on your secondary screen or tablet, providing:
- **Calmness:** Dark, high-contrast aesthetics (inspired by the Matrix and Retro Computing) that don't distract.
- **Connection:** A "Living Clock" that knows the real weather outside your window and reacts to it.
- **Discovery:** A system that feels alive, with rare random events and seasonal changes that reward long-term usage.

---

## 🚀 Features (This Repo)
- **🕰️ Living Clock:** Real-time day/night cycles synchronized with your local weather.
- **☁️ Weather HUD:** Current conditions, forecast, and wind analysis (powered by Open-Meteo).
- **📰 News Feed:** Aggregated headlines from customized topics and countries.
- **💰 Finance Ticker:** Monitor Fiat and Crypto currency rates.
- **📺 Tube Vision:** Integrated YouTube player for background ambiance (requires API Key).
- **🧊 3D Core:** A Three.js interactive scene ready for your custom 3D assets.

## 🛠️ Installation

### Prerequisites
- Node.js (v16+)
- npm

### Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/lucasterres/operator-panel-app.git
   cd operator-panel-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## ⚙️ Configuration
The dashboard is configurable directly via the UI settings panel (Gear icon).
- **Location:** Auto-detects or sets city for weather.
- **YouTube:** Add your own [Google Cloud API Key](https://console.cloud.google.com/) to enable the video player.

## 📄 License
MIT License. Feel free to use and modify for your personal setup.
