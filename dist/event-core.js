export const prizes = [
  { symbol: '☕', title: '여유 한 잔, 커피 타임!', description: '새로운 하루를 깨우는 커피처럼, 너의 시작도 향기로울 거야.' },
  { symbol: '♡', title: '따뜻한 응원이 도착했어!', description: '처음이라 서툴러도 괜찮아. 너만의 속도로 한 걸음씩 나아가자.' },
  { symbol: '🍩', title: '달콤한 행운, 도넛 한 입!', description: '오늘은 좋은 일이 생길 것 같은 날. 달콤한 기분으로 시작해 봐.' },
  { symbol: 'ribbon', title: '반짝이는 행운을 찾았어!', description: '아직 만나지 못한 멋진 순간들이 너를 기다리고 있어.' },
  { symbol: '🍦', title: '달콤한 하루 당첨!', description: '아이스크림처럼 기분 좋은 시작을 응원해. 오늘도 너답게 빛나길!' },
  { symbol: '🎁', title: '설레는 깜짝 선물!', description: '새로운 친구, 새로운 배움. 가장 멋진 선물은 앞으로의 너일 거야.' },
];
export function wheelRotation(current, index, turns = 6) {
  if (!Number.isFinite(current) || !Number.isInteger(index) || index < 0 || index >= 6) throw new RangeError('Invalid wheel state');
  const target = (360 - (index * 60 + 30)) % 360;
  const normalized = ((current % 360) + 360) % 360;
  return current + turns * 360 + (target - normalized + 360) % 360;
}
export function prizeAtPointer(rotation) {
  return Math.floor((((-rotation % 360) + 360) % 360) / 60);
}
export function validateMessage(nickname, message) {
  if (!nickname.trim() || nickname.trim().length > 12) return '별명을 1~12자로 입력해 주세요.';
  if (message.trim().length < 5 || message.trim().length > 120) return '응원 문구를 5~120자로 입력해 주세요.';
  return '';
}
