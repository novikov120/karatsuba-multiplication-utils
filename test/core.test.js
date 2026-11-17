import { test } from 'node:test';
import assert from 'node:assert/strict';
import { multiply, normalize } from '../src/index.js';

function digitsFromString(s) {
  return s.split('').map(Number);
}

function stringFromDigits(d) {
  return d.join('');
}

test('normalize strips leading zeros', () => {
  assert.deepEqual(normalize([0, 0, 1, 2, 3]), [1, 2, 3]);
  assert.deepEqual(normalize([0]), []);
  assert.deepEqual(normalize([1, 0, 0]), [1, 0, 0]);
});

test('normalize rejects non-digit values', () => {
  assert.throws(() => normalize([1, 10]), RangeError);
  assert.throws(() => normalize([1, -1]), RangeError);
  assert.throws(() => normalize(['1']), RangeError);
  assert.throws(() => normalize('123'), TypeError);
});

test('multiply zero by anything is zero', () => {
  assert.deepEqual(multiply([], [1, 2, 3]), []);
  assert.deepEqual(multiply([0], [1, 2, 3]), []);
  assert.deepEqual(multiply([0, 0, 0], [9, 9, 9]), []);
});

test('multiply small numbers', () => {
  assert.deepEqual(multiply([1, 2], [3, 4]), [4, 0, 8]);
  assert.deepEqual(multiply([9, 9], [9, 9]), [9, 8, 0, 1]);
  assert.deepEqual(multiply([1, 0, 0], [1, 0, 0]), [1, 0, 0, 0, 0]);
});

test('multiply asymmetric lengths', () => {
  assert.deepEqual(multiply([1, 2, 3], [4]), [4, 9, 2]);
  assert.deepEqual(multiply([4], [1, 2, 3]), [4, 9, 2]);
  assert.deepEqual(multiply([1, 2, 3, 4, 5], [6, 7]), [8, 2, 7, 1, 1, 5]);
});

test('multiply produces exact results for large operands', () => {
  const a = digitsFromString('123456789012345678901234567890');
  const b = digitsFromString('987654321098765432109876543210');
  // Expected computed independently with BigInt.
  const expected = (123456789012345678901234567890n * 987654321098765432109876543210n).toString();
  assert.equal(stringFromDigits(multiply(a, b)), expected);
});

test('multiply handles result longer than either operand', () => {
  const a = digitsFromString('99999999999999999999999999999999999999');
  const b = digitsFromString('99999999999999999999999999999999999999');
  const expected = (99999999999999999999999999999999999999n ** 2n).toString();
  assert.equal(stringFromDigits(multiply(a, b)), expected);
});

test('multiply is commutative for a range of sizes', () => {
  const cases = [
    ['12', '34'],
    ['123456789', '987654321'],
    ['1000000000000000000000000000000', '123456789'],
    ['99999999999999999999999999999999', '11111111111111111111111111111111'],
  ];
  for (const [as, bs] of cases) {
    const a = digitsFromString(as);
    const b = digitsFromString(bs);
    assert.equal(
      stringFromDigits(multiply(a, b)),
      stringFromDigits(multiply(b, a)),
      `commutativity failed for ${as} * ${bs}`
    );
  }
});

test('multiply with leading zeros in input', () => {
  assert.deepEqual(multiply([0, 0, 1, 2], [0, 3]), [3, 6]);
  assert.deepEqual(multiply([0, 0, 0], [0, 0, 0]), []);
});

test('multiply by one preserves value', () => {
  const a = digitsFromString('123456789012345678901234567890');
  assert.equal(stringFromDigits(multiply(a, [1])), a.join(''));
  assert.equal(stringFromDigits(multiply([1], a)), a.join(''));
});

test('multiply by ten shifts left', () => {
  const a = digitsFromString('123456789012345678901234567890');
  const expected = (123456789012345678901234567890n * 10n).toString();
  assert.equal(stringFromDigits(multiply(a, [1, 0])), expected);
});

test('multiply uses Karatsuba path for large inputs', () => {
  // 64-digit numbers exceed the threshold of 32.
  const a = digitsFromString('1'.repeat(64));
  const b = digitsFromString('2'.repeat(64));
  const expected = (BigInt('1'.repeat(64)) * BigInt('2'.repeat(64))).toString();
  assert.equal(stringFromDigits(multiply(a, b)), expected);
});

test('multiply handles mixed large and small via recursion', () => {
  const a = digitsFromString('9'.repeat(50));
  const b = digitsFromString('8'.repeat(40));
  const expected = (BigInt('9'.repeat(50)) * BigInt('8'.repeat(40))).toString();
  assert.equal(stringFromDigits(multiply(a, b)), expected);
});
