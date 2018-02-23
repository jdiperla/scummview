

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
}

module.exports = Charset;
