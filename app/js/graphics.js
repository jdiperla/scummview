
const ROOM_PALETTE = [
  0x000000, 	0x0000AA, 	0x00AA00, 	0x00AAAA,
  0xAA0000, 	0xAA00AA, 	0xAA5500, 	0xAAAAAA,
  0x555555, 	0x5555FF, 	0x55FF55, 	0x55FFFF,
  0xFF5555, 	0xFF55FF, 	0xFFFF55, 	0xFFFFFF
];

const EGA_PALETTE = [
  0x00, 0x00, 0x00, 	0x00, 0x00, 0xAA, 	0x00, 0xAA, 0x00, 	0x00, 0xAA, 0xAA,
  0xAA, 0x00, 0x00, 	0xAA, 0x00, 0xAA, 	0xAA, 0x55, 0x00, 	0xAA, 0xAA, 0xAA,
  0x55, 0x55, 0x55, 	0x55, 0x55, 0xFF, 	0x55, 0xFF, 0x55, 	0x55, 0xFF, 0xFF,
  0xFF, 0x55, 0x55, 	0xFF, 0x55, 0xFF, 	0xFF, 0xFF, 0x55, 	0xFF, 0xFF, 0xFF
];


class Graphics {

  maskToRGBA(buffer) {
    let dst = new Uint8Array(buffer.length * 8 * 4);
    // let offs = 0;
    for (var i = 0, offs=0; i < buffer.length; i++) {
      let b = buffer[i];
      for (var j = 0; j < 8; j++) {
        let c = (b & (j+1) ? 255 : 0);
        dst[offs] = c;
        dst[offs + 1] = c;
        dst[offs + 2] = c;
        dst[offs + 3] = 255;
        offs += 4;
      }
      // offs += (8 * 4);
    }
    return dst;
  }

  indexedToRGBA(buffer) {
    let dst = new Uint8Array(buffer.length * 4);
    for (var i = 0; i < buffer.length; i++) {
      let c = buffer[i];
      dst[i * 4] = EGA_PALETTE[c * 3];
      dst[i * 4 + 1] = EGA_PALETTE[c * 3 + 1];
      dst[i * 4 + 2] = EGA_PALETTE[c * 3 + 2];
      dst[i * 4 + 3] = 255;
    }
    return dst;
  }

  // void Gdi::decompressMaskImg(byte *dst, const byte *src, int height) const {
  // 	byte b, c;
  //
  // 	while (height) {
  // 		b = *src++;
  //
  // 		if (b & 0x80) {
  // 			b &= 0x7F;
  // 			c = *src++;
  //
  // 			do {
  // 				*dst = c;
  // 				dst += _numStrips;
  // 				--height;
  // 			} while (--b && height);
  // 		} else {
  // 			do {
  // 				*dst = *src++;
  // 				dst += _numStrips;
  // 				--height;
  // 			} while (--b && height);
  // 		}
  // 	}
  // }

  decodeMask(src, width, height) {

    function decodeMaskStrip(src, offset, height) {
      let b, count;
      let dst = [];
      let line_left = height;

      while(line_left) {
        count = src[offset++];
        if(count & 0x80) { // write the same byte count times
          count &= 0x7F;
          b = src[offset++];
          do {
            dst.push(b);
            --line_left;
          } while(--count && line_left);
        } else {  // write count bytes as is from the input
          do {
            dst.push(src[offset++]);
            --line_left;
          } while(--count && line_left);
        }
      }

      return dst;
    }

  	let b, c;
    let dst = [];

    // for (var i = 0; i < width / 8; i++) {
    //   let offset =
    //   let strip = decodeMaskStrip(src, offset, height);
    //   dst.push(strip);
    // }

    return dst;
  }


  // decodeSmap
  // src: Array containing the compressed SMAP
  // returns: Array of indexed palette pixel values (0-15)

  decodeSmap(src, width, height, error=true) {
    // console.log('decodeSmap', width, height);

    let dst = new Uint8Array(width * height);
    let smapLen = (src[1] << 8 | src[0]);
    let pc = 0;
    let overrun = false;
    let dc = 0;
    let srcOffset = 0;

    for (var strip = 0; strip < width / 8; strip++) {
      // console.log(strip);
      let offset = -1;
      let color = 0;
    	let run = 0, x = 0, y = 0, z;
      srcOffset = 0;

      if (strip * 2 + 2 < smapLen) {
        offset = (src[strip * 2 + 3] << 8) | src[strip * 2 + 2];
      }

      srcOffset += offset;
      x = strip * 8;

      if (offset >= smapLen || offset == -1) { overrun = true; break; }

    	while (x < (strip + 1) * 8) {
        color = src[srcOffset++];
        dc++;

    		if (color & 0x80) {
    			run = color & 0x3f;

    			if (color & 0x40) {
            color = src[srcOffset++];
            dc++;

    				if (run == 0) {
              run = src[srcOffset++];
              dc++;
    				}
    				for (z = 0; z < run; z++) {
              dst[y * width + x] = (z & 1) ? color & 0xf : color >> 4;
              pc++;
    					y++;
    					if (y >= height) {
    						y = 0;
    						x++;
    					}
    				}
    			} else {
    				if (run == 0) {
              run = src[srcOffset++];
              dc++;
    				}

    				for (z = 0; z < run; z++) {
              dst[y * width + x] = dst[y * width + x - 1];
              pc++;
    					y++;
    					if (y >= height) {
    						y = 0;
    						x++;
    					}
    				}
    			}
    		} else {
    			run = color >> 4;
    			if (run == 0) {
            run = src[srcOffset++];
            dc++;
    			}

    			for (z = 0; z < run; z++) {
            dst[y * width + x] = color & 0xf;
            pc++;
    				y++;
    				if (y >= height) {
    					y = 0;
    					x++;
    				}
    			}
    		}
    	}
    }

    if (error) {
      if (srcOffset < smapLen) {
        throw "SMAP underrun";
      }

      if (srcOffset > smapLen) {
        throw "SMAP overrun";
      }

      if (pc != width * height) {
        throw "pixel mismatch";
      }
    }

    return dst;
  }

}

module.exports = Graphics;
