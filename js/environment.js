class EnvironmentParticle {
    constructor() {
        this.reset(true);
    }
    reset(initial = false) {
        this.x = initial ? Math.random() * canvas.width : canvas.width + 20;
        this.y = Math.random() * canvas.height;
        this.size = 0.6 + Math.random() * 2.5;
        this.speed = 8 + Math.random() * 25;
        this.drift = (Math.random() - 0.5) * 12;
        this.alpha = 0.05 + Math.random() * 0.18;
        this.color = Math.random() < 0.3 ? '#00ffaa' : '#3388aa';
    }
    update(dt) {
        this.x -= this.speed * dt;
        this.y += this.drift * dt;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
        if (this.x < -10) this.reset();
    }
    draw() {} // No-op — rendered via offscreen buffer
}
