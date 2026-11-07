// ===== 대나무숲 한 문장 — 3D 프로토타입 =====
const QUESTIONS = [
  { unit: '전치사 · during', ko: '쉬는 시간 동안 나는 친구와 만화책을 읽었습니다.',
    answers: ['i read comics with my friend during the break', 'i read comic books with my friend during the break',
              'during the break i read comics with my friend', 'during the break i read comic books with my friend'],
    show: 'I read comics with my friend during the break.',
    chunks: ['during the break', 'I read', 'with my friend', 'comics'],
    pre: ['during', 'the break', '명사 덩어리'],
    why: 'during 뒤에 the break(명사 덩어리)가 왔습니다 → 전치사' },
  { unit: '접속사 · while', ko: '비가 오는 동안 우리는 집에서 보드게임을 하였습니다.',
    answers: ['we played board games at home while it was raining', 'we played board games at home while it rained',
              'while it was raining we played board games at home', 'while it rained we played board games at home'],
    show: 'We played board games at home while it was raining.',
    chunks: ['while', 'it was raining', 'We played', 'board games at home'],
    pre: ['while', 'it was raining', '주어 + 동사'],
    why: 'while 뒤에 it was raining(주어 + 동사)이 왔습니다 → 접속사' },
  { unit: '접속사 · although', ko: '나는 피곤하였지만 숙제를 끝냈습니다.',
    answers: ['although i was tired i finished my homework', 'i finished my homework although i was tired'],
    show: 'Although I was tired, I finished my homework.',
    chunks: ['I finished', 'although', 'I was tired', 'my homework'],
    pre: ['although', 'I was tired', '주어 + 동사'],
    why: 'although 뒤에 I was tired(주어 + 동사)가 왔습니다 → 접속사' },
];
const GOAL = 12;

// ---------- 3D 장면 ----------
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfe3c4);
scene.fog = new THREE.Fog(0xcfe3c4, 16, 40);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100); camera.position.set(0, 4.6, 8);

scene.add(new THREE.HemisphereLight(0xf4fff0, 0x7d9a6a, 0.72));
const sun = new THREE.DirectionalLight(0xfff6e0, 0.8);
sun.position.set(6, 12, 4); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 });
scene.add(sun);

