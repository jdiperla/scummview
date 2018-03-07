const fs = require('fs');
const path = require('path');

const Tools = require('../tools');
const Stream = require('../stream');

class Scumm {
  constructor(detector) {
    if (detector) {
      this.detector = detector;
      this.rootPath = detector.rootPath;
    }
    this.roomNames = [];
    this.roomFileTable = [];
    this.roomOffsets = [];
    this.rooms = [];
    this.resources = [];
    this.numGlobalObjects = 0;
    this.numSounds = 0;
    this.numScripts = 0;
    this.numCostumes = 0;
    this.filecache = [];
    this.charsets = [];
  }

  detect() { }

  getTitle() {
    if (this.info)
      return this.info.title;
  }

  getVersion() {
    if (this.info)
      return this.info.version;
  }

  getImage() {
    if (this.info && this.info.image) {
      let image = new Image();
      image.src = './images/' + this.info.image;
      // console.log(image.src);
      return image;
    }
  }

  getFileStream(filepath, enc) {
    let buffer;
    try {
      buffer = fs.readFileSync(filepath);
    } catch (err) {
      console.log(err.message);
      return;
    }
    if (enc) {
      buffer = Tools.decrypt(buffer, enc);
    }
    return new Stream(buffer);
  }

  getRoom() { }
  getRoomBitmap() { }

}

module.exports = Scumm;
