class ParallaxLayer {
    constructor(key, speed, yOffset = 0, alpha = 1.0, scale = 1.0) {
        this.key = key;          // Image key in bgImages — lazy-resolved at draw time
        this.speed = speed;
        this.yOffset = yOffset;
        this.alpha = alpha;
        this.scale = scale;
        this.offset = 0;
    }

    getImg() {
        // Lazy-resolve: bgImages is populated asynchronously by ensureBackgroundImages()
        return bgImages[this.key] || null;
    }

    update(dt) {
        const img = this.getImg();
        this.offset = (this.offset + this.speed * dt) % (img ? img.width : canvas.width);
    }

    draw() {
        const img = this.getImg();
        if (!img || !img.complete || img.naturalWidth === 0) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        const w = img.width * this.scale;
        const h = img.height * this.scale;
        // Tile horizontally for seamless scroll
        const drawX = -this.offset;
        const count = Math.ceil(canvas.width / w) + 1;
        for (let i = 0; i < count; i++) {
            ctx.drawImage(img, drawX + i * w, this.yOffset, w, h);
        }
        ctx.restore();
    }
}
