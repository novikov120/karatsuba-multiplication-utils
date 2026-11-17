// Core Karatsuba multiplication for non-negative integer digit arrays.
// Digits are stored most-significant-first, each in [0, 9].
// The algorithm is recursive: split each operand into high/low halves,
// compute three products instead of four, and combine with shifts.

export function normalize(digits) {
  if (!Array.isArray(digits)) throw new TypeError('digits must be an array');
  for (const d of digits) {
    if (!Number.isInteger(d) || d < 0 || d > 9) {
      throw new RangeError('each digit must be an integer in [0, 9]');
    }
  }
  let i = 0;
  while (i < digits.length && digits[i] === 0) i++;
  return digits.slice(i);
}

function add(a, b) {
  const res = [];
  let i = a.length - 1;
  let j = b.length - 1;
  let carry = 0;
  while (i >= 0 || j >= 0 || carry) {
    const da = i >= 0 ? a[i--] : 0;
    const db = j >= 0 ? b[j--] : 0;
    const sum = da + db + carry;
    res.push(sum % 10);
    carry = Math.floor(sum / 10);
  }
  res.reverse();
  return res;
}

function sub(a, b) {
  // a >= b, both normalized (no leading zeros).
  const res = [];
  let i = a.length - 1;
  let j = b.length - 1;
  let borrow = 0;
  while (i >= 0) {
    let da = a[i--] - borrow;
    const db = j >= 0 ? b[j--] : 0;
    if (da < db) {
      da += 10;
      borrow = 1;
    } else {
      borrow = 0;
    }
    res.push(da - db);
  }
  res.reverse();
  return normalize(res);
}

function shiftLeft(digits, n) {
  if (digits.length === 0) return [];
  return digits.concat(new Array(n).fill(0));
}

function absCompare(a, b) {
  if (a.length !== b.length) return a.length - b.length;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

// Schoolbook fallback for small operands: avoids recursion overhead and keeps
// the base case obviously correct.
function schoolbook(a, b) {
  if (a.length === 0 || b.length === 0) return [];
  const res = new Array(a.length + b.length).fill(0);
  for (let i = a.length - 1; i >= 0; i--) {
    let carry = 0;
    for (let j = b.length - 1; j >= 0; j--) {
      const idx = i + j + 1;
      const sum = res[idx] + a[i] * b[j] + carry;
      res[idx] = sum % 10;
      carry = Math.floor(sum / 10);
    }
    res[i] += carry;
  }
  return normalize(res);
}

const KARATSUBA_THRESHOLD = 32;

export function multiply(a, b) {
  const x = normalize(a);
  const y = normalize(b);
  if (x.length === 0 || y.length === 0) return [];
  if (x.length <= KARATSUBA_THRESHOLD || y.length <= KARATSUBA_THRESHOLD) {
    return schoolbook(x, y);
  }
  const n = Math.max(x.length, y.length);
  const half = Math.ceil(n / 2);

  const xHigh = x.slice(0, Math.max(0, x.length - half));
  const xLow = x.slice(Math.max(0, x.length - half));
  const yHigh = y.slice(0, Math.max(0, y.length - half));
  const yLow = y.slice(Math.max(0, y.length - half));

  const z0 = multiply(xLow, yLow);
  const z2 = multiply(xHigh, yHigh);
  const z1 = sub(sub(multiply(add(xHigh, xLow), add(yHigh, yLow)), z2), z0);

  // result = z2 * 10^(2*half) + z1 * 10^half + z0
  const term2 = shiftLeft(z2, 2 * half);
  const term1 = shiftLeft(z1, half);
  return normalize(add(add(term2, term1), z0));
}
