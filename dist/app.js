import { prizes, wheelRotation, validateMessage } from './event-core.js';
const $ = (selector) => document.querySelector(selector);
const tabs = [...document.querySelectorAll('[role="tab"]')];
let activeEvent = 'quiz';
let toastTimer;
function toast(text) {
  clearTimeout(toastTimer);
  $('#toast').textContent = text;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3500);
}
function activateEvent(id, focus = false) {
  const target = tabs.find(tab => tab.dataset.event === id);
  if (!target) return;
  activeEvent = id;
  for (const tab of tabs) {
    const selected = tab === target;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
  }
  if (focus) target.focus();
  if (id === 'scratch' && !scratchInitialized) initScratch();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateEvent(tab.dataset.event));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    activateEvent(tabs[next].dataset.event, true);
  });
});
const resultDialog = $('#result-dialog');
function celebrate() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $('#confetti').replaceChildren();
  const colors = ['#b8eee0', '#bea1df', '#f3d875', '#b5d696', '#dfadc8'];
  for (let i = 0; i < 38; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.setProperty('--x', `${Math.random() * 100}%`);
    piece.style.setProperty('--color', colors[i % colors.length]);
    piece.style.setProperty('--duration', `${2 + Math.random() * 2}s`);
    piece.style.setProperty('--delay', `${Math.random() * .5}s`);
    piece.style.setProperty('--rotation', `${Math.random() * 360}deg`);
    piece.style.setProperty('--drift', `${Math.random() * 180 - 90}px`);
    piece.addEventListener('animationend', () => piece.remove(), { once: true });
    $('#confetti').append(piece);
  }
}
function showResult({ title, description, symbol = '✦', postcard = '' }) {
  $('#result-title').textContent = title;
  $('#result-description').textContent = description;
  $('#result-symbol').textContent = symbol;
  $('#postcard-content').hidden = !postcard;
  $('#postcard-content').textContent = postcard;
  $('#result-note').textContent = postcard ? '응원 문구는 저장되지 않아요. 마음에 든다면 화면을 간직해 주세요.' : '체험용 결과이며 실제 경품은 지급되지 않습니다.';
  resultDialog.showModal();
  celebrate();
}
$('#close-dialog').addEventListener('click', () => resultDialog.close());
$('#confirm-dialog').addEventListener('click', () => {
  resultDialog.close();
  const index = tabs.findIndex(tab => tab.dataset.event === activeEvent);
  activateEvent(tabs[(index + 1) % tabs.length].dataset.event, true);
});
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
  });
}
$('#quiz-form').addEventListener('submit', event => {
  event.preventDefault();
  const answer = new FormData(event.currentTarget).get('answer');
  if (answer !== 'spring') {
    $('#quiz-feedback').textContent = '조금만 더 생각해 봐! 힌트는 새로운 계절, 봄이야.';
    $('#quiz-feedback').classList.add('error');
    return;
  }
  $('#quiz-feedback').classList.remove('error');
  $('#quiz-feedback').textContent = '정답이야! 새봄에서의 새로운 시작을 환영해.';
  showResult({ title: '정답! 만나서 반가워.', description: '새로운 가능성이 피어나는 새봄대학교. 너와 함께 만들어갈 내일을 기대할게!', symbol: '✦' });
});
let rotation = 0;
let spinning = false;
$('#spin-button').addEventListener('click', async () => {
  if (spinning) return;
  spinning = true;
  $('#spin-button').disabled = true;
  $('#spin-button').textContent = '행운이 너에게 가는 중…';
  $('#wheel-feedback').textContent = '두근두근, 어떤 행운을 만나게 될까?';
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  const index = Math.floor(random[0] / 4294967296 * prizes.length);
  rotation = wheelRotation(rotation, index);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finish = new Promise(resolve => {
    const timer = setTimeout(done, reduced ? 80 : 4500);
    function done() { clearTimeout(timer); $('#wheel').removeEventListener('transitionend', onEnd); resolve(); }
    function onEnd(event) { if (event.propertyName === 'transform') done(); }
    if (!reduced) $('#wheel').addEventListener('transitionend', onEnd);
  });
  $('#wheel').style.transform = `rotate(${rotation}deg)`;
  await finish;
  spinning = false;
  $('#spin-button').disabled = false;
  $('#spin-button').textContent = '한 번 더 행운 돌려보기 ↗';
  $('#wheel-feedback').textContent = `${prizes[index].title} · 체험 결과`;
  if (activeEvent === 'wheel' && !document.querySelector('dialog[open]')) showResult(prizes[index]);
  else toast(`룰렛 결과: ${prizes[index].title}`);
});
let scratchInitialized = false;
let scratchRevealed = false;
let scratching = false;
let lastPoint;
const canvas = $('#scratch-canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
function initScratch() {
  if (!ctx) { revealScratch(); return; }
  scratchInitialized = true;
  scratchRevealed = false;
  scratching = false;
  lastPoint = null;
  canvas.hidden = false;
  canvas.style.opacity = '1';
  $('#scratch-result').setAttribute('aria-hidden', 'true');
  ctx.globalCompositeOperation = 'source-over';
  const gradient = ctx.createLinearGradient(0, 0, 700, 420);
  gradient.addColorStop(0, '#baa1d8'); gradient.addColorStop(.5, '#ddd0ee'); gradient.addColorStop(1, '#ab91cc');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 700, 420);
  ctx.fillStyle = '#ffffff30';
  for (let x = 20; x < 700; x += 40) for (let y = 20; y < 420; y += 40) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#54416e';
  ctx.font = '700 70px Pretendard, sans-serif'; ctx.fillText('✦', 350, 148);
  ctx.font = '800 34px Pretendard, sans-serif'; ctx.fillText('SCRATCH YOUR LUCK', 350, 224);
  ctx.font = '400 22px Pretendard, sans-serif'; ctx.fillText('여기를 긁어 행운을 확인해 봐!', 350, 273);
  $('#reveal-button').textContent = '버튼으로 행운 확인하기 ✦';
  $('#scratch-feedback').textContent = '카드를 긁어 숨겨진 행운을 찾아보세요.';
}
function revealScratch() {
  if (scratchRevealed) return;
  scratchRevealed = true;
  scratching = false;
  canvas.style.opacity = '0';
  canvas.hidden = true;
  $('#scratch-result').setAttribute('aria-hidden', 'false');
  $('#scratch-feedback').textContent = '달콤한 하루 당첨! · 실제 경품이 아닌 체험 결과입니다.';
  $('#reveal-button').textContent = '새 카드로 다시 체험하기 ↻';
  celebrate();
}
function getPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
}
function eraseAt(point) {
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineWidth = 65; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(lastPoint?.x ?? point.x, lastPoint?.y ?? point.y); ctx.lineTo(point.x, point.y); ctx.stroke();
  ctx.beginPath(); ctx.arc(point.x, point.y, 32.5, 0, Math.PI * 2); ctx.fill();
  lastPoint = point;
}
canvas.addEventListener('pointerdown', event => {
  if (scratchRevealed || !ctx) return;
  scratching = true;
  canvas.setPointerCapture(event.pointerId);
  lastPoint = null;
  eraseAt(getPoint(event));
});
canvas.addEventListener('pointermove', event => { if (scratching && !scratchRevealed) eraseAt(getPoint(event)); });
function finishScratch() {
  if (!scratching || scratchRevealed) return;
  scratching = false; lastPoint = null;
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let cleared = 0; let samples = 0;
  for (let i = 3; i < pixels.length; i += 64) { if (pixels[i] < 100) cleared++; samples++; }
  if (cleared / samples > .38) revealScratch();
}
canvas.addEventListener('pointerup', finishScratch);
canvas.addEventListener('pointercancel', finishScratch);
canvas.addEventListener('lostpointercapture', finishScratch);
$('#reveal-button').addEventListener('click', () => scratchRevealed ? initScratch() : revealScratch());
const messages = [
  '처음이라 서툴러도 괜찮아. 너만의 속도로, 너다운 캠퍼스 라이프를 만들어가자!',
  '용기 내어 내딛는 오늘의 한 걸음이, 언젠가 가장 빛나는 추억이 될 거야.',
  '좋아하는 것을 더 많이 발견하고, 마음껏 도전해 봐. 너의 모든 시작을 응원해!',
];
let suggestionIndex = 0;
$('#welcome-message').addEventListener('input', () => { $('#char-count').textContent = `${$('#welcome-message').value.length} / 120`; $('#welcome-message').setCustomValidity(''); });
$('#nickname').addEventListener('input', () => $('#nickname').setCustomValidity(''));
$('#suggest-message').addEventListener('click', () => {
  $('#welcome-message').value = messages[suggestionIndex++ % messages.length];
  $('#welcome-message').dispatchEvent(new Event('input'));
});
$('#message-form').addEventListener('submit', event => {
  event.preventDefault();
  const nickname = $('#nickname').value.trim();
  const message = $('#welcome-message').value.trim();
  const error = validateMessage(nickname, message);
  if (error) { const field = !nickname ? $('#nickname') : $('#welcome-message'); field.setCustomValidity(error); field.reportValidity(); return; }
  showResult({ title: `${nickname}에게 도착한 응원`, description: '지금의 설렘을 오래 간직하기를.', symbol: '♡', postcard: message });
});
const shareDialog = $('#share-dialog');
$('#share-button').addEventListener('click', () => {
  $('#share-url').value = `${location.origin}${location.pathname}`;
  $('#share-status').textContent = '';
  shareDialog.showModal();
});
$('#close-share').addEventListener('click', () => shareDialog.close());
$('#copy-link').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#share-url').value); $('#share-status').textContent = '링크가 복사됐어요. 친구에게 설렘을 전해보세요!'; }
  catch { $('#share-url').focus(); $('#share-url').select(); $('#share-status').textContent = '주소를 선택했어요. 직접 복사해 공유해 주세요.'; }
});
