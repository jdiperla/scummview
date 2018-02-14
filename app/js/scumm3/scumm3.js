const path = require('path');
const fs = require('fs');

const Tools = require('../tools');
const Stream = require('../stream');
const Detector = require('../detector');
const Graphics = require('../graphics');
const Game = require('../game');

const OF_OWNER_MASK = 0x0F;
const OF_STATE_MASK = 0xF0;
const OF_STATE_SHL = 4;

class Scumm3 extends Game {
  constructor(detector) {
    super();
    this.rootPath = detector.rootPath;
    this.classData = [];
    this.objectOwnerTable = [];
    this.objectStateTable = [];
    this.resource = [];
    this.rooms = [];
    this.detect();
  }

  detect() {
    this.readIndex();

    // We hash the decoded image data from room 1 and compare that
    // against known hash values to identify the game

    let room = this.getRoom(1);
    if (room) {
      let imageData = this.getRoomImage(room);
      let hash = Tools.checksum(imageData);
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
  }

  resourceFilename(num) {
    return num.toString().padStart(2, '0') + '.lfl';
  }

  getRoomImage(room) {
    let stream = this.getResourceStream(room.id);

    if (room.imageOffset > stream.size) return;

    let hasImage = (room.width > 0 && room.height > 0 && room.width !== 8);

    try {
      if (hasImage) {
        stream.seek(room.imageOffset);
        let bytes = stream.getBytes();

        // let encodedPixels = new Uint8Array(bytes);
        let pixels = new Array(room.width * room.height);
        let pixelData = new Uint8Array(room.width * room.height * 4);

        for (var i = 0; i < room.width / 8; i++) {
          Graphics.drawStripEGA(0, 0, pixels, room.width, bytes, room.height, i);
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

        return pixelData;
      }
    } catch (err) {
      console.log(err.message);
      console.log(room);
    }
  }

  getResourceStream(num) {
    let filename = this.resourceFilename(num);
    let data;
    if (this.resource[filename]) {
      data = this.resource[filename].cache;
    } else {
      try {
        data = fs.readFileSync(path.join(this.rootPath, filename));
        data = Tools.decrypt(data, 0xFF);
      } catch (err) {
        console.log(err.message);
        return;
      }
      this.resource[filename] = { cache: data };
    }
    return new Stream(data);
  }

  getRoomObjectImage(roomid, obid) {
    // console.log('hi1');
    let stream = this.getResourceStream(roomid);
    let ob = this.getRoomObject(roomid, obid);
    // console.log(ob);

    if (!ob) return;

    // stream.skip(ob.OBIMoffset);

    let smapLen = stream.getUint16(ob.OBIMoffset);
    stream.skip(ob.OBIMoffset);
    let src = stream.getBytes(smapLen);

    let xpos = ob.xPos / 8;
    let ypos = ob.yPos;

    let width = ob.width / 8;
    let height = ob.height &= 0xFFFFFFF8;	// Mask out last 3 bits

    let _screenStartStrip = 0;
    let _screenEndStrip = 2048;

    if (width == 0 || xpos > _screenEndStrip || xpos + width < _screenStartStrip)
  		return;

    let x = 0xFFFF;
    let arg = 0;
    let a, numstrip, tmp;

  	for (a = numstrip = 0; a < width; a++) {
  		tmp = xpos + a;
  		if (tmp < _screenStartStrip || _screenEndStrip < tmp)
  			continue;
  		if (arg > 0 && _screenStartStrip + arg <= tmp)
  			continue;
  		if (arg < 0 && tmp <= _screenEndStrip + arg)
  			continue;
  		// setGfxUsageBit(tmp, USAGE_BIT_DIRTY);
  		if (tmp < x)
  			x = tmp;
  		numstrip++;
  	}

    console.log('getRoomObjectImage', width, height, numstrip);
    // console.log(numstrip);

    let dst = new Uint8Array(ob.width * ob.height);
    if (numstrip != 0) {
  		// let flags = od.flags | Gdi::dbObjectMode;
  		// _gdi->drawBitmap(ptr, &_virtscr[kMainVirtScreen], x, ypos, width * 8, height, x - xpos, numstrip, flags);
      // Graphics.drawBitmap(stream.buffer, pixels, x, ypos, width * 8, height, x - xpos, numstrip, flags);
      for (var i = 0; i < numstrip; i++) {
        Graphics.drawStripEGA(0, 0, dst, ob.width, src, ob.height, i);
      }

      let pixelData = new Uint8Array(ob.width * ob.height * 4);

      for (var j = 0; j < ob.height; j++ ) {
        for (var i = 0; i < ob.width; i++) {
          var rgba = dst[j * ob.width + (i)];
          pixelData[(j * ob.width + i) * 4] = (rgba & 0xFF0000) >> 16;
          pixelData[(j * ob.width + i) * 4 + 1] = (rgba & 0xFF00) >> 8;
          pixelData[(j * ob.width + i) * 4 + 2] = (rgba & 0xFF);
          pixelData[(j * ob.width + i) * 4 + 3] = 255;
        }
      }
      return pixelData;
  	}

  }

  getRoomObject(roomid, obid) {
    // console.log('getRoomObject', roomid, obid);
    let room = this.getRoom(roomid);
    let ob = room.objects.find(ob => {
      return ob.number == obid;
    });
    return ob;
  }

  getRoom(num) {
    if (this.rooms[num]) {
      return this.rooms[num];
    }

    let stream = this.getResourceStream(num);

    let room = {};
    room.id = num;
    room.width = stream.getUint16(4);
    room.height = stream.getUint16(6);
    room.imageOffset = stream.getUint16(10);
    room.numObjects = stream.getUint8(20);
    room.numSounds = stream.getUint8(23);
    room.numScripts = stream.getUint8(24);

    // Read objects
    room.objects = [];

    // stream.seek(29 + 2 * room.numObjects);
    // let offset = 29 + 2 * room.numObjects;
    let offset = 29;

    // if (room.id == 1)
    //   console.log(room.id, 'obstart', offset);

    for (let i = 0; i < room.numObjects; i++) {
      let ob = {};
      ob.OBIMoffset = stream.getUint16(offset);
      ob.OBCDoffset = stream.getUint16(offset + 2 * room.numObjects);

      // if (room.id == 1)
      //   console.log(ob.OBIMoffset, ob.OBCDoffset);

      let objOffset = ob.OBCDoffset - 2;

      // ob.id = stream.getUint8(objOffset + 6);
      // ob.type = stream.getUint8(objOffset + 7);

      ob.number = stream.getUint16(objOffset + 6);
      ob.xPos = stream.getUint8(objOffset + 9) * 8;
      ob.yPos = (stream.getUint8(objOffset + 10) & 0x7f) * 8;
      // ob.parentState = (stream.getUint8(objOffset + 10) & 0x80) ? 1 : 0;
      ob.width = stream.getUint8(objOffset + 11) * 8;
      // ob.parent = stream.getUint8(objOffset + 12);
      // ob.walkX = stream.getUint16(objOffset + 13);
      // ob.walkY = stream.getUint16(objOffset + 15);
      // ob.actorDir = stream.getUint8(objOffset + 17) & 7;
      ob.height = stream.getUint8(objOffset + 17) & 0xf8;
      ob.smapLen = stream.getUint16(ob.OBIMoffset);

      room.objects.push(ob);

      offset += 2;
    }

    // if (room.id == 1)
    //   console.log('obend', offset);

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
