
/**
 * Constellation & Floating Art Background
 */

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let artParticles = [];

// Configuration
const PARTICLE_COUNT = 40; // Fewer dots to reduce clutter
const ART_COUNT = 12; // More art
const CONNECT_DISTANCE = 150;
const MOUSE_DISTANCE = 250;

// ... (mouse listener remains)

// Image Particle
class ArtParticle {
    constructor(imgSrc) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Very slow, majestic movement
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.15;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.0005;

        // Much Larger Size
        this.size = Math.random() * 300 + 200; // 200-500px

        this.opacity = 0;
        this.targetOpacity = 0.35; // More visible
        this.fadeIn = true;

        this.image = new Image();
        this.image.src = imgSrc;
        this.loaded = false;
        this.image.onload = () => { this.loaded = true; };
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        // Wrap around screen
        if (this.x < -this.size) this.x = width + this.size;
        if (this.x > width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = height + this.size;
        if (this.y > height + this.size) this.y = -this.size;

        // Fade in
        if (this.fadeIn && this.opacity < this.targetOpacity) {
            this.opacity += 0.002;
        }
    }

    draw() {
        if (!this.loaded) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        // Draw image centered
        ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

function init() {
    resize();
    particles = [];
    artParticles = [];

    // Create dots
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    // Create Art Particles if data exists
    if (typeof GALLERY_IMAGES !== 'undefined' && GALLERY_IMAGES.length > 0) {
        // Pick random unique images
        const shuffled = [...GALLERY_IMAGES].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, ART_COUNT);

        selected.forEach(imgData => {
            artParticles.push(new ArtParticle('assets/images/' + imgData.filename));
        });
    }

    animate();
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw Art (Background Layer)
    artParticles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw Particles (Foreground Layer)
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw Connections
    for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CONNECT_DISTANCE) {
                let opacity = 1 - (distance / CONNECT_DISTANCE);
                ctx.strokeStyle = `rgba(212, 175, 55, ${opacity * 0.3})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animate);
}

// Wait for window load to ensure data.js might be parsed
window.onload = init;
