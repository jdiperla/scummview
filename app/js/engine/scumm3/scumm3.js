const path = require('path');
const fs = require('fs');

const Tools = require('../../tools');
const Stream = require('../../stream');
const Detector = require('../../detector');
const Graphics = require('../../graphics');
const Scumm = require('../scumm');
const Charset = require('./charset');

const OF_OWNER_MASK = 0x0F;
const OF_STATE_MASK = 0xF0;
const OF_STATE_SHL = 4;


class Scumm3 extends Scumm {
  constructor(detector) {
    super(detector);
    this.graphics = new Graphics();
    this.detect();
  }

  detect() {
    this.parseIndex();
    this.parseCharset();

    let room = this.getRoom(1);
    if (room) {
      let pixelsRGBA = this.getRoomBitmap(room.id);

      // We hash the decoded image data from room 1 and compare that
      // against known hash values to identify the game
      let hash = Tools.checksum(pixelsRGBA);
      console.log(hash);

      let info = Detector.gameInfoFromHash(hash);
      if (info) {
        this.info = info;
        // this.name = info.name;
        // this.id = info.id;
        // this.version = info.version;
      }
    }
  }

  getCharsetItem(num, setnum=0) {
    return this.charsets[setnum].characters[num];
  }

  parseCharset() {
    let buffer;
    try {
      buffer = fs.readFileSync(path.join(this.rootPath, '99.lfl'));
    } catch (err) {
      console.log(err.message);
      return;
    }
    let stream = new Stream(buffer);

    let numChars = stream.getUint8(6);
    let charHeight = stream.getUint8(7);

    let offset = 8;
    let characters = [];

    // Read width table
    for (var i = 0; i < numChars; i++) {
      characters[i] = {};
      let b = stream.getUint8(offset++);
      characters[i].width = b;
      characters[i].height = charHeight;
      // console.log(i, b);
    }

    for (var i = 0; i < numChars; i++) {
      let data = stream.getBytes(offset, 8);
      characters[i].data = data;
      offset += 8;
    }

    let charset = new Charset({ numChars: numChars, charHeight: charHeight });
    for (var i = 0; i < characters.length; i++)
      charset.addGlyph(characters[i]);

    this.charsets[0] = charset;
  }

  parseIndex() {
    let buffer;

    try {
      buffer = fs.readFileSync(path.join(this.rootPath, '00.lfl'));
    } catch (err) {
      console.log(err.message);
      return;
    }

    let stream = new Stream(Tools.decrypt(buffer, 0xff));

    // Magic number
    this.magic = stream.getUint16LE(0);

    console.log('0x' + this.magic.toString(16));

    if (this.magic !== 0x100) return;

    this.numGlobalObjects = stream.getUint16LE(2);
    // stream.skip(this.numGlobalObjects * 4);

    let offset = 4 + this.numGlobalObjects * 4;

    // if (this.numGlobalObjects == 1000) { // v3 old
    // } else if (this.numGlobalObjects == 780) { // v2
    // } else {
    // }

    this.numRooms = stream.getUint8(offset);
    // stream.skip(this.numRooms * 3);
    offset += this.numRooms * 3;

    this.numCostumes = stream.getUint8(offset);
    // stream.skip(this.numCostumes * 3);
    offset += this.numCostumes * 3;

    this.numScripts = stream.getUint8(offset);
    // stream.skip(this.numScripts * 3);
    offset += this.numScripts * 3;

    this.numSounds = stream.getUint8(offset);

    // stream.reset();
    // stream.skip(4);
    // offset = 4;

    // Global Objects

    let bits = 0;

    this.classData = [];
    this.objectOwnerTable = [];
    this.objectStateTable = [];

    for (let i = 0; i !== this.numGlobalObjects; i++) {
			bits = stream.getUint8(offset);
			bits |= stream.getUint8(offset + 1) << 8;
			bits |= stream.getUint8(offset + 2) << 16;
      this.classData[i] = bits;
      let b = stream.getUint8(offset + 3);
      this.objectOwnerTable[i] = b & OF_OWNER_MASK;
      this.objectStateTable[i] = b >> OF_STATE_SHL;
      offset += 4;
		}

    // console.log(this.objectStateTable);

    // Rooms

    // num = stream.getUint8(offset);

    // this.rooms = [];
    // for (let i = 0; i < num; i++)
    //   this.rooms[i] = { roomno: i };
    // stream.skip(num);
    //
    // for (let i = 0; i < num; i++) {
    //   let offset = stream.getUint16();
    //   this.rooms[i].offset = offset;
    //   // if (this.rooms[i].offset == 0xFFFF) console.log(i, 'invalid room offset');
    // }

    // console.log(this.numGlobalObjects, this.numRooms);
    fs.writeFileSync(path.join(this.rootPath, '_classData.txt'), this.classData);
    fs.writeFileSync(path.join(this.rootPath, '_objectOwnerTable.txt'), this.objectOwnerTable);
    fs.writeFileSync(path.join(this.rootPath, '_objectStateTable.txt'), this.objectStateTable);
  }

  resourceFilename(num) {
    return num.toString().padStart(2, '0') + '.lfl';
  }

