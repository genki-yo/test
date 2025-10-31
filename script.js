const starCanvas = document.getElementById('starfield');
const ctx = starCanvas.getContext('2d');
let width, height;
let stars = [];

function resizeCanvas() {
    width = starCanvas.width = window.innerWidth;
    height = starCanvas.height = window.innerHeight;
    createStars();
}

function createStars() {
    const count = Math.floor((width + height) / 6);
    stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * width,
        speed: Math.random() * 1.5 + 0.5
    }));
}

function drawStars() {
    ctx.fillStyle = '#050017';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(0, 234, 255, 0.8)';
    stars.forEach(star => {
        star.z -= star.speed;
        if (star.z <= 0) {
            star.z = width;
            star.x = Math.random() * width;
            star.y = Math.random() * height;
        }

        const k = 128 / star.z;
        const px = star.x * k + width / 2;
        const py = star.y * k + height / 2;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
            const size = (1 - star.z / width) * 3;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    requestAnimationFrame(drawStars);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
requestAnimationFrame(drawStars);

// Hyperdrive animation
const launchButton = document.getElementById('launchButton');
launchButton.addEventListener('click', () => {
    document.body.classList.add('hyperdrive');
    launchButton.textContent = 'HYPERDRIVE ENGAGED!';
    setTimeout(() => document.body.classList.remove('hyperdrive'), 2500);
});

// Mission generator
const missions = [
    '量子カフェに潜入して、次世代ドリンクをレビューせよ。',
    '月面ドローンレースで新記録を叩き出せ。',
    '未解読のホログラムアートをデコードせよ。',
    'AIバンドのライブで即興パフォーマンスに参戦しろ。',
    'メタバース図書館から失われた物語を探し出せ。',
    'ドリームエンジンで理想の未来都市を生成せよ。',
    '宇宙港の裏メニューをハッキングして味わい尽くせ。',
    'クラウド上のあなたの分身とコラボして作品を完成させろ。'
];

const missionButton = document.getElementById('missionButton');
const missionOutput = document.getElementById('missionOutput');
missionButton.addEventListener('click', () => {
    missionButton.classList.add('active');
    const mission = missions[Math.floor(Math.random() * missions.length)];
    missionOutput.textContent = mission;
    missionOutput.classList.add('reveal');
    setTimeout(() => missionButton.classList.remove('active'), 400);
});

// Mood aura
const auraDisplay = document.getElementById('auraDisplay');
const chips = document.querySelectorAll('.chip');
chips.forEach(chip => {
    chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const mood = chip.dataset.mood;
        auraDisplay.dataset.mode = mood;
        auraDisplay.innerHTML = getAuraMessage(mood);
    });
});

function getAuraMessage(mood) {
    switch (mood) {
        case 'zen':
            return '<span>ZEN AURA</span><p>静寂と光が共鳴し、集中力が極限まで研ぎ澄まされる。</p>';
        case 'nova':
            return '<span>NOVA AURA</span><p>爆発的なアイデアが連鎖し、宇宙規模の創造が始まる。</p>';
        case 'chaos':
            return '<span>CHAOS AURA</span><p>予測不能な乱気流。今夜は何かが起きる、確実に。</p>';
        default:
            return '<span>SELECT YOUR AURA</span>';
    }
}

// Terminal interactions
const terminalInput = document.getElementById('terminalInput');
const terminalOutput = document.getElementById('terminalOutput');
const terminalResponses = {
    hack: '🛰️ ネオンネットワークへ侵入完了。新しい秘密があなたを待っている。',
    vibe: '🎧 極上のシティポップが流れ始めた。リズムに身を任せよう。',
    boost: '⚡ エナジーブースト注入。集中力+300%、テンション∞。',
    warp: '🌌 ワープゲート起動。座標を入力せよ。',
    glitch: '🪩 グリッチアート生成中…美しい破壊が広がる。',
    oracle: '🔮 未来のあなたが微笑んでいる。全て順調だ。'
};

function printToTerminal(command, response) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    const prompt = document.createElement('span');
    prompt.className = 'prompt';
    prompt.textContent = '>';
    const text = document.createElement('span');
    text.innerHTML = `<span class="command">${command}</span> ${response}`;
    line.append(prompt, text);
    terminalOutput.append(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const value = terminalInput.value.trim().toLowerCase();
        if (!value) return;
        const response = terminalResponses[value] || '🤖 未知のコマンド。AIが新しいリアリティを学習中…';
        printToTerminal(value, response);
        terminalInput.value = '';
    }
});

// Beat sequencer
const beatGrid = document.getElementById('beatGrid');
const rows = 3;
const cols = 8;
const beatCells = [];

for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'beat-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener('click', () => {
            cell.classList.toggle('active');
        });
        beatGrid.appendChild(cell);
        beatCells.push(cell);
    }
}

let audioContext;
let sequencerInterval;
let currentStep = 0;
const tempo = 120;

function playStep(step) {
    const activeCells = beatCells.filter(cell => Number(cell.dataset.col) === step && cell.classList.contains('active'));
    activeCells.forEach(cell => {
        triggerSound(Number(cell.dataset.row));
        cell.classList.add('playing');
        setTimeout(() => cell.classList.remove('playing'), 200);
    });
}

function triggerSound(row) {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    const frequencies = [220, 330, 440];
    osc.frequency.value = frequencies[row] || 220;
    osc.type = row === 0 ? 'sawtooth' : row === 1 ? 'square' : 'triangle';

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.5);
}

function startSequencer() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    const interval = (60 / tempo) / 2 * 1000;
    if (sequencerInterval) clearInterval(sequencerInterval);
    sequencerInterval = setInterval(() => {
        playStep(currentStep);
        currentStep = (currentStep + 1) % cols;
    }, interval);
}

function stopSequencer() {
    clearInterval(sequencerInterval);
    currentStep = 0;
}

const beatPlay = document.getElementById('beatPlay');
const beatStop = document.getElementById('beatStop');

beatPlay.addEventListener('click', () => {
    startSequencer();
    beatPlay.textContent = 'PLAYING...';
});

beatStop.addEventListener('click', () => {
    stopSequencer();
    beatPlay.textContent = 'PLAY';
});

// Entrance animation for mission output
missionOutput.addEventListener('animationend', () => {
    missionOutput.classList.remove('reveal');
});
