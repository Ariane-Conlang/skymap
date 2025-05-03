// --- CONFIGURATION ---
const NUM_STARS = 1000; // number of stars to generate
const MAX_DISTANCE = 1000; // in arbitrary units
const CANVAS_SIZE = 800; // canvas width and height
const STAR_RADIUS_SCALE = 3; // scaling factor for star size
const SPECTRAL_COLORS = {
    'O': '#9bb0ff',
    'B': '#aabfff',
    'A': '#cad7ff',
    'F': '#f8f7ff',
    'G': '#fff4ea',
    'K': '#ffd2a1',
    'M': '#ffcc6f'
};

// Global variables
let stars = [];
let hemisphere = 'north'; // current hemisphere ('north' or 'south')

// --- STAR GENERATOR ---
function generateStars(numStars) {
    const spectralClasses = Object.keys(SPECTRAL_COLORS);
    const stars = [];

    for (let i = 0; i < numStars; i++) {
        // Random spherical coordinates
        const r = Math.random() * MAX_DISTANCE;
        const theta = Math.acos(2 * Math.random() - 1); // 0 to pi
        const phi = Math.random() * 2 * Math.PI; // 0 to 2pi

        // Convert to Cartesian coordinates
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.sin(theta) * Math.sin(phi);
        const z = r * Math.cos(theta);

        const spectralClass = spectralClasses[Math.floor(Math.random() * spectralClasses.length)];
        const magnitude = Math.random() * 8; // approximate range

        stars.push({
            x, y, z,
            distance: r,
            mass: 0.1 + Math.random() * 50,
            class: spectralClass,
            magnitude: magnitude
        });
    }
    return stars;
}

// --- PROJECTION FUNCTION (simple orthographic) ---
function projectStar(star, canvasCenter, radius) {
    // Project onto plane perpendicular to z-axis
    const scale = radius / MAX_DISTANCE;
    const px = canvasCenter.x + star.x * scale;
    const py = canvasCenter.y - star.y * scale;
    return { x: px, y: py };
}

// --- DRAW FUNCTION ---
function drawStars(ctx, stars, hemisphere) {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const center = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };
    const radius = CANVAS_SIZE * 0.45; // fit inside circle

    // Optional: draw circle boundary
    ctx.strokeStyle = '#555';
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    ctx.stroke();

    for (const star of stars) {
        // Only show stars in selected hemisphere
        if (hemisphere === 'north' && star.z < 0) continue;
        if (hemisphere === 'south' && star.z > 0) continue;

        const pos = projectStar(star, center, radius);

        // Clip stars outside circle
        const dx = pos.x - center.x;
        const dy = pos.y - center.y;
        if (Math.sqrt(dx * dx + dy * dy) > radius) continue;

        // Set color based on spectral class
        ctx.fillStyle = SPECTRAL_COLORS[star.class] || 'white';

        // Set radius scaled inversely by magnitude (brighter = bigger)
        const starRadius = Math.max(0.5, STAR_RADIUS_SCALE * (1 / (star.magnitude + 1)));

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, starRadius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// --- INITIALIZATION ---
window.onload = function () {
    const canvas = document.getElementById('starCanvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext('2d');

    stars = generateStars(NUM_STARS);
    drawStars(ctx, stars, hemisphere);

    // Toggle button
    const toggleBtn = document.getElementById('toggleHemisphere');
    toggleBtn.addEventListener('click', () => {
        hemisphere = (hemisphere === 'north') ? 'south' : 'north';
        drawStars(ctx, stars, hemisphere);
        toggleBtn.textContent = `Switch to ${(hemisphere === 'north') ? 'Southern' : 'Northern'} Hemisphere`;
    });
};

