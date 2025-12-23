/**
 * MatrixClock - Elegant minimalist analog clock
 * Exact replica of luxury watch design
 * OPTIMIZED: 30fps, no heavy effects
 */
export class MatrixClock {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('MatrixClock: Canvas not found:', canvasId);
            return;
        }
        this.ctx = this.canvas.getContext('2d');

        // Colors - Day (Green)
        this.dayColors = {
            accent: '#00ff41',
            accentDim: '#00aa2a',
            hand: '#ffffff',
            face: '#050a05'
        };

        // Colors - Night (Blue)
        this.nightColors = {
            accent: '#00f0ff',
            accentDim: '#0088aa',
            hand: '#ffffff',
            face: '#05050a'
        };

        this.isNightMode = false;
        this.colors = this.dayColors;
        this.lastDrawTime = 0;
        this.frameInterval = 33; // ~30fps

        this.init();
        this.animate();
    }

    init() {
        this.resize();
        this.handleResize();
    }

    resize() {
        const parent = this.canvas.parentElement;
        if (parent) {
            this.canvas.width = parent.clientWidth;
            this.canvas.height = parent.clientHeight;
        }
    }

    setNightMode(enabled) {
        this.isNightMode = enabled;
        this.colors = enabled ? this.nightColors : this.dayColors;
    }

    refresh() {
        this.resize();
    }

    drawClock() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.42;

        // Clear
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const ms = now.getMilliseconds();
        const smoothSec = seconds + ms / 1000;

        // === OUTER METALLIC BEZEL ===
        // Dark metallic ring
        const bezelOuter = radius + 25;
        const bezelInner = radius + 8;

        ctx.beginPath();
        ctx.arc(cx, cy, bezelOuter, 0, Math.PI * 2);
        ctx.arc(cx, cy, bezelInner, 0, Math.PI * 2, true);
        const bezelGrad = ctx.createLinearGradient(cx - bezelOuter, cy - bezelOuter, cx + bezelOuter, cy + bezelOuter);
        bezelGrad.addColorStop(0, '#4a4a4a');
        bezelGrad.addColorStop(0.3, '#3a3a3a');
        bezelGrad.addColorStop(0.5, '#555555');
        bezelGrad.addColorStop(0.7, '#3a3a3a');
        bezelGrad.addColorStop(1, '#2a2a2a');
        ctx.fillStyle = bezelGrad;
        ctx.fill();

        // === ELEGANT GLOWING BORDERS (colored gradient - green day, blue night) ===
        // Left side glow arc
        ctx.beginPath();
        ctx.arc(cx, cy, bezelOuter - 2, Math.PI * 0.6, Math.PI * 1.4);
        const leftGlow = ctx.createLinearGradient(cx - bezelOuter, cy, cx - bezelInner, cy);
        leftGlow.addColorStop(0, 'transparent');
        leftGlow.addColorStop(0.5, this.colors.accent + '40');
        leftGlow.addColorStop(1, 'transparent');
        ctx.strokeStyle = leftGlow;
        ctx.lineWidth = 6;
        ctx.stroke();

        // Right side glow arc
        ctx.beginPath();
        ctx.arc(cx, cy, bezelOuter - 2, -Math.PI * 0.4, Math.PI * 0.4);
        const rightGlow = ctx.createLinearGradient(cx + bezelInner, cy, cx + bezelOuter, cy);
        rightGlow.addColorStop(0, 'transparent');
        rightGlow.addColorStop(0.5, this.colors.accent + '40');
        rightGlow.addColorStop(1, 'transparent');
        ctx.strokeStyle = rightGlow;
        ctx.lineWidth = 6;
        ctx.stroke();

        // Hour markers on bezel (normal 12-hour format)
        ctx.font = '10px Arial';
        ctx.fillStyle = '#888888';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const hourNums = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const dist = radius + 17;
            const x = cx + Math.cos(angle) * dist;
            const y = cy + Math.sin(angle) * dist;
            ctx.fillText(hourNums[i], x, y);
        }

        // Small tick marks between numbers
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 1;
        for (let i = 0; i < 60; i++) {
            if (i % 5 !== 0) {
                const angle = (i * 6 - 90) * (Math.PI / 180);
                const x1 = cx + Math.cos(angle) * (radius + 10);
                const y1 = cy + Math.sin(angle) * (radius + 10);
                const x2 = cx + Math.cos(angle) * (radius + 14);
                const y2 = cy + Math.sin(angle) * (radius + 14);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }

        // === GREEN ACCENT RING ===
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = this.colors.accent;
        ctx.lineWidth = 2;
        ctx.stroke();

        // === CLOCK FACE (very dark with subtle green gradient) ===
        const faceGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        faceGrad.addColorStop(0, 'rgba(0, 40, 0, 0.3)');
        faceGrad.addColorStop(0.4, 'rgba(0, 20, 0, 0.2)');
        faceGrad.addColorStop(1, '#000000');

        ctx.beginPath();
        ctx.arc(cx, cy, radius + 3, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.fillStyle = faceGrad;
        ctx.fill();

        // === CENTER CIRCLES (filled transparent - green day, blue night) ===
        // Outer circle - filled
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = this.isNightMode ? 'rgba(0, 180, 255, 0.08)' : 'rgba(0, 200, 60, 0.08)';
        ctx.fill();

        // Middle circle - filled
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.30, 0, Math.PI * 2);
        ctx.fillStyle = this.isNightMode ? 'rgba(0, 200, 255, 0.12)' : 'rgba(0, 220, 80, 0.12)';
        ctx.fill();

        // Inner circle - filled
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.16, 0, Math.PI * 2);
        ctx.fillStyle = this.isNightMode ? 'rgba(0, 220, 255, 0.18)' : 'rgba(0, 240, 100, 0.18)';
        ctx.fill();

        // === HOUR MARKERS (green dots) ===
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const isMain = i === 0 || i === 3 || i === 6 || i === 9;
            const dotRadius = isMain ? 4 : 3;
            const dist = radius * 0.88;

            const x = cx + Math.cos(angle) * dist;
            const y = cy + Math.sin(angle) * dist;

            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = this.colors.accent;
            ctx.fill();
        }

        // === 12 O'CLOCK TRIANGLE (pointing down) ===
        const triY = cy - radius * 0.95;
        ctx.beginPath();
        ctx.moveTo(cx, triY + 12);      // bottom point
        ctx.lineTo(cx - 7, triY);       // top left
        ctx.lineTo(cx + 7, triY);       // top right
        ctx.closePath();
        ctx.fillStyle = this.colors.accent;
        ctx.fill();

        // === 6 O'CLOCK VERTICAL LINE ===
        const sixY = cy + radius * 0.88;
        ctx.beginPath();
        ctx.moveTo(cx, sixY - 8);
        ctx.lineTo(cx, sixY + 8);
        ctx.strokeStyle = this.colors.accent;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        // === 3 AND 9 O'CLOCK HORIZONTAL LINES ===
        // 9 o'clock
        const nineX = cx - radius * 0.88;
        ctx.beginPath();
        ctx.moveTo(nineX - 8, cy);
        ctx.lineTo(nineX + 8, cy);
        ctx.stroke();

        // 3 o'clock
        const threeX = cx + radius * 0.88;
        ctx.beginPath();
        ctx.moveTo(threeX - 8, cy);
        ctx.lineTo(threeX + 8, cy);
        ctx.stroke();

        // === CLOCK HANDS ===

        // Hour Hand (thick white)
        const hourAngle = ((hours % 12) * 30 + minutes * 0.5 - 90) * (Math.PI / 180);
        const hourLen = radius * 0.45;
        const hourX = cx + Math.cos(hourAngle) * hourLen;
        const hourY = cy + Math.sin(hourAngle) * hourLen;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(hourX, hourY);
        ctx.strokeStyle = this.colors.hand;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Minute Hand (medium white)
        const minAngle = (minutes * 6 + seconds * 0.1 - 90) * (Math.PI / 180);
        const minLen = radius * 0.68;
        const minX = cx + Math.cos(minAngle) * minLen;
        const minY = cy + Math.sin(minAngle) * minLen;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(minX, minY);
        ctx.lineWidth = 3;
        ctx.stroke();

        // Second Hand (thin white with tail)
        const secAngle = (smoothSec * 6 - 90) * (Math.PI / 180);
        const secLen = radius * 0.82;
        const secX = cx + Math.cos(secAngle) * secLen;
        const secY = cy + Math.sin(secAngle) * secLen;

        // Tail
        const tailLen = 25;
        const tailX = cx + Math.cos(secAngle + Math.PI) * tailLen;
        const tailY = cy + Math.sin(secAngle + Math.PI) * tailLen;

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(secX, secY);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // === CENTER HUB ===
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#333333';
        ctx.fill();
    }

    animate() {
        const now = performance.now();
        if (now - this.lastDrawTime >= this.frameInterval) {
            this.drawClock();
            this.lastDrawTime = now;
        }
        requestAnimationFrame(() => this.animate());
    }

    handleResize() {
        let timeout;
        const doResize = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => this.resize(), 100);
        };
        window.addEventListener('resize', doResize);
        if (this.canvas.parentElement) {
            new ResizeObserver(doResize).observe(this.canvas.parentElement);
        }
    }
}

