const path = require('path');
const fs = require('fs');

const Tools = require('../../tools');
const Stream = require('../../stream');
const Detector = require('../../detector');
const Graphics = require('../../graphics');
const Scumm = require('../scumm');
const Charset = require('./charset');


class Scumm4 extends Scumm {
  constructor(detector) {
    super(detector);
    this.graphics = new Graphics();
    this.detect();
  }

  detect() {
    this.parseIndex();
    this.parseCharset(1);
    this.parseCharset(2);
    this.parseCharset(3);
    this.parseCharset(4);

    let room = this.getRoom(1);

    if (room) {
      let pixelsRGBA = this.getRoomBitmap(room.id);
      if (pixelsRGBA) {
        let hash = Tools.checksum(pixelsRGBA);
        console.log(hash);
        let info = Detector.gameInfoFromHash(hash);
        if (info) {
          console.log(info.name);
          this.name = info.name;
          this.id = info.id;
          this.version = info.version;
        }
      }
    }
  }

  makeIndexFilename(num) {
    return num.toString().padStart(3, '0') + '.lfl';
  }

  getCharsetItem(num, setnum=0) {
    return this.charsets[setnum].characters[num];
  }

  parseCharset(num=1) {
    if (num < 1) return;

    let buffer;

    try {
      buffer = fs.readFileSync(path.join(this.rootPath, (900 + num) + '.lfl'));
    } catch (err) {
      console.log(err.message);
      return;
    }

    let stream = new Stream(buffer);
    // let charset = {};

    let size = stream.getUint32LE(0) + 15;
    let colorMap = stream.getBytes(5, 16);
    let bitsPerPixel = stream.getUint8(21);
    let fontHeight = stream.getUint8(22);
    let numChars = stream.getUint16LE(23);

    // console.log('charset'+num, bitsPerPixel, height, numChars);
    // console.log(bitsPerPixel, fontHeight, numChars);

    let offset = 4 + 17 + 4;

    let characters = [];

    for (var i = 0; i < numChars; i++) {
      let offs = stream.getUint32LE(offset + i * 4);
      if (offs) {
        let ch = {};
        offs += 21;
        ch.width = stream.getUint8(offs);
        ch.height = stream.getUint8(offs + 1);
        ch.x = stream.getUint8(offs + 2);
        ch.y = stream.getUint8(offs + 3);
        let sz = ((ch.width * ch.height) / 8) * bitsPerPixel;
        if (sz % 2) sz++;
        ch.data = stream.getBytes(offs + 4, sz);
        characters[i] = ch;
        // console.log(i, sz, ch);
      } else {
        characters[i] = null;
        // console.log(i, 'null');
      }
    }

    let charset = new Charset({ numChars: numChars, fontHeight: fontHeight, colorMap: colorMap, bitsPerPixel: bitsPerPixel })
    for (var i = 0; i < characters.length; i++)
      charset.addGlyph(characters[i]);

    // this.charsets[num-1] = charset;
    this.charsets.push(charset);

    // console.log(this.charsets[num-1]);
  }

  parseIndex() {
    // console.log('parseIndex');
    let stream = this.getFileStream(path.join(this.rootPath, this.makeIndexFilename(0)));
    let offset = 0;

    while (offset < stream.size) {
      let blocksize = stream.getUint32LE(offset);
      let blocktype = stream.getUint16LE(offset + 4);
      offset += 6;

      if (blocktype == 0x4e52) { //NR
        // console.log('NR');
        for (let room; room = stream.getUint8(offset++); ) {
          let bytes = stream.getBytes(offset, 9);
          offset += bytes.length;
          let string = '';
          for (var i = 0; i < bytes.length; i++) {
            let b = (bytes[i] ^ 0xFF);
            if (b == 0x0) break;
            string += String.fromCharCode(b);
          }
          this.roomNames[room] = string;
        }
      }
      else if (blocktype == 0x5230) { //R0
        // console.log('R0');
        this.numRooms = stream.getUint16LE(offset);
        offset += 2;
        for (let i = 0; i < this.numRooms; i++) {
          let filenum = stream.getUint8(offset);
          let roomoffs = stream.getUint32LE(offset + 1);
          this.roomFileTable[i] = filenum;
          offset += 5;
      	}
      }
      else if (blocktype == 0x5330) { //S0
        // console.log('S0');
        this.numScripts = stream.getUint16LE(offset);
        offset += 2;
        // stream.skip(blocksize - 8);
        offset += blocksize - 8;
      }
      else if (blocktype == 0x4e30) { //N0
        // console.log('N0');
        this.numSounds = stream.getUint16LE(offset);
        offset += 2;
        // stream.skip(blocksize - 8);
        offset += blocksize - 8;
      }
      else if (blocktype == 0x4330) { //C0
        // console.log('C0');
        this.numCostumes = stream.getUint16LE(offset);
        offset += 2;
        // stream.skip(blocksize - 8);
        offset += blocksize - 8;
      }
      else if (blocktype == 0x4f30) { //O0
        // console.log('O0');
        this.numGlobalObjects = stream.getUint16LE(offset);
        offset += 2;
        // stream.skip(blocksize - 8);
        offset += blocksize - 8;
      } else {
        console.log('??');
        // stream.skip(blocksize - 8);
        offset += blocksize - 8;
      }
    }
  }

