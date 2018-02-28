
class Charset {
  constructor(params) {
    this.numChars = params.numChars;
    this.fontHeight = params.fontHeight;
    this.bitsPerPixel = params.bitsPerPixel || 1;
    this.colorMap = params.colorMap ? params.colorMap.slice() : new Array(16);
    this.characters = [];
  }

  getGlyph(num) {
    return this.characters[num];
  }

  addGlyph(item) {
    this.characters.push(item);
  }

  getBitmap(num) {
    // let charset = this.charsets[setnum];
    // let ch = this.getCharsetItem(num, setnum);
    let ch = this.characters[num];

    if (!ch) return;
    // console.log('getCharsetBitmap', num, setnum);

    // if (this.bitsPerPixel !== 1) return;

    let w = ch.width;
    let h = ch.height;

    let pixels = new Uint8Array(ch.width * ch.height * 4);
    
    // for (var i = 0; i < ch.width*ch.height; i++) {
    //   pixels[i*4] = 255;
    //   pixels[i*4 + 3] = 255;
    // }

    for (var i = 0, x = 0, y = 0; i < ch.data.length * 8 * this.bitsPerPixel; i += this.bitsPerPixel) {
      let byte = ch.data[(i / 8) >> 0];
      let bit = Math.pow(2, 7-(i % 8));
      let value = (byte & bit ? 255 : 0);

      let index = (y * ch.width + x) * 4;
      pixels[index + 0] = value;
      pixels[index + 1] = value;
      pixels[index + 2] = value;
      pixels[index + 3] = value;

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
