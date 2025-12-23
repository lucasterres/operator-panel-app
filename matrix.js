export class MatrixRain {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Matrix characters - mix of katakana, latin, numbers
        this.chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.charArray = this.chars.split('');

        this.fontSize = 14;
        this.columns = Math.floor(this.width / this.fontSize);
        this.drops = [];

        // Day/Night mode
        this.isNightMode = false;
        this.dayColor = '#0f0';      // Green Matrix
        this.nightColor = '#00f0ff'; // Azul Elétrico (#00F0FF)

        // Initialize drops
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.floor(Math.random() * -100);
        }

        this.init();
        this.animate();
        this.handleResize();
    }

    setNightMode(enabled) {
        this.isNightMode = enabled;
        console.log(`Matrix Rain: Night mode ${enabled ? 'ON' : 'OFF'}`);
    }

    init() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    draw() {
        // Background with fade effect (slower fade = more visible characters)
        const fadeOpacity = this.isNightMode ? 0.03 : 0.05;
        this.ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Matrix text color (green day, blue night)
        this.ctx.fillStyle = this.isNightMode ? this.nightColor : this.dayColor;
        this.ctx.font = `${this.fontSize}px monospace`;

        for (let i = 0; i < this.drops.length; i++) {
            // Random character
            const char = this.charArray[Math.floor(Math.random() * this.charArray.length)];
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;

            this.ctx.fillText(char, x, y);

            // Reset drop to top randomly
            if (y > this.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }

            this.drops[i]++;
        }
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    handleResize() {
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.columns = Math.floor(this.width / this.fontSize);
            this.drops = [];
            for (let i = 0; i < this.columns; i++) {
                this.drops[i] = Math.floor(Math.random() * -100);
            }
            this.init();
        });
    }
}
