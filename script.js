// --- CONFIGURATION ---
const NUM_STARS = 1000;
const MAX_DISTANCE = 1000;
const CANVAS_SIZE = 400; // per hemisphere
const STAR_RADIUS_SCALE = 3;
const SPECTRAL_COLORS = {
    'O': '#9bb0ff',
    'B': '#aabfff',
    'A': '#cad7ff',
    'F': '#f8f7ff',
    'G': '#fff4ea',
    'K': '#ffd2a1',
    'M': '#ffcc6f'
};

let stars = [];

// --- STAR GENERATOR ---
function generateStars(numStars) {
    const spectralClasses = Object.keys(SPECTRAL_COLORS);
    const stars = [];

    for (let i = 0; i < numStars; i++) {
        // Uniform sphere distribution (cube root fix)
        const r = Math.cbrt(Math.random()) * MAX_DISTANCE;
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = Math.random() * 2 * Math.PI;

        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.sin(theta) * Math.sin(phi);
        const z = r * Math.cos(theta);

        const spectralClass = spectralClasses[Math.floor(Math.random() * spectralClasses.length)];
        const magnitude = Math.random() * 8;

        stars.push({
            id: i + 1,
            x, y, z,
            distance: r,
            mass: +(0.1 + Math.random() * 50).toFixed(2),
            class: spectralClass,
            magnitude: +magnitude.toFixed(2)
        });
    }
    return stars;
}

// --- PROJECTION FUNCTION ---
function projectStar(star, canvasCenter, radius) {
    const scale = radius / MAX_DISTANCE;
    const px = canvasCenter.x + star.x * scale;
    const py = canvasCenter.y - star.y * scale;
    return { x: px, y: py };
}

// --- DRAW FUNCTION ---
function drawStars(ctx, stars, hemisphere) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const center = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };
    const radius = CANVAS_SIZE * 0.45;

    ctx.strokeStyle = '#555';
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    ctx.stroke();

    for (const star of stars) {
        // Hemisphere filter
        if (hemisphere === 'north' && star.z < 0) continue;
        if (hemisphere === 'south' && star.z > 0) continue;

        const pos = projectStar(star, center, radius);

        const dx = pos.x - center.x;
        const dy = pos.y - center.y;
        if (Math.sqrt(dx * dx + dy * dy) > radius) continue;

        ctx.fillStyle = SPECTRAL_COLORS[star.class] || 'white';
        const starRadius = Math.max(0.5, STAR_RADIUS_SCALE * (1 / (star.magnitude + 1)));

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, starRadius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// --- UPDATE STAR DATA FROM INPUT ---
function updateStarField() {
    for (const star of stars) {
        const row = document.getElementById(`star-row-${star.id}`);
        if (row) {
            const classInput = row.querySelector('.class-input').value;
            const magInput = parseFloat(row.querySelector('.mag-input').value);
            const distInput = parseFloat(row.querySelector('.dist-input').value);

            star.class = classInput;
            star.magnitude = magInput;
            star.distance = distInput;
        }
    }
    // Redraw both hemispheres
    const ctxNorth = document.getElementById('canvasNorth').getContext('2d');
    const ctxSouth = document.getElementById('canvasSouth').getContext('2d');
    drawStars(ctxNorth, stars, 'north');
    drawStars(ctxSouth, stars, 'south');
}

// --- INITIALIZATION ---
window.onload = function () {
    const canvasNorth = document.getElementById('canvasNorth');
    const canvasSouth = document.getElementById('canvasSouth');
    canvasNorth.width = CANVAS_SIZE;
    canvasNorth.height = CANVAS_SIZE;
    canvasSouth.width = CANVAS_SIZE;
    canvasSouth.height = CANVAS_SIZE;

    const ctxNorth = canvasNorth.getContext('2d');
    const ctxSouth = canvasSouth.getContext('2d');

    stars = generateStars(NUM_STARS);

    drawStars(ctxNorth, stars, 'north');
    drawStars(ctxSouth, stars, 'south');

    const table = document.getElementById('starTable');
    for (const star of stars) {
        const row = document.createElement('tr');
        row.id = `star-row-${star.id}`;
        row.innerHTML = `
            <td>${star.id}</td>
            <td><input class="class-input" type="text" value="${star.class}" size="1"></td>
            <td><input class="mag-input" type="number" step="0.01" value="${star.magnitude}"></td>
            <td><input class="dist-input" type="number" step="0.1" value="${star.distance.toFixed(1)}"></td>
        `;
        table.appendChild(row);
    }

    document.getElementById('updateButton').addEventListener('click', updateStarField);
};