const mat = c => new THREE.MeshLambertMaterial({ color: c });
// 땅
const ground = new THREE.Mesh(new THREE.CircleGeometry(40, 48), mat(0x9db98a));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
// 돌 광장
const plaza = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.3, 0.12, 40), mat(0xa8a596));
plaza.position.y = 0.06; plaza.receiveShadow = true; scene.add(plaza);
for (let i = 0; i < 70; i++) {
  const r = Math.sqrt(Math.random()) * 3.9, a = Math.random() * Math.PI * 2;
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.28 + Math.random() * 0.2, 0.3, 0.05, 7), mat([0xa9a698, 0xc6c3b4, 0x9e9b8e][i % 3]));
  s.position.set(Math.cos(a) * r, 0.13, Math.sin(a) * r); s.rotation.y = Math.random() * 3; s.receiveShadow = true; scene.add(s);
}
const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.09, 8, 60), mat(0xe8dcb8));
ring.rotation.x = -Math.PI / 2; ring.position.y = 0.17; scene.add(ring);
// 흙길
const path = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 14), mat(0xc9b993));
path.rotation.x = -Math.PI / 2; path.position.set(0, 0.02, -10); scene.add(path);
// 나무 울타리
const wood = mat(0x8a6a48);
for (let i = 0; i < 26; i++) {
  const a = Math.PI * 0.62 + (i / 25) * Math.PI * 1.76, r = 5.6;
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.0, 0.14), wood);
  post.position.set(Math.cos(a) * r, 0.5, Math.sin(a) * r); post.castShadow = true; scene.add(post);
  if (i < 25) {
    const a2 = Math.PI * 0.62 + ((i + 1) / 25) * Math.PI * 1.76;
    const x1 = Math.cos(a) * r, z1 = Math.sin(a) * r, x2 = Math.cos(a2) * r, z2 = Math.sin(a2) * r;
    const len = Math.hypot(x2 - x1, z2 - z1);
    for (const h of [0.45, 0.8]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.07, 0.07), wood);
      rail.position.set((x1 + x2) / 2, h, (z1 + z2) / 2); rail.rotation.y = -Math.atan2(z2 - z1, x2 - x1); scene.add(rail);
    }
  }
}
// 대나무
const bamboos = [];
const stalkMat = [mat(0x6fae5c), mat(0x5c9c4c), mat(0x84bd6c)], nodeMat = mat(0x4a8a3c), leafMat = new THREE.MeshLambertMaterial({ color: 0x7cc06a, side: THREE.DoubleSide });
function makeBamboo(x, z, h) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, h, 7), stalkMat[Math.floor(Math.random() * 3)]);
  stalk.position.y = h / 2; stalk.castShadow = true; g.add(stalk);
  for (let y = 1.1; y < h; y += 1.1) { const n = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.06, 7), nodeMat); n.position.y = y; g.add(n); }
  for (let k = 0; k < 6; k++) {
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.18), leafMat);
    leaf.position.set(0, h - 0.4 - Math.random() * 1.6, 0);
    leaf.rotation.set(0.3, Math.random() * Math.PI * 2, -0.5); leaf.geometry.translate(0.45, 0, 0); g.add(leaf);
  }
  g.userData = { phase: Math.random() * 6, h };
  scene.add(g); bamboos.push(g); return g;
}
for (let i = 0; i < 110; i++) {
  const a = Math.random() * Math.PI * 2, r = 6.6 + Math.random() * 16;
  const x = Math.cos(a) * r, z = Math.sin(a) * r;
  if (Math.abs(x) < 1.6 && z < -5) continue; // 길 비우기
  if (z > 3 && Math.abs(x) < 6.5) continue; // 카메라 앞 비우기
  makeBamboo(x, z, 6 + Math.random() * 7);
}
// 내가 키우는 대나무 (광장 옆 화분 자리)
const myGrove = [];
for (let i = 0; i < GOAL; i++) {
  const a = Math.PI * 1.15 + (i / (GOAL - 1)) * Math.PI * 0.7, r = 4.75;
  const g = makeBamboo(Math.cos(a) * r, Math.sin(a) * r, 3.2);
  g.scale.set(1, 0.02, 1); g.userData.target = 0.02; myGrove.push(g);
}

// 판다 캐릭터
const panda = new THREE.Group(); scene.add(panda);
const white = mat(0xfbfbf6), black = mat(0x2b2b2e);
const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 16), white); body.scale.set(1, 1.08, 0.95); body.position.y = 0.75; body.castShadow = true; panda.add(body);
const head = new THREE.Group(); head.position.y = 1.62; panda.add(head);
const skull = new THREE.Mesh(new THREE.SphereGeometry(0.5, 22, 18), white); skull.castShadow = true; head.add(skull);
for (const s of [-1, 1]) {
  const ear = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), black); ear.position.set(0.34 * s, 0.38, -0.05); head.add(ear);
  const patch = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), black); patch.scale.set(1, 1.3, 0.5); patch.position.set(0.18 * s, 0.05, 0.43); patch.rotation.z = 0.5 * s; head.add(patch);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), white); eye.position.set(0.18 * s, 0.08, 0.5); head.add(eye);
  const arm = new THREE.Mesh(new THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.15, 0.35, 4, 8) : new THREE.CylinderGeometry(0.15, 0.15, 0.6), black);
  arm.position.set(0.58 * s, 0.85, 0.08); arm.rotation.z = 0.5 * s; arm.userData.side = s; panda.add(arm); panda.userData['arm' + s] = arm;
  const leg = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), black); leg.position.set(0.28 * s, 0.18, 0.15); panda.add(leg);
}
const nose = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), black); nose.position.set(0, -0.06, 0.5); head.add(nose);
const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), mat(0x7a2e2e)); mouth.scale.set(1, 0.05, 0.4); mouth.position.set(0, -0.2, 0.46); head.add(mouth);

// 소리 물결 링
const waves = [];
function spawnWave(strength) {
  const w = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 6, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }));
  w.rotation.x = -Math.PI / 2; w.position.set(panda.position.x, 1.7, panda.position.z); w.userData = { t: 0, s: strength }; scene.add(w); waves.push(w);
}
// 떨어지는 잎
const leaves = [];
for (let i = 0; i < 60; i++) {
  const l = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.06), leafMat);
  l.position.set((Math.random() - 0.5) * 22, Math.random() * 10, (Math.random() - 0.5) * 22);
  l.userData = { v: 0.4 + Math.random() * 0.5, spin: Math.random() * 3 }; scene.add(l); leaves.push(l);
}