  makeResourceFilename(num) {
    return 'disk' + (num.toString().padStart(2, '0')) + '.lec';
  }

  getResourceStream(num) {
    let filename = this.makeResourceFilename(num);

    // if (!this.resources[filename]) {
    //   this.parseResourceFile(filenum);
    // }

    if (this.fileCache[filename]) {
      return this.fileCache[filename]
    }
    let stream = this.getFileStream(path.join(this.rootPath, filename), 0x69);
    this.fileCache[filename] = stream;
    return stream;
  }

  parseResourceFile(num) {
    // console.log('parseResourceFile', num);

    let filename = this.makeResourceFilename(num);
    let stream = this.getResourceStream(num);

    let blocksize, blocktype, offset = 0;

    this.resources[filename] = { };

    // read main block header -- 'LE'
    blocksize = stream.getUint32LE(offset);
    blocktype = stream.getUint16LE(offset + 4);
    // console.log('LE', blocksize, blocktype.toString(16));

    // read room offset table -- 'FO'
    blocksize = stream.getUint32LE(offset + 6);
    blocktype = stream.getUint16LE(offset + 10);
    // console.log('FO', blocktype.toString(16));

    // number of rooms in this file
    let numRooms = stream.getUint8(offset + 12);
    // this.resources[filename].numRooms = numRooms;

    this.resources[filename].numRooms = numRooms;

    offset += 13;

    for (var i = 0; i < numRooms; i++) {
      let roomno = stream.getUint8(offset);
      let offs = stream.getUint32LE(offset + 1);
      // this.resources[filename].offsetTable.push({ roomno: roomno, offset: offs });
      // this.resources[filename].roomOffsets[roomno] = offs;
      this.roomOffsets[roomno] = offs;
      offset += 5;
    }

  }

  getBlockName(value) {
    return String.fromCharCode(value & 0xff) + String.fromCharCode((value >> 8) & 0xff);
  }

  getRoomBitmap(num) {
    // console.log('getRoomBitmap', num);
    let room = this.getRoom(num);
    let block = room.blocks.find(element => { return element.name == 'BM'; });

    if (!block) return; // no image block ?

    let imageChunk;

    let filenum = this.roomFileTable[room.id];
    if (filenum) {
      let stream = this.getResourceStream(filenum);
      imageChunk = stream.getBytes(block.offset + 6, block.size - 6);
    }
    if (imageChunk) {
      let pixels = this.graphics.decodeSmap(imageChunk, room.width, room.height);
      let pixelsRGBA = this.graphics.indexedToRGBA(pixels);
      return pixelsRGBA;
    }
  }

  getRoomObject(roomid, number) {
    let room = this.getRoom(roomid);
    let ob = room.objects.find(element => element.number == number);
    return ob;
  }

  getRoomObjectBitmap(roomid, number) {
    let room = this.getRoom(roomid);
    if (room) {
      let ob = this.getRoomObject(roomid, number);
      if (!ob) return;

      let filenum = this.roomFileTable[room.id];
      let stream = this.getResourceStream(filenum);

      let block = room.blocks.find(element => {
        if (element.name == 'OI') {
          let obn = stream.getUint16LE(element.offset + 6);
          return obn == number;
        }
      });

      if (block) {
        let size = stream.getUint32LE(block.offset);
        // console.log(number, size);
        if (size == 8) return;
        let imageChunk = stream.getBytes(block.offset + 8, size - 8);
        let pixels = this.graphics.decodeSmap(imageChunk, ob.width, ob.height);
        let pixelsRGBA = this.graphics.indexedToRGBA(pixels);
        return pixelsRGBA;
      }
    }
  }

