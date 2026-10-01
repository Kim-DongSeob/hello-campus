import test from 'node:test';
import assert from 'node:assert/strict';
import { wheelRotation, prizeAtPointer, validateMessage } from '../dist/event-core.js';
test('Every announced prize is the segment under the pointer, including repeated spins', () => {
  let angle = 0;
  for (let round = 0; round < 12; round++) for (let prize = 0; prize < 6; prize++) {
    const next = wheelRotation(angle, prize);
    assert.ok(next - angle >= 2160);
    assert.equal(prizeAtPointer(next), prize);
    angle = next;
  }
});
test('Invalid wheel indices are rejected', () => {
  for (const value of [-1, 6, 1.5, NaN]) assert.throws(() => wheelRotation(0, value), RangeError);
});
test('Postcards reject blank content and enforce the visible limits', () => {
  assert.notEqual(validateMessage('   ', '오늘도 응원해!'), '');
  assert.notEqual(validateMessage('새봄', '     '), '');
  assert.notEqual(validateMessage('새봄', '가'.repeat(121)), '');
  assert.equal(validateMessage('새봄', '너의 시작을 응원해!'), '');
});