function resize() {
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();


// ---------- 소리 ----------
let AC = null, master = null, windGain = null, muted = false;
function initAudio() {
  if (AC) { AC.resume(); return; }
  AC = new (window.AudioContext || window.webkitAudioContext)();
  master = AC.createGain(); master.gain.value = 0.9; master.connect(AC.destination);
  // 바람·대나무 스치는 소리 (걸러낸 잡음)
  const len = AC.sampleRate * 2, nb = AC.createBuffer(1, len, AC.sampleRate), d = nb.getChannelData(0);
  let last = 0; for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
  const src = AC.createBufferSource(); src.buffer = nb; src.loop = true;
  const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 0.6;
  windGain = AC.createGain(); windGain.gain.value = 0.18;
  src.connect(bp).connect(windGain).connect(master); src.start();
  AC.resume();
  setInterval(() => { if (Math.random() < 0.45) chirp(); }, 2600);
}
function tone(f, d, dur, vol = 0.22, type = 'sine', f2) {
  if (!AC) return; const t0 = AC.currentTime + d, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
}
function chirp() { const b = 2600 + Math.random() * 1200; tone(b, 0, 0.12, 0.05, 'sine', b * 1.4); tone(b * 1.1, 0.16, 0.1, 0.04, 'sine', b * 1.5); }
function playDing() { tone(880, 0, 0.45, 0.28); tone(1320, 0.12, 0.6, 0.28); tone(1760, 0.26, 0.7, 0.18); }
function playWrong() { tone(330, 0, 0.18, 0.18, 'triangle'); tone(247, 0.16, 0.3, 0.18, 'triangle'); }
function playGrow() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.4, 0.2, 'triangle')); }
let stepCd = 0;
function playStep() { tone(180 + Math.random() * 40, 0, 0.08, 0.06, 'triangle', 120); }
// 숲이 문장을 메아리로 읽어 줌
function speakEcho(sentence) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const voices = speechSynthesis.getVoices(), v = voices.find(x => /en[-_]US/i.test(x.lang)) || voices.find(x => /^en/i.test(x.lang));
  const words = sentence.replace(/[.,!?]/g, '').split(' ');
  const parts = [[sentence, 1, 0.9], [words.slice(-2).join(' '), 0.5, 0.85], [words.slice(-1).join(' '), 0.25, 0.8]];
  parts.forEach(([text, vol, rate]) => {
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; if (v) u.voice = v;
    u.volume = muted ? 0 : vol; u.rate = rate; u.pitch = 1.05; speechSynthesis.speak(u);
  });
}
if ('speechSynthesis' in window) speechSynthesis.getVoices();

// ---------- 소리 (마이크) ----------
let analyser = null, buf = null, level = 0, keyShout = false;
async function initMic() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaStreamSource(stream);
    analyser = ctx.createAnalyser(); analyser.fftSize = 1024; buf = new Float32Array(analyser.fftSize);
    src.connect(analyser);
    document.getElementById('micState').textContent = '🎤 마이크 연결됨';
  } catch (e) {
    document.getElementById('micState').textContent = '🎤 마이크 없음 · 스페이스바를 눌러 외쳐보세요!';
  }
}
addEventListener('keydown', e => { if (e.code === 'Space' && document.activeElement.tagName !== 'TEXTAREA') { keyShout = true; e.preventDefault(); } });
addEventListener('keyup', e => { if (e.code === 'Space') keyShout = false; });
function readLevel() {
  let v = 0;
  if (analyser) { analyser.getFloatTimeDomainData(buf); let s = 0; for (const x of buf) s += x * x; v = Math.min(1, Math.sqrt(s / buf.length) * 6); }
  if (keyShout) v = Math.max(v, 0.85 + Math.random() * 0.15);
  level += (v - level) * 0.25; return level;
}

