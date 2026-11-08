/* Check actual shipped PNG alpha pixels without external libraries. */
'use strict';
const fs = require('node:fs');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const path = require('node:path');
function readPng(file) {
  const data = fs.readFileSync(file);
  assert.ok(data.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a','hex')), 'PNG signature missing');
  let offset = 8, width = 0, height = 0, bitDepth = 0, color = 0, trns = null;
  const chunks = [];
  while (offset + 12 <= data.length) {
    const length = data.readUInt32BE(offset);
    const type = data.toString('ascii', offset + 4, offset + 8);
    assert.ok(length < 1024 * 1024 && offset + length + 12 <= data.length, 'Truncated or oversized PNG chunk');
    const value = data.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') { width = value.readUInt32BE(0); height = value.readUInt32BE(4); bitDepth = value[8]; color = value[9]; }
    if (type === 'tRNS') trns = value;
    if (type === 'IDAT') chunks.push(value);
    offset += length + 12;
    if (type === 'IEND') break;
  }
  assert.equal(bitDepth, 8, 'Expected 8-bit PNG');
  assert.ok(color === 3 || color === 6, 'Expected indexed RGBA or RGBA PNG');
  const bytesPerPixel = color === 6 ? 4 : 1;
  const stride = width * bytesPerPixel;
  const infl = zlib.inflateSync(Buffer.concat(chunks), { maxOutputLength: (stride + 1) * height + 1 });
  let at = 0, previous = Buffer.alloc(stride), pixels = Buffer.alloc(stride * height);
  function paeth(a,b,c) { const p=a+b-c, da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c); return da<=db&&da<=dc?a:db<=dc?b:c; }
  for (let y = 0; y < height; y++) {
    const filter = infl[at++], row = Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const raw = infl[at++];
      const a = x>=bytesPerPixel?row[x-bytesPerPixel]:0;
      const b = previous[x], c = x>=bytesPerPixel?previous[x-bytesPerPixel]:0;
      const predictor = filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):filter===4?paeth(a,b,c):-1;
      assert.notEqual(predictor,-1,'Invalid PNG scanline filter');
      row[x] = (raw + predictor) & 255;
    }
    row.copy(pixels,y*stride); previous=row;
  }
  function alpha(x,y) {
    const index = (y*width+x)*bytesPerPixel;
    return color===6 ? pixels[index+3] : (trns && pixels[index]<trns.length ? trns[pixels[index]] : 255);
  }
  return {width,height,alpha,sha256:crypto.createHash('sha256').update(data).digest('hex')};
}
for (const size of [128,256]) {
  const file = path.join(__dirname,'..','media','brand','vestigivo-icon-'+size+'.png');
  const png=readPng(file);
  assert.equal(png.width,size);assert.equal(png.height,size);
  for (const [x,y] of [[0,0],[size-1,0],[0,size-1],[size-1,size-1]]) assert.equal(png.alpha(x,y),0,'Opaque outer corner: '+x+','+y);
  assert.equal(png.alpha(size>>1,size>>1),255,'Opaque symbol center expected');
  process.stdout.write('BRAND PNG PASS: '+size+'x'+size+' alpha corners=0 center=255 sha256='+png.sha256+'\n');
}
const activity=fs.readFileSync(path.join(__dirname,'..','media','brand','vestigivo-activity-bar.svg'),'utf8');
assert.ok(activity.includes('currentColor')&&!/<rect\b/.test(activity),'Activity Bar icon must use currentColor and no matte');
process.stdout.write('BRAND SVG PASS: Activity Bar monochrome, no background rectangle\n');
