const path = require('path');
const fs = require('fs');

const Tools = require('./tools');
const Stream = require('./stream');
const Detector = require('./detector');
const Graphics = require('./graphics');
const Game = require('./game');


class Scumm4 extends Game {
  constructor(rootPath) {
    super();
    this.rootPath = rootPath;
    this.roomNames = [];
    this.roomFileOffsets = []; // room lookup table with file no and offset
    this.resource = []; // resource files
    this.detect();
  }

  getImageFromRoomBlock(room) {
    let imageBlock = room.blocks.find(element => {
      return element.type == 0x4d42;
    })

    if (imageBlock) {
      let encodedPixels = imageBlock.data;
      let pixels = new Array(room.width * room.height);

      for (var i = 0; i < room.width / 8; i++) {
        Graphics.drawStripEGA(0, 0, pixels, room.width, encodedPixels, room.height, i);
      }

      let pixelData = new Uint8Array(room.width * room.height * 4);

      for (let j = 0; j < room.height; j++ ) {
        for (let i = 0; i < room.width; i++) {
          let rgba = pixels[j * room.width + (i)];
          pixelData[(j * room.width + i) * 4] = (rgba & 0xFF0000) >> 16;
          pixelData[(j * room.width + i) * 4 + 1] = (rgba & 0xFF00) >> 8;
          pixelData[(j * room.width + i) * 4 + 2] = (rgba & 0xFF);
          pixelData[(j * room.width + i) * 4 + 3] = 255;
        }
      }

      return pixelData;
    }

  }

  detect() {
    this.readIndex();
    this.readResourceFile(1);
    this.readResourceFile(2);
    this.readResourceFile(3);
    this.readResourceFile(4);
    this.readResourceFile(9);

    try {
      let filename = this.resourceFilename(4);
      let buffer = fs.readFileSync(path.join(this.rootPath, filename));
      let stream = new Stream(Tools.decrypt(buffer, 0x69));

      //
      // Grab room 1, which is located in 'disk04.lec' at the first offset
      //
      let offs = this.resource[filename].offsetTable[0].offset;
      stream.seek(offs);

      // first room block -- 'LF'
      let blocksize = stream.getUint32();
      let blocktype = stream.getUint16();

      // console.log(
      //   String.fromCharCode(blocktype & 0xFF) + String.fromCharCode((blocktype >> 8) & 0xFF),
      //   blocktype.toString(16), blocksize);

      let room = this.getRoomBlock(new Stream(stream.getBytes(blocksize - 6)));
      stream.skip(blocksize - 6);

      if (room) {
        let pixelData = this.getImageFromRoomBlock(room);
        room.imageData = pixelData;
        let hash = Tools.checksum(pixelData);
        console.log(hash);

        let info = Detector.gameInfoFromHash(hash);
        if (info) {
          this.name = info.name;
          this.id = info.id;
          this.version = info.version;
          // this.room = room;
        }
      }
    } catch (err) {
      console.log(err.message);
    }
    // return game;
  }

  readIndex() {
    let buffer = fs.readFileSync(path.join(this.rootPath, '000.lfl'));
    let stream = new Stream(buffer);

    while (!stream.atEnd()) {
      let blocksize = stream.getUint32();
      let blocktype = stream.getUint16();

      if (blocktype == 0x4e52) { //NR
        // console.log('NR');
        for (let r; r = stream.getUint8(); ) {
          let bytes = stream.getBytes(9);
          let string = '';
          for (var i = 0; i < bytes.length; i++) {
            bytes[i] ^= 0xFF;
            string += String.fromCharCode(bytes[i]);
          }
          this.roomNames.push({ index: r, name: string });
        }
      }
      else if (blocktype == 0x5230) { //R0
        // console.log('R0');
        this.numRooms = stream.getUint16();
        for (let i = 0; i < this.numRooms; i++) {
          let fileno = stream.getUint8();
          let roomoffs = stream.getUint32();
          this.roomFileOffsets.push({ fileno: fileno, offset: roomoffs });
      	}
      }
      else if (blocktype == 0x5330) { //S0
        // console.log('S0');
        this.numScripts = stream.getUint16();
        stream.skip(blocksize - 8);
      }
      else if (blocktype == 0x4e30) { //N0
        // console.log('N0');
        this.numSounds = stream.getUint16();
        stream.skip(blocksize - 8);
      }
      else if (blocktype == 0x4330) { //C0
        // console.log('C0');
        this.numCostumes = stream.getUint16();
        stream.skip(blocksize - 8);
      }
      else if (blocktype == 0x4f30) { //O0
        // console.log('O0');
        this.numGlobalObjects = stream.getUint16();
        stream.skip(blocksize - 8);
      } else {
        console.log('??');
        stream.skip(blocksize - 8);
      }
    }

    // console.log(this.roomFileOffsets[60]);

    for (var i = 0; i < this.roomNames.length; i++) {
      let rn = this.roomNames[i];
      console.log(rn.index, rn.name);
    }
  }