// ---------- 게임 흐름 ----------
const $ = id => document.getElementById(id);
let qi = 0, grown = 0, phase = 'intro', shoutFill = 0, tries = 0, echoT = 0;
const norm = s => s.toLowerCase().replace(/[’']/g, "'").replace(/[.,!?]/g, ' ').replace(/\s+/g, ' ').trim();

function showQuestion() {
  const q = QUESTIONS[qi % QUESTIONS.length];
  tries = 0; phase = 'write';
  $('unit').textContent = `문제 ${qi + 1} · ${q.unit}`;
  $('ko').textContent = q.ko;
  $('pre').innerHTML = `<b>${q.pre[0]}</b> + ${q.pre[1]} <small>(${q.pre[2]})</small>`;
  $('input').value = ''; $('input').disabled = false; $('input').focus();
  $('hint').innerHTML = ''; $('msg').textContent = '';
  $('writeBox').style.display = 'block'; $('shoutBox').style.display = 'none'; $('echo').style.opacity = 0;
}
function toShout(q) {
  phase = 'shout'; shoutFill = 0;
  $('writeBox').style.display = 'none'; $('shoutBox').style.display = 'block';
  $('big').textContent = q.show; $('why').textContent = '✔ ' + q.why;
  $('shoutMsg').textContent = '빛나는 자리로 걸어가서 크게 외쳐 봅시다!'; placeSpot();
}
function check() {
  if (phase !== 'write') return;
  const q = QUESTIONS[qi % QUESTIONS.length];
  if (q.answers.includes(norm($('input').value))) {
    phase = 'celebrate'; $('input').disabled = true; $('msg').textContent = '🎉 정답입니다!';
    celebrate();
    setTimeout(() => { $('input').classList.remove('good'); toShout(q); }, 1100);
  } else {
    tries++; playWrong();
    const p = $('panel'); p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake');
    if (tries === 1) $('msg').textContent = '아깝습니다! 단어 순서와 시제를 한 번 더 살펴볼까요?';
    else { $('msg').textContent = '힌트 조각을 보고 다시 써 봅시다.'; $('hint').innerHTML = q.chunks.map(c => `<span>${c}</span>`).join(''); }
  }
}
$('input').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
$('start').addEventListener('click', async () => { initAudio(); $('intro').style.display = 'none'; $('panel').style.display = 'block'; await initMic(); showQuestion(); });
$('next').addEventListener('click', () => { qi++; showQuestion(); });

function finishShout() {
  phase = 'done'; spot.visible = false; grown = Math.min(GOAL, grown + 1);
  myGrove[grown - 1].userData.target = 1; playGrow(); setTimeout(() => speakEcho(QUESTIONS[qi % QUESTIONS.length].show), 500);
  $('count').textContent = `🎋 ${grown} / ${GOAL}`;
  const q = QUESTIONS[qi % QUESTIONS.length];
  const tail = q.show.replace(/[.,]/g, '').split(' ').slice(-2).join(' ');
  $('echo').innerHTML = `${q.show}<br><small>…${tail}… ${tail.split(' ').pop()}…</small>`; $('echo').style.opacity = 1; echoT = 0;
  $('shoutMsg').textContent = grown >= GOAL ? '대나무 12그루 완성! 속이 시원해졌나요? 🎉' : '속이 좀 시원해졌나요? 대나무가 한 그루 자랐습니다!';
  $('next').style.display = 'inline-block';
}


// ---------- 걸어 다니기 ----------
const RADIUS = 3.7;
const keys = {};
let target = null; // 클릭/터치로 정한 목적지
addEventListener('keydown', e => { if (e.target.tagName === 'TEXTAREA') return; keys[e.code] = true; if (e.code.startsWith('Arrow')) e.preventDefault(); });
addEventListener('keyup', e => { keys[e.code] = false; });
const ray = new THREE.Raycaster(), groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
canvas.addEventListener('pointerdown', e => {
  const m = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(m, camera); const p = new THREE.Vector3();
  if (ray.ray.intersectPlane(groundPlane, p)) { clampToPlaza(p); target = p; }
});
function clampToPlaza(v) { const d = Math.hypot(v.x, v.z); if (d > RADIUS) { v.x *= RADIUS / d; v.z *= RADIUS / d; } }
let walkT = 0;
function updateWalk(dt, frozen) {
  let dx = 0, dz = 0;
  if (!frozen) {
    if (keys.ArrowUp || keys.KeyW) dz -= 1; if (keys.ArrowDown || keys.KeyS) dz += 1;
    if (keys.ArrowLeft || keys.KeyA) dx -= 1; if (keys.ArrowRight || keys.KeyD) dx += 1;
    if (dx || dz) target = null;
    else if (target) { dx = target.x - panda.position.x; dz = target.z - panda.position.z; if (Math.hypot(dx, dz) < 0.08) { target = null; dx = dz = 0; } }
  }
  const len = Math.hypot(dx, dz);
  if (len > 0) {
    const sp = 2.4 * dt; panda.position.x += dx / len * sp; panda.position.z += dz / len * sp;
    clampToPlaza(panda.position);
    const want = Math.atan2(dx, dz); let diff = want - panda.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff)); panda.rotation.y += diff * Math.min(1, dt * 10);
    walkT += dt * 10;
  } else walkT *= 0.9;
  return len > 0;
}