/**
 * MiniMatrixClock - Compact version for small containers
 */
export class MiniMatrixClock {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        this.dayColors = { accent: '#00ff41', hand: '#ffffff' };
        this.nightColors = { accent: '#00f0ff', hand: '#ffffff' };
        this.colors = this.dayColors;
        this.isNightMode = false;
        this.animationId = null;
        this.lastDrawTime = 0;

        this.init();
    }

    init() {
        this.resize();
        this.startAnimation();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const p = this.canvas.parentElement;
        if (p) {
            this.canvas.width = p.clientWidth;
            this.canvas.height = p.clientHeight;
        }
    }

    setNightMode(e) {
        this.isNightMode = e;
        this.colors = e ? this.nightColors : this.dayColors;
    }

    drawClock() {
        const ctx = this.ctx;
        const w = this.canvas.width, h = this.canvas.height;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2, cy = h / 2;
        const r = Math.min(w, h) * 0.42;
        const now = new Date();
        const hr = now.getHours(), mn = now.getMinutes();
        const sc = now.getSeconds() + now.getMilliseconds() / 1000;

        // Border
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = this.colors.accent;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dots at 12, 3, 6, 9
        [0, 3, 6, 9].forEach(i => {
            const a = (i * 30 - 90) * Math.PI / 180;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(a) * (r * 0.8), cy + Math.sin(a) * (r * 0.8), 3, 0, Math.PI * 2);
            ctx.fillStyle = this.colors.accent;
            ctx.fill();
        });

        // Hands
        ctx.strokeStyle = this.colors.hand;
        ctx.lineCap = 'round';

        // Hour
        const ha = ((hr % 12) * 30 + mn * 0.5 - 90) * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ha) * r * 0.4, cy + Math.sin(ha) * r * 0.4);
        ctx.lineWidth = 3;
        ctx.stroke();

        // Minute
        const ma = (mn * 6 + sc * 0.1 - 90) * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ma) * r * 0.6, cy + Math.sin(ma) * r * 0.6);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Second
        const sa = (sc * 6 - 90) * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sa) * r * 0.7, cy + Math.sin(sa) * r * 0.7);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Center
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }

    startAnimation() {
        const animate = () => {
            const now = performance.now();
            if (now - this.lastDrawTime >= 33) {
                this.drawClock();
                this.lastDrawTime = now;
            }
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    stopAnimation() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }

    refresh() { this.resize(); }
    handleResize() { }
}
