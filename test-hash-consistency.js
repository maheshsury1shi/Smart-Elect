// Test to verify frontend and backend hash consistency
import crypto from 'crypto';

// Backend hash function (Node.js)
const backendHashAadhaar = (aadhaar) => {
  return crypto.createHash('sha256').update(aadhaar).digest('hex');
};

// Test cases
const testAadhaar = [
  '123456789012',
  '111111111111',
  '999999999999',
  '000000000000',
  '123456789999',
];

console.log('Backend Hash Function Test:');
console.log('===========================\n');

testAadhaar.forEach((aadhaar) => {
  const hash = backendHashAadhaar(aadhaar);
  console.log(`Aadhaar: ${aadhaar}`);
  console.log(`Hash:    ${hash}`);
  console.log(`Length:  ${hash.length}`);
  console.log('---');
});

console.log('\n✅ Copy these hashes and test with Frontend Web Crypto API');
console.log('Frontend code to test: hashAadhaar("123456789012").then(h => console.log(h))');
