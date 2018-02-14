
var ROOM_PALETTE = [
  0x000000, 	0x0000AA, 	0x00AA00, 	0x00AAAA,
  0xAA0000, 	0xAA00AA, 	0xAA5500, 	0xAAAAAA,
  0x555555, 	0x5555FF, 	0x55FF55, 	0x55FFFF,
  0xFF5555, 	0xFF55FF, 	0xFFFF55, 	0xFFFFFF
];

class Graphics {

  static drawStripEGA(dstX, dstY, dst, dstPitch, src, height, strip) {
    var offset = -1;
    var smapLen;
    var srcOffset = 0;

    var _paletteMod = 0;
    var color = 0;
    var run = 0;
    var x = 0;
    var y = 0;
    var z;

    var a = 0;

    smapLen = (src[1] << 8) | src[0];

    if (strip * 2 + 2 < smapLen) {
      offset = (src[strip * 2 + 2 + 1] << 8) | src[strip * 2 + 2];
    }

    srcOffset += offset;
    x = strip * 8;

    while (x < (strip + 1) * 8) {
      color = src[srcOffset++];

      if (color & 0x80) {
        run = color & 0x3f;

        if (color & 0x40) {
          color = src[srcOffset++];

          if (run == 0) {
            run = src[srcOffset++];
          }
          for (z = 0; z < run; z++) {
            dst[(dstY + y) * dstPitch + x + dstX] = (z & 1) ? ROOM_PALETTE[(color & 0xf) + _paletteMod] : ROOM_PALETTE[(color >> 4) + _paletteMod];

            y++;
            if (y >= height) {
              y = 0;
              x++;
            }
          }
        } else {
          if (run == 0) {
            run = src[srcOffset++];
          }

          for (z = 0; z < run; z++) {
            dst[(dstY + y) * dstPitch + x + dstX] = dst[(dstY + y) * dstPitch + x + dstX - 1];
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
        }

        for (z = 0; z < run; z++) {
          dst[(dstY + y) * dstPitch + x + dstX] = ROOM_PALETTE[(color & 0xf) + _paletteMod];
          y++;
          if (y >= height) {
            y = 0;
            x++;
          }
        }
      }
      if (srcOffset > src.length) {
        console.log('break');
        break;
      }
    }
  }

}

module.exports = Graphics;
