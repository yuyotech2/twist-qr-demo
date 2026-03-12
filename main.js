// AR Controller Functions
function startAR() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
        document.getElementById('mobile-warning').style.display = 'block';
        setTimeout(() => { document.getElementById('mobile-warning').style.display = 'none'; }, 5000);
        return;
    }

    const arContainer = document.getElementById('ar-container');
    arContainer.style.display = 'block';
    
    // Inject AR Engine dynamically to prevent 0x0 canvas bugs on mobile
    const wrapper = document.getElementById('ar-viewport');
    wrapper.innerHTML = `
        <a-scene mindar-image="imageTargetSrc: https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.2/examples/image-tracking/assets/card-example/card.mind; autoStart: true; uiLoading: no; uiScanning: no;" color-space="sRGB" renderer="colorManagement: true, physicallyCorrectLights" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false" gesture-detector embedded>
            <a-assets>
                <a-asset-item id="avatarModel" src="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.2/examples/image-tracking/assets/card-example/softbar/scene.gltf"></a-asset-item>
            </a-assets>

            <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

            <!-- Added gesture-handler to allow pinching to scale and dragging to rotate -->
            <a-entity mindar-image-target="targetIndex: 0" id="ar-target">
                <a-gltf-model rotation="0 0 0 " position="0 0 0.1" scale="0.005 0.005 0.005" src="#avatarModel" gesture-handler="minScale: 0.001; maxScale: 0.05"></a-gltf-model>
            </a-entity>
        </a-scene>
    `;

    // Visual Status Update
    const status = document.getElementById('ar-status');
    
    // Wait slightly for the scene target to exist in the DOM
    setTimeout(() => {
        const target = document.getElementById('ar-target');
        if (target) {
            target.addEventListener("targetFound", event => {
                status.innerText = "Target Found! Scale & Rotate character!";
                status.style.background = "rgba(0, 245, 255, 0.4)";
            });
            target.addEventListener("targetLost", event => {
                status.innerText = "Searching for Sticker...";
                status.style.background = "rgba(0,0,0,0.7)";
            });
        }
    }, 1000);
}

function exitAR() {
    const arContainer = document.getElementById('ar-container');
    arContainer.style.display = 'none';
    location.reload(); // Cleanest way to stop the camera stream and scene
}

const mobileViewport = document.getElementById('mobile-viewport');

const drops = {
    ar: {
        title: "Neon Face Filter",
        type: "AR EXPERIENCE",
        content: `
            <div style="height: 100%; display: flex; flex-direction: column;">
                <div style="flex: 1; background: linear-gradient(45deg, #050505, #1a1a1a); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
                    <div style="position: absolute; width: 150%; height: 150%; background: radial-gradient(circle, rgba(138,43,226,0.2) 0%, transparent 70%); animation: pulse 4s infinite;"></div>
                    <div style="width: 120px; height: 120px; border: 2px dashed var(--accent-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 3rem;">🎭</span>
                    </div>
                    <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 60px; height: 60px; border: 4px solid white; border-radius: 50%;"></div>
                </div>
                <div style="padding: 1.5rem; background: #111;">
                    <h4 style="margin:0">Active: Neon Halo</h4>
                    <p style="font-size: 0.8rem; color: #888;">Point at your face to activate.</p>
                </div>
            </div>
        `
    },
    video: {
        title: "The Studio Session",
        type: "PRIVATE VIDEO",
        content: `
            <div style="height: 100%; display: flex; flex-direction: column; background: #000;">
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #000, #222); position: relative;">
                    <div style="text-align: center;">
                         <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); margin: 0 auto 1rem;">
                            <div style="width: 0; height: 0; border-top: 15px solid transparent; border-bottom: 15px solid transparent; border-left: 20px solid white; margin-left: 8px;"></div>
                        </div>
                        <p style="font-size: 0.7rem; color: #666; letter-spacing: 1px;">BUFFERING ENCRYPTED STREAM...</p>
                    </div>
                </div>
                <div style="padding: 1.5rem; background: #111;">
                    <h4 style="margin:0">Making of 'Cosmic Drift'</h4>
                    <p style="font-size: 0.8rem; color: #888;">Exclusive BTS for Sticker Holders.</p>
                </div>
            </div>
        `
    },
    game: {
        title: "Glitch Runner",
        type: "MINI-GAME",
        content: `
            <div style="height: 100%; display: flex; flex-direction: column; background: #000;">
                <canvas id="game-canvas"></canvas>
                <div style="padding: 1rem; background: #111; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin:0">Score: <span id="score">0</span></h4>
                    </div>
                    <button class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.8rem;" onclick="resetGame()">Restart</button>
                </div>
            </div>
        `
    }
};

let autoCycle;
function startAutoCycle() {
    let current = 0;
    const types = ['ar', 'video', 'game'];
    autoCycle = setInterval(() => {
        current = (current + 1) % types.length;
        loadDrop(types[current]);
    }, 5000);
}

function manualLoad(type) {
    clearInterval(autoCycle); // Stop auto-switching when user clicks
    loadDrop(type);
}

function loadDrop(type) {
    mobileViewport.style.opacity = '0';
    setTimeout(() => {
        mobileViewport.innerHTML = drops[type].content;
        mobileViewport.style.opacity = '1';
        if (type === 'game') initGame();
    }, 300);
}

// Simple Mini-Game Logic
let score = 0;
function initGame() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    
    // Fix Canvas Scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    let x = 50;
    let y = 150;
    let obstacles = [];
    let frame = 0;

    function gameLoop() {
        if (!document.getElementById('game-canvas')) return;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Player
        ctx.fillStyle = '#8a2be2';
        ctx.fillRect(20, y, 30, 30);

        // Obstacles
        if (frame % 80 === 0) { // Slower obstacle spawning
            obstacles.push({ x: canvas.width, y: Math.random() * (canvas.height - 40), w: 25, h: 25 });
        }

        ctx.fillStyle = '#00f5ff';
        obstacles.forEach((obs, i) => {
            obs.x -= 2.5; // Slightly slower speed
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
            
            // Interaction: Check collision
            if (20 < obs.x + obs.w && 20 + 30 > obs.x && y < obs.y + obs.h && y + 30 > obs.y) {
                score = 0; // Reset score on hit
                document.getElementById('score').innerText = "HIT! Score: 0";
            }

            if (obs.x < -30) {
                obstacles.splice(i, 1);
                score += 10;
                document.getElementById('score').innerText = score;
            }
        });

        frame++;
        requestAnimationFrame(gameLoop);
    }
    
    // Improved Jump Logic
    canvas.onclick = () => { y -= 60; if (y < 0) y = 0; };
    setInterval(() => { if (y < canvas.height - 40) y += 3; }, 20); // Gravity

    gameLoop();
}

// Live Clock Logic
function updateClock() {
    const clock = document.getElementById('system-clock');
    if (!clock) return;
    const now = new Date();
    clock.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}
setInterval(updateClock, 1000);

// Initial state
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    loadDrop('ar');
    startAutoCycle();
});