// ---------- 외침 자리 ----------
const spot = new THREE.Group(); spot.visible = false; scene.add(spot);
const spotDisc = new THREE.Mesh(new THREE.CircleGeometry(0.75, 40), new THREE.MeshBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.55 }));
spotDisc.rotation.x = -Math.PI / 2; spotDisc.position.y = 0.19; spot.add(spotDisc);
const spotRing = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 6, 40), new THREE.MeshBasicMaterial({ color: 0xffc94d }));
spotRing.rotation.x = -Math.PI / 2; spotRing.position.y = 0.2; spot.add(spotRing);
const spotBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.75, 3, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff3c4, transparent: true, opacity: 0.18, side: THREE.DoubleSide }));
spotBeam.position.y = 1.6; spot.add(spotBeam);
function placeSpot() {
  let x, z;
  do { const a = Math.PI + Math.random() * Math.PI, r = 1.6 + Math.random() * 1.9; x = Math.cos(a) * r; z = Math.sin(a) * r * 0.9 + 0.4; }
  while (Math.hypot(x - panda.position.x, z - panda.position.z) < 1.8);
  spot.position.set(x, 0, z); spot.visible = true;
}
const onSpot = () => spot.visible && Math.hypot(panda.position.x - spot.position.x, panda.position.z - spot.position.z) < 0.8;


// ---------- 정답 연출 ----------
let joyT = -1; const bursts = [];
function celebrate() {
  const b = $('correct'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  $('input').classList.add('good');
  joyT = 0; playDing();
  const cols = [0x7cc06a, 0xffd25e, 0xff9eb5, 0xffffff];
  for (let i = 0; i < 40; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.06), new THREE.MeshBasicMaterial({ color: cols[i % 4], side: THREE.DoubleSide, transparent: true }));
    m.position.set(panda.position.x, 2.2, panda.position.z);
    const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 2.5;
    m.userData = { v: new THREE.Vector3(Math.cos(a) * sp * 0.6, 3 + Math.random() * 3, Math.sin(a) * sp * 0.6), life: 0 };
    scene.add(m); bursts.push(m);
  }
}
function updateCelebrate(dt) {
  for (let i = bursts.length - 1; i >= 0; i--) {
    const m = bursts[i], u = m.userData; u.life += dt; u.v.y -= 7 * dt;
    m.position.addScaledVector(u.v, dt); m.rotation.x += dt * 8; m.rotation.y += dt * 5;
    m.material.opacity = Math.max(0, 1 - u.life / 1.6);
    if (u.life > 1.6) { scene.remove(m); bursts.splice(i, 1); }
  }
  if (joyT >= 0) {
    joyT += dt; const k = Math.min(1, joyT / 0.9);
    panda.position.y += Math.sin(k * Math.PI) * 0.9;          // 깡충
    panda.rotation.y += dt * (k < 1 ? 14 : 0);                 // 한 바퀴
    for (const s of [-1, 1]) panda.userData['arm' + s].rotation.z = s * (0.5 + Math.sin(k * Math.PI) * 2.2);
    if (joyT > 0.9) joyT = -1;
  }
}

