let particles = [];
let config = {
    gravity: 0.15,
    friction: 0.98,
    maxParticles: 500
};

self.onmessage = (e) => {
    const { type, data } = e.data;

    if (type === 'INIT') {
        config = { ...config, ...data };
    }

    if (type === 'SPAWN') {
        const { x, y, color, count = 8 } = data;
        for (let i = 0; i < count; i++) {
            if (particles.length >= config.maxParticles) {
                particles.shift();
            }
            particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 1.2) * 15, // Initial upward burst
                size: Math.random() * 4 + 2,
                life: 1.0,
                decay: Math.random() * 0.02 + 0.01,
                color: color
            });
        }
    }

    if (type === 'UPDATE') {
        updateParticles();
        self.postMessage({ type: 'STATE', particles });
    }
};

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.vx *= config.friction;
        p.vy += config.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}
