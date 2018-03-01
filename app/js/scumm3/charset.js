

class Charset {
  constructor(params) {
    this.numChars = params.numChars;
    this.charHeight = params.charHeight;
    this.bitsPerPixel = params.bitsPerPixel || 1;
    this.characters = [];
  }

  getGlyph(num) {
    return this.characters[num];
  }

  addGlyph(item) {
    this.characters.push(item);
  }

  getBitmap(num) {
    // let ch = this.charsets[setnum].characters[num];
    let ch = this.characters[num];
    if (!ch) return;

    let pixels = new Uint8Array(ch.width * ch.height * 4);

    for (var i = 0, x = 0, y = 0; i < ch.data.length * 8; i++) {
      let byte = ch.data[(i / 8) >> 0];
      let bit = Math.pow(2, 7-(i % 8));
      let value = (byte & bit ? 255 : 0);
      let alpha = byte & bit ? 255 : 0;

      let index = (y * ch.width + x) * 4;
      pixels[index + 0] = value;
      pixels[index + 1] = value;
      pixels[index + 2] = value;
      pixels[index + 3] = alpha;

      x++;
      if (x == 8) {
        y++;
        x = 0;
      }
    }

    return pixels;
  }


}

module.exports = Charset;