$('mute').addEventListener('click', () => { muted = !muted; if (master) master.gain.value = muted ? 0 : 0.9; if (muted && 'speechSynthesis' in window) speechSynthesis.cancel(); $('mute').textContent = muted ? '🔇' : '🔊'; });
// ---------- 루프 ----------
const clock = new THREE.Clock();
let camA = 0;
function loop() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  const lv = phase === 'shout' || phase === 'done' ? readLevel() : 0;
  if (phase === 'shout') {
    $('meterFill').style.height = (lv * 100).toFixed(0) + '%';
    const here = onSpot();
    if (here && lv > 0.45) { shoutFill += dt / 1.2; if (Math.random() < 0.25) spawnWave(lv); }
    else shoutFill = Math.max(0, shoutFill - dt * 0.3);
    if (!here) $('shoutMsg').textContent = '빛나는 자리로 걸어가서 크게 외쳐 봅시다! (방향키 · 화면 누르기)';
    else if (shoutFill < 0.05) $('shoutMsg').textContent = '좋습니다! 이제 문장을 크게 외쳐 봅시다!';
    $('fillBar').style.width = (Math.min(1, shoutFill) * 100).toFixed(0) + '%';
    if (shoutFill >= 1) finishShout();
  } else if (phase !== 'done') $('meterFill').style.height = '0%';
  if (phase === 'shout') $('next').style.display = 'none';

  // 판다
  const shout = phase === 'shout' && onSpot() ? lv : 0;
  const walking = updateWalk(dt, phase === 'intro' || phase === 'celebrate' || shout > 0.45);
  panda.position.y = (walking ? Math.abs(Math.sin(walkT)) * 0.12 : Math.abs(Math.sin(t * 2)) * 0.04) + shout * 0.25 * Math.abs(Math.sin(t * 14));
  panda.rotation.z = walking ? Math.sin(walkT) * 0.08 : 0;
  body.scale.y = 1.08 + shout * 0.12;
  head.rotation.x = -shout * 0.35;
  mouth.scale.y = 0.05 + shout * 0.9;
  for (const s of [-1, 1]) panda.userData['arm' + s].rotation.z = s * (0.5 + shout * 1.9);

  updateCelebrate(dt);
  if (windGain) windGain.gain.value += ((muted ? 0 : 0.18 + shout * 0.6) - windGain.gain.value) * 0.1;
  if (walking) { stepCd -= dt; if (stepCd <= 0) { playStep(); stepCd = 0.32; } }
  // 대나무 흔들림
  const sway = 0.03 + shout * 0.22;
  for (const b of bamboos) {
    b.rotation.z = Math.sin(t * 1.3 + b.userData.phase) * sway;
    b.rotation.x = Math.cos(t * 1.1 + b.userData.phase) * sway * 0.6;
    if (b.userData.target !== undefined) b.scale.y += (b.userData.target - b.scale.y) * 0.04;
  }
  for (const w of waves) {
    w.userData.t += dt; const k = w.userData.t;
    w.scale.setScalar(1 + k * 9 * (0.6 + w.userData.s)); w.material.opacity = Math.max(0, 0.85 - k * 0.9);
  }
  for (let i = waves.length - 1; i >= 0; i--) if (waves[i].material.opacity <= 0) { scene.remove(waves[i]); waves.splice(i, 1); }
  for (const l of leaves) {
    l.position.y -= dt * l.userData.v * (1 + shout * 4); l.rotation.x += dt * l.userData.spin; l.rotation.z += dt;
    l.position.x += Math.sin(t + l.userData.spin) * dt * 0.3;
    if (l.position.y < 0) l.position.y = 9 + Math.random() * 3;
  }
  if (phase === 'done') { echoT += dt; $('echo').style.opacity = Math.max(0, 1 - Math.max(0, echoT - 3) / 2); }

  camA += dt * 0.05;
  spotRing.scale.setScalar(1 + Math.sin(t * 4) * 0.06); spotBeam.material.opacity = 0.14 + Math.sin(t * 3) * 0.05;
  const px = panda.position.x * 0.6, pz = panda.position.z * 0.6;
  camera.position.x += (px + Math.sin(camA) * 1.2 - camera.position.x) * 0.06;
  camera.position.y += (5.6 + shout * 0.3 - camera.position.y) * 0.06;
  camera.position.z += (pz + 8 - shout * 0.6 - camera.position.z) * 0.06;
  camera.lookAt(px, 0.4, pz + 0.6);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
loop();
