
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
}

module.exports = Charset;
