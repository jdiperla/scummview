const path = require('path');
const fs = require('fs');

const Tools = require('./tools');
const Stream = require('./stream');
const Detector = require('./detector');
const Graphics = require('./graphics');
const Game = require('./game');

const OF_OWNER_MASK = 0x0F;
const OF_STATE_MASK = 0xF0;
const OF_STATE_SHL = 4;

class Scumm3 extends Game {
  constructor(rootPath) {
    super();
    this.rootPath = rootPath;
    // this.classData[i] = bits;
    this.classData = [];
    this.objectOwnerTable = [];
    this.objectStateTable = [];
    this.detect();
  }

  detect() {
    this.readIndex();

    // We hash the decoded image data from room 1 and compare that
    // against known hash values to identify the game

    let room = this.getRoom(1);
    if (room) {
      let hash = Tools.checksum(room.imageData);
      let info = Detector.gameInfoFromHash(hash);
      this.name = info.name;
      this.id = info.id;
      this.version = info.version;
      this.room = room;
    }
  }

  readIndex() {
    let buffer, stream;

    try {
      buffer = fs.readFileSync(path.join(this.rootPath, '00.lfl'));
    } catch (err) {
      console.log(err.message);
      return;
    }

    stream = new Stream(Tools.decrypt(buffer, 0xFF));

    // Magic number
    this.magic = stream.getUint16();

    // console.log(this.magic.toString(16));

    if (this.magic !== 0x100) return;

    this.numGlobalObjects = stream.getUint16();
    stream.skip(this.numGlobalObjects * 4);

    // if (this.numGlobalObjects == 1000) { // v3 old
    // } else if (this.numGlobalObjects == 780) { // v2
    // } else {
    // }

    this.numRooms = stream.getUint8();
    stream.skip(this.numRooms * 3);

    this.numCostumes = stream.getUint8();
    stream.skip(this.numCostumes * 3);

    this.numScripts = stream.getUint8();
    stream.skip(this.numScripts * 3);

    this.numSounds = stream.getUint8();

    stream.reset();
    stream.skip(4);

    // Global Objects

    let bits = 0;
    let num = this.numGlobalObjects;

    for (let i = 0; i !== num; i++) {
			bits = stream.getUint8();
			bits |= stream.getUint8() << 8;
			bits |= stream.getUint8() << 16;
      this.classData[i] = bits;
      let b = stream.getUint8();
      this.objectOwnerTable[i] = b & OF_OWNER_MASK;
      this.objectStateTable[i] = b >> OF_STATE_SHL;
		}

    // readResTypeList(rtRoom);
  	// readResTypeList(rtCostume);
  	// readResTypeList(rtScript);
  	// readResTypeList(rtSound);

    // Rooms

    num = stream.getUint8();

    this.rooms = [];
    for (let i = 0; i < num; i++)
      this.rooms[i] = { roomno: i };
    stream.skip(num);

    for (let i = 0; i < num; i++) {
      let offset = stream.getUint16();
      this.rooms[i].offset = offset;
      // if (this.rooms[i].offset == 0xFFFF) console.log(i, 'invalid room offset');
    }
  }

  resourceFilename(num) {
    return num.toString().padStart(2, '0') + '.lfl';
  }

  getRoom(num) {
    let filepath = path.join(this.rootPath, this.resourceFilename(num));
    let data, stream;
    let room = {};

    try {
      data = fs.readFileSync(filepath);
    } catch (err) {
      console.log(err.message);
      return;
    }

    stream = new Stream(Tools.decrypt(data, 0xFF));

    // console.log(stream.getUint8());
    // console.log(stream.getUint8());
    // console.log(stream.getUint8());
    // console.log(stream.getUint8());
    let temp = stream.getUint32();

    // stream.skip(4);

    room.width = stream.getUint16();
    room.height = stream.getUint16();

    if (room.width > 0 && room.height > 0 && room.width < 9999 && room.height < 9999) {
      stream.skip(2);
      room.imageOffset = stream.getUint16(); // offset 10
      stream.skip(8);
      room.numObjects = stream.getUint8(); // offset 20

      // console.log(room.width, room.height, room.numObjects, room.imageOffset);

      stream.seek(room.imageOffset);
      let bytes = stream.getBytes();

      let encodedPixels = new Uint8Array(bytes);
      let pixels = new Array(room.width * room.height);
      // console.log(room.width ^ 0xffff, room.height ^ 0xffff);
      let pixelData = new Uint8Array(room.width * room.height * 4);

      for (var i = 0; i < room.width / 8; i++) {
        Graphics.drawStripEGA(0, 0, pixels, room.width, encodedPixels, room.height, i);
      }

      for (var j = 0; j < room.height; j++ ) {
        for (var i = 0; i < room.width; i++) {
          var rgba = pixels[j * room.width + (i)];
          pixelData[(j * room.width + i) * 4] = (rgba & 0xFF0000) >> 16;
          pixelData[(j * room.width + i) * 4 + 1] = (rgba & 0xFF00) >> 8;
          pixelData[(j * room.width + i) * 4 + 2] = (rgba & 0xFF);
          pixelData[(j * room.width + i) * 4 + 3] = 255;
        }
      }

      room.imageData = pixelData;
    }

    return room;
  }

  getRoomList() {
    try {
      let files = fs.readdirSync(this.rootPath);
      files = files.filter(element => {
        let name = element.toLowerCase();
        return (path.extname(name) == '.lfl' && name !== '00.lfl' && name !== '99.lfl');
      });

      let numbers = [];
      for (var i = 0; i < files.length; i++) {
        numbers[i] = parseInt(files[i].substring(0, 2));
      }

      return numbers;
    } catch (err) {

    }
  }


}

module.exports = Scumm3;