  resourceFilename(num) {
    return 'disk' + (num.toString().padStart(2, '0')) + '.lec';
  }

  readResourceFile(num) {
    let filename = this.resourceFilename(num);
    let data;
    try {
      data = fs.readFileSync(path.join(this.rootPath, filename));
    } catch (err) {
      console.log(err.message);
      return;
    }

    let stream = new Stream(Tools.decrypt(data, 0x69));

    let blocksize, blocktype;

    this.resource[filename] = {};
    this.resource[filename].offsetTable = [];

    // read main block header -- 'LE'
    blocksize = stream.getUint32();
    blocktype = stream.getUint16();
    // console.log('LE', blocksize, blocktype.toString(16));

    // read room offset table -- 'FO'
    blocksize = stream.getUint32();
    blocktype = stream.getUint16();
    // console.log('FO', blocktype.toString(16));

    // number of rooms in this file
    let numRooms = stream.getUint8();
    this.resource[filename].numRooms = numRooms;

    for (var i = 0; i < numRooms; i++) {
      let roomno = stream.getUint8(); //buffer[offset];
      let offs = stream.getUint32();
      this.resource[filename].offsetTable.push({ roomno: roomno, offset: offs });
    }

  }

  getRoomBlock(stream) {
    let blocksize, blocktype;
    let room = { blocks: [] };

    room.num = stream.getUint16();
    // console.log('room:', room.num);

    blocksize = stream.getUint32();
    blocktype = stream.getUint16();
    // console.log('RO', blocktype.toString(16), blocksize);

    let len = stream.offset + blocksize - 6;

    blocksize = stream.getUint32();
    blocktype = stream.getUint16();
    // console.log('HD', blocktype.toString(16), blocksize);

    room.width = stream.getUint16();
    room.height = stream.getUint16();
    room.numObjects = stream.getUint16();

    // console.log(room.width, room.height, room.numObjects);

    while (stream.offset < len) {
      blocksize = stream.getUint32();
      blocktype = stream.getUint16();
      room.blocks.push({ type: blocktype, data: stream.getBytes(blocksize - 6) });
    }

    return room;
  }

  getRoom(num) {
    // console.log('getRoom', num);
    let entry = this.roomFileOffsets[num];
    if (entry) {
      // console.log('entry', entry);
      if (entry.fileno) {
        let filename = this.resourceFilename(entry.fileno);
        let data;
        try {
          data = fs.readFileSync(path.join(this.rootPath, filename));
          // console.log('gotdata');
        } catch (err) {
          console.log(err);
          return;
        }

        let stream = new Stream(Tools.decrypt(data, 0x69));
        let table = this.resource[filename].offsetTable;
        // console.log();
        // for (var i = 0; i < table.length; i++) {
          // console.log(table[i]);
        // }

        let ot = table.find(element => {
          return element.roomno == num;
        });
        if (ot) {
          // console.log(ot);
          stream.skip(ot.offset);
          // console.log(stream.offset);

          // LF
          let blocksize = stream.getUint32();
          let blocktype = stream.getUint16();

          let room = this.getRoomBlock(stream);
          if (room) {
            let pixelData = this.getImageFromRoomBlock(room);
            room.imageData = pixelData;
            // console.log('room!!!');
            return room;
          }
        }

      }
    }
  }

  getRoomList() {
    let list = [];
    for (var i = 0; i < this.roomFileOffsets.length; i++) {
      let entry = this.roomFileOffsets[i];
      if (entry.fileno) {
        list.push(i);
      }
    }
    return list;
  }

}

module.exports = Scumm4;