  parseRoomObject(stream, ob) {
    let offset = ob.OBCDoffset;

    ob.bytes = stream.getBytes(offset + 6, 3);

    ob.x_pos = stream.getUint8(offset + 9) * 8;
    ob.y_pos = (stream.getUint8(offset + 10) & 0x7f) * 8;
    ob.parentstate = (stream.getUint8(offset + 10) & 0x80) ? 1 : 0;
    ob.width = stream.getUint8(offset + 11) * 8;
    ob.parent = stream.getUint8(offset + 12);
    ob.walk_x = stream.getUint16LE(offset + 13);
    ob.walk_y = stream.getUint16LE(offset + 15);
    ob.actordir = stream.getUint8(offset + 17) & 7;
    ob.height = stream.getUint8(offset + 17) & 0xf8;
    ob.nameOffset = stream.getUint8(offset + 18);

    // Verb table: offset + 19

    ob.name = '';
    for (var i = 0, offs = ob.OBCDoffset + ob.nameOffset; i < 32; i++) {
      let b = stream.getUint8(offs++);
      if (b == 0x0 || b == '@'.charCodeAt()) break;
      ob.name += String.fromCharCode(b);
    }

  }

  parseRoom(num) {
    // console.log('parseRoom', num);
    let blocksize, blocktype;
    let filenum = this.roomFileTable[num];
    if (!filenum) return;

    let filename = this.makeResourceFilename(filenum);

    if (!this.resources[filename]) {
      this.parseResourceFile(filenum);
    }

    let stream = this.getResourceStream(filenum);
    let offset = this.roomOffsets[num];

    // LF
    blocksize = stream.getUint32LE(offset);
    blocktype = stream.getUint16LE(offset + 4);

    let roomid = stream.getUint16LE(offset + 6);

    let room = {};
    room.id = roomid;
    room.name = this.getRoomName(room.id);
    room.offset = offset + 8;

    // RO
    blocksize = stream.getUint32LE(offset + 8);
    blocktype = stream.getUint16LE(offset + 12);

    let endOffset = offset + 14 + blocksize - 6;

    // HD
    blocksize = stream.getUint32LE(offset + 14);
    blocktype = stream.getUint16LE(offset + 18);

    room.width = stream.getUint16LE(offset + 20);
    room.height = stream.getUint16LE(offset + 22);
    room.numObjects = stream.getUint16LE(offset + 24);

    room.objects = [];

    offset += 26;

    // Parse room sub-blocks

    let blocks = [];

    while (offset < endOffset) {
      blocksize = stream.getUint32LE(offset);
      blocktype = stream.getUint16LE(offset + 4);
      offset += 6;
      blocks.push({ type: blocktype, size: blocksize, name: this.getBlockName(blocktype), offset: offset - 6 });
      offset += blocksize - 6;
    }

    room.blocks = blocks;

    room.OCs = 0;
    room.OIs = 0;

    // Parse room objects

    for (var i = 0; i < room.blocks.length; i++) {
      let block = room.blocks[i];
      let offset = block.offset;
      if (block.name == 'OC') {
        let number = stream.getUint16LE(offset + 6);
        room.objects.push({ number: number, OBCDoffset: offset });
      }
      // if (block.name == 'OC') {
      //   room.OCs++;
      //   let number = stream.getUint16LE(offset + 6);
      //   // let ob = this.getRoomObject(room.id, number); ////room.objects[number];
      //   let ob = room.objects.find(element => { return element.number == number; });
      //   if (ob) {
      //     ob.OBCDoffset = block.offset;
      //   } else {
      //     ob = { number: number, OBCDoffset: offset };
      //     room.objects.push(ob);
      //     // room.objects[number] = ob;
      //   }
      // } else if (block.name == 'OI') {
      //   room.OIs++;
      //   let number = stream.getUint16LE(offset + 6);
      //   // let ob = this.getRoomObject(room.id, number); //room.objects[number];
      //   let ob = room.objects.find(element => { return element.number == number; });
      //   if (ob) {
      //     ob.OBIMoffset = block.offset;
      //   } else {
      //     ob = { number: number, OBIMoffset: offset };
      //     room.objects.push(ob);
      //     // room.objects[number] = ob;
      //   }
      // }
    }

    for (var i = 0; i < room.objects.length; i++) {
      let ob = room.objects[i];
      this.parseRoomObject(stream, room.objects[i]);
    }

    return room;
  }

  getRoomName(num) {
    return this.roomNames[num];
  }

  getRoom(num) {
    // console.log('getRoom', num);
    if (this.rooms[num]) {
      return this.rooms[num];
    }

    let room = this.parseRoom(num);
    this.rooms[num] = room;

    // console.log(room);

    return room;
  }

  getRoomList() {
    let list = [];
    for (var i = 0; i < this.roomFileTable.length; i++) {
      if (this.roomFileTable[i]) {
        list.push(i);
      }
    }
    return list;
  }

}

module.exports = Scumm4;
