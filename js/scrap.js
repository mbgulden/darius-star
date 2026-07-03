class ScrapDrop {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'metal', 'cell', 'fragment'
        this.width = 12;
        this.height = 12;
        this.vx = (Math.random() - 0.5) * 60 - 50; // drifting left
        this.vy = (Math.random() - 0.5) * 80;
        this.spin = Math.random() * Math.PI;
        this.spinSpeed = 2 + Math.random() * 4;

        if (type === 'metal') {
            this.value = Math.floor(10 + Math.random() * 41); // 10-50
            this.color = '#c0c0c0'; // silver/grey
        } else if (type === 'cell') {
            this.value = Math.floor(100 + Math.random() * 151); // 100-250
            this.color = '#00ffff'; // neon cyan
        } else if (type === 'fragment') {
            this.value = Math.floor(500 + Math.random() * 501); // 500-1000
            this.color = '#ff00ff'; // neon purple
        }
    }
    update(dt) {
        // Apply magnetic pull toward player
        const dx = player.x + player.width/2 - this.x;
        const dy = player.y + player.height/2 - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        const magnetRadius = 100;
        if (dist < magnetRadius) {
            const pullForce = 350 * (1 - dist / magnetRadius);
            this.vx += (dx / dist) * pullForce * dt;
            this.vy += (dy / dist) * pullForce * dt;
        } else {
            this.vx = this.vx * 0.98;
            this.vy = this.vy * 0.98;
            this.x -= 40 * dt;
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.spin += this.spinSpeed * dt;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.spin);

        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = this.color;

        if (this.type === 'metal') {
            ctx.beginPath();
            for(let i=0; i<6; i++) {
                const angle = i * Math.PI / 3;
                ctx.lineTo(Math.cos(angle)*6, Math.sin(angle)*6);
            }
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'cell') {
            ctx.fillRect(-3, -6, 6, 12);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-1, -4, 2, 8);
        } else if (this.type === 'fragment') {
            ctx.fillRect(-5, -5, 10, 10);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(-5, -5, 10, 10);
        }

        ctx.restore();
    }
}
