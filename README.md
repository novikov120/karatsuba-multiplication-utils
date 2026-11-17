# karatsuba-multiplication-utils

Multiplies two non-negative integers represented as arrays of decimal digits (most-significant first) using the divide-and-conquer Karatsuba algorithm.

## Usage

```js
import { multiply, normalize } from './src/index.js';

// 123 * 456 = 56088
const product = multiply([1, 2, 3], [4, 5, 6]);
console.log(product); // [5, 6, 0, 8, 8]

// Leading zeros are stripped by normalize.
const clean = normalize([0, 0, 1, 2, 3]);
console.log(clean); // [1, 2, 3]
```

## Why this exists

Karatsuba reduces the four sub-multiplications of the schoolbook method to three, giving O(n^1.585) digit operations instead of O(n^2). The trade-off is recursion overhead and extra additions/subtractions; for small inputs a schoolbook loop is faster. This library switches to schoolbook when either operand has 32 or fewer digits.

## Edge cases

- Zero is represented as an empty array (`[]`), not `[0]`. `normalize` maps any all-zero input to `[]`.
- Inputs may contain leading zeros; `multiply` normalizes them before computing.
- `normalize` throws `TypeError` if the argument is not an array, and `RangeError` if any element is not an integer in `[0, 9]`.
- The result never has leading zeros: multiplying by zero returns `[]`.