  getRoomBitmap(roomid) {
    let room = this.getRoom(roomid);
    let stream = this.getResourceStream(room.id);

    if (room.imageOffset > stream.size) return;

    let hasImage = (room.width > 0 && room.height > 0 && room.width !== 8);

    if (hasImage) {
      let bytes = stream.getBytes(room.imageOffset, stream.getUint16LE(0));

      try {
        let pixels = this.graphics.decodeSmap(bytes, room.width, room.height, false);
        if (pixels) {
          let pixelsRGBA = this.graphics.indexedToRGBA(pixels);
          return pixelsRGBA;
        }
      } catch (err) {
        console.log('ROOM', roomid, err);
      }
    }
  }

  getResourceStream(num) {
    let filename = this.resourceFilename(num);
    let buffer;
    if (this.resources[filename]) {
      buffer = this.resources[filename].cache;
    } else {
      try {
        buffer = fs.readFileSync(path.join(this.rootPath, filename));
      } catch (err) {
        console.log(err.message);
        return;
      }
      buffer = Tools.decrypt(buffer, 0xFF);
      this.resources[filename] = { cache: buffer };
    }
    return new Stream(buffer);
  }

  // A mask is stored in strips like an image, however, each pixel is
  // represented by a single bit

  getRoomObjectBitmap(roomid, number) {
    // console.log('getRoomObjectBitmap', roomid, number);
    let stream = this.getResourceStream(roomid);
    let ob = this.getRoomObject(roomid, number);
    if (!ob) return;

    let bytes = stream.getBytes(ob.OBIMoffset, stream.getUint16LE(0));
    try {
      let pixels = this.graphics.decodeSmap(bytes, ob.width, ob.height);
      if (pixels) {
        let pixelsRGBA = this.graphics.indexedToRGBA(pixels);
        return pixelsRGBA;
      }
    } catch (err) {
      // console.log('OB', number, err);
    }
  }

  getRoomObjectBitmapMask(roomid, number) {
    let stream = this.getResourceStream(roomid);
    let ob = this.getRoomObject(roomid, number);
    if (!ob) return;

    // let hasImage = (ob.width > 0 && ob.height > 0 && ob.width !== 8 && ob.bytes[2] == 19);
    let hasImage = (ob.width > 0 && ob.height > 0 && ob.width !== 8);

    if (hasImage) {
      let zplane_offset = ob.OBIMoffset + stream.getUint16LE(0);
      let bytes = stream.getBytes(zplane_offset);
      let pixels = this.graphics.decodeMask(bytes, ob.width, ob.height);
      let pixelsRGBA = this.graphics.maskToRGBA(pixels);
      return pixelsRGBA;
    }
  }

  getRoomObject(roomid, number) {
    let room = this.getRoom(roomid);
    let ob = room.objects.find(ob => {
      return ob.number == number;
    });
    // let ob = room.objects[number];
    return ob;
  }

  parseRoomObject(stream, ob) {
    // let offset = ob.OBCDoffset - 2;
    let offset = ob.OBCDoffset - 2;

    ob.bytes = stream.getBytes(offset, 6);

    ob.flag = ob.bytes[2];

    // ob.offset = offset;
    ob.number = stream.getUint16LE(offset + 6);
    ob.x_pos = stream.getUint8(offset + 9) * 8;
    ob.y_pos = (stream.getUint8(offset + 10) & 0x7f) * 8;
    ob.parentstate = (stream.getUint8(offset + 10) & 0x80) ? 1 : 0;
    ob.width = stream.getUint8(offset + 11) * 8;
    ob.parent = stream.getUint8(offset + 12); //*(ptr + 12);
    ob.height = stream.getUint8(offset + 17) & 0xf8;
    ob.smapLen = stream.getUint16LE(ob.OBIMoffset);
    ob.nameOffset = stream.getUint8(offset + 18);

    //verb table offset + 19

    ob.name = '';
    for(let i = 0, offs = ob.OBCDoffset + ob.nameOffset; i < 32; i++) {
      let b = stream.getUint8(offs++);
      if (b == 0x00 || b == '@'.charCodeAt(0)) break;
      // if (b == 0x00) break;
      ob.name += String.fromCharCode(b);
    }

    ob.hasImage = true;
    //scumm script data after name

  }

  getRoom(num) {
    // console.log('getRoom', num);
    if (this.rooms[num])
      return this.rooms[num];

    let stream = this.getResourceStream(num);

    let room = {};
    room.id = num;
    room.width = stream.getUint16LE(4);
    room.height = stream.getUint16LE(6);
    room.imageOffset = stream.getUint16LE(10);
    room.numObjects = stream.getUint8(20);
    room.numSounds = stream.getUint8(23);
    room.numScripts = stream.getUint8(24);

    // Parse room objects
    room.objects = [];

    for (let i = 0, offset = 29; i < room.numObjects; i++) {
      let ob = {};
      ob.OBIMoffset = stream.getUint16LE(offset);
      ob.OBCDoffset = stream.getUint16LE(offset + 2 * room.numObjects);
      this.parseRoomObject(stream, ob);
      if (ob)
        room.objects.push(ob);
      offset += 2;
    }

    // let OBIMs = {};
    // for (let i = room.objects.length - 1; i >= 0; i--) {
    //   let ob = room.objects[i];
    //   if (OBIMs[ob.OBIMoffset]) {
    //     ob.hasImage = false;
    //   } else {
    //     OBIMs[ob.OBIMoffset] = ob.number;
    //     ob.hasImage = true;
    //   }
    // }

    this.rooms[num] = room;

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
