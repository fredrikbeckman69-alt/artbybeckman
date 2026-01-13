/**
 * Constellation & Floating Art Background
 * Adapted for White & Gold Theme
 */

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let artParticles = [];

// Configuration
const PARTICLE_COUNT = 50;
const ART_COUNT = 8; // Fewer, larger art pieces
const CONNECT_DISTANCE = 160;
const MOUSE_DISTANCE = 250;

let mouse = { x: null, y: null };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('resize', resize);

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

// Simple Dot Particle
class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1; // Slightly larger for visibility
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        // Mouse interaction
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < MOUSE_DISTANCE) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (MOUSE_DISTANCE - distance) / MOUSE_DISTANCE;
            const directionX = forceDirectionX * force * 3;
            const directionY = forceDirectionY * force * 3;
            // Push away slightly
            this.x += directionX;
            this.y += directionY;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        // Vibrant blue for light background
        ctx.fillStyle = 'rgba(0, 113, 227, 0.3)';
        ctx.fill();
    }
}

// Image Particle (Floating Artwork)
class ArtParticle {
    constructor(imgSrc) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // majestic movement
        this.vx = (Math.random() - 0.5) * 0.1;
        this.vy = (Math.random() - 0.5) * 0.1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.0005;

        this.size = Math.random() * 300 + 200;

        this.opacity = 0;
        this.targetOpacity = 0.15; // Very subtle on white
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

        if (this.x < -this.size) this.x = width + this.size;
        if (this.x > width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = height + this.size;
        if (this.y > height + this.size) this.y = -this.size;

        if (this.fadeIn && this.opacity < this.targetOpacity) {
            this.opacity += 0.001;
        }
    }

    draw() {
        if (!this.loaded) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
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

    // Create Art Particles
    if (typeof GALLERY_IMAGES !== 'undefined' && GALLERY_IMAGES.length > 0) {
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
                // Vibrant purple-blue connections
                ctx.strokeStyle = `rgba(191, 90, 242, ${opacity * 0.3})`;
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

// Check for data loop or just start
window.onload = init;
