
const EGA_PALETTE = [
  0x00, 0x00, 0x00, 	0x00, 0x00, 0xAA, 	0x00, 0xAA, 0x00, 	0x00, 0xAA, 0xAA,
  0xAA, 0x00, 0x00, 	0xAA, 0x00, 0xAA, 	0xAA, 0x55, 0x00, 	0xAA, 0xAA, 0xAA,
  0x55, 0x55, 0x55, 	0x55, 0x55, 0xFF, 	0x55, 0xFF, 0x55, 	0x55, 0xFF, 0xFF,
  0xFF, 0x55, 0x55, 	0xFF, 0x55, 0xFF, 	0xFF, 0xFF, 0x55, 	0xFF, 0xFF, 0xFF
];


class Charset {
  constructor(params) {
    this.numChars = params.numChars;
    this.fontHeight = params.fontHeight;
    this.bitsPerPixel = params.bitsPerPixel || 1;
    this.colorMap = params.colorMap ? params.colorMap.slice() : new Array(16);
    // console.log(this.colorMap);
    this.characters = [];
    // console.log(this.bitsPerPixel);
  }

  getGlyph(num) {
    return this.characters[num];
  }

  addGlyph(item) {
    this.characters.push(item);
  }

  getBitmap(num) {
    let ch = this.characters[num];
    if (!ch) return;

    let w = ch.width;
    let h = ch.height;

    let pixels = new Uint8Array(ch.width * ch.height * 4);

    for (var i = 0, x = 0, y = 0; i < ch.data.length * 8 * this.bitsPerPixel; i += this.bitsPerPixel) {
      let byte = ch.data[(i / 8) >> 0];
      let value, alpha;

      if (this.bitsPerPixel == 1) {
        let bit = Math.pow(2, 7 - (i % 8));
        value = (byte & bit ? 15 : 0);
        alpha = (byte & bit ? 255 : 0);
      } else if (this.bitsPerPixel == 2) {
        let bit1 = byte & Math.pow(2, 7 - (i % 8)) ? 2 : 0;
        let bit2 = byte & Math.pow(2, 7 - ((i + 1) % 8)) ? 1 : 0;
        // value = this.colorMap[bit1 + bit2];
        value = this.colorMap[bit1 + bit2];
        alpha = (bit1 + bit2) == 0 ? 0 : 255;
      }

      let index = (y * ch.width + x) * 4;
      pixels[index + 0] = EGA_PALETTE[value * 3 + 0];
      pixels[index + 1] = EGA_PALETTE[value * 3 + 1];
      pixels[index + 2] = EGA_PALETTE[value * 3 + 2];
      pixels[index + 3] = alpha;

      x++;
      if (x == ch.width) {
        y++;
        x = 0;
      }
    }

    return pixels;
  }


}

module.exports = Charset;
