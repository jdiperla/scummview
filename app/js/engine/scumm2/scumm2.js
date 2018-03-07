const path = require('path');
const fs = require('fs');

const Tools = require('../../tools');
const Stream = require('../../stream');
const Detector = require('../../detector');
const Graphics = require('../../graphics');
const Scumm = require('../scumm');
const Room = require('./room');

// const Charset = require('./charset');

const OF_OWNER_MASK = 0x0F;
const OF_STATE_MASK = 0xF0;
const OF_STATE_SHL = 4;


class Scumm2 extends Scumm {
  constructor(detector) {
    super(detector);
    this.graphics = new Graphics();
    this.detect();
  }

  detect() {
    this.parseIndex();
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
        this.title = this.info.title;
        // this.title = info.title;
        // this.id = info.id;
        // this.version = info.version;
        // console.log(this.title);
      }
    }
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

    this.magic = stream.getUint16LE(0); // Magic number

    console.log('0x' + this.magic.toString(16));

    this.objectOwnerTable = [];
    this.objectStateTable = [];

    let offset = 2;

    this.numGlobalObjects = stream.getUint16LE(offset);
    offset += 2;

    for (let i = 0; i < this.numGlobalObjects; i++) {
  		let tmp = stream.getUint8(offset++);
  		this.objectOwnerTable[i] = tmp & OF_OWNER_MASK;
  		this.objectStateTable[i] = tmp >> OF_STATE_SHL;
  	}

    this.numRooms = stream.getUint8(offset);
    offset += this.numRooms * 3 + 1; // skip room nos and offsets

    this.numCostumes = stream.getUint8(offset);
    offset += this.numCostumes * 3 + 1; // skip room nos and offsets

    this.numScripts = stream.getUint8(offset);
    offset += this.numScripts * 3 + 1; // skip room nos and offsets

    this.numSounds = stream.getUint8(offset);

    // console.log(this.numGlobalObjects, this.numRooms, this.numCostumes);
  }

  resourceFilename(num) {
    return num.toString().padStart(2, '0') + '.lfl';
  }

  getRoomBitmap(roomid) {
    let room = this.getRoom(roomid);
    let stream = this.getResourceStream(this.resourceFilename(room.id));
    if (!stream) return;

    if (room.IM00_offset > stream.size) return;

    let hasImage = (room.width > 0 && room.height > 0);

    if (hasImage) {
      // console.log('getRoomBitmap', room.IM00_offset);
      let bytes = stream.getBytes(room.IM00_offset);
      try {
        let pixels = this.decodeBitmap(bytes, room.width, room.height);
        if (pixels) {
          let pixelsRGBA = this.graphics.indexedToRGBA(pixels);
          return pixelsRGBA;
        }
      } catch (err) {
        console.log(err.message);
      }
    }
  }

  getResourceStream(filename) {
    // console.log('getResourceStream', filename);
    let buffer;
    if (this.filecache[filename]) {
      // console.log('cached');
      buffer = this.filecache[filename];
    } else {
      try {
        buffer = fs.readFileSync(path.join(this.rootPath, filename));
      } catch (err) {
        console.log(err.message);
        return;
      }
      buffer = Tools.decrypt(buffer, 0xFF);
      this.filecache[filename] = buffer;
    }
    return new Stream(buffer);
  }


  decodeBitmap(ptr, width, height) {
  	//
  	// Since V3, all graphics data was encoded in strips, which is very efficient
  	// for redrawing only parts of the screen. However, V2 is different: here
  	// the whole graphics are encoded as one big chunk. That makes it rather
  	// difficult to draw only parts of a room/object. We handle the V2 graphics
  	// differently from all other (newer) graphic formats for this reason.
  	//
  	// StripTable *table = (_objectMode ? 0 : _roomStrips);
    let stripnr = 0;
    let numstrip = width / 8;
  	let left = (stripnr * 8);
  	let right = left + (numstrip * 8);
  	let dst = new Uint8Array(width * height);
  	let mask_ptr;
  	let src;
  	let color, data = 0;
  	let run;
  	let dither = false;
  	let ptr_dither_table;
  	let theX, theY, maxX;

    let pitch = width;
    // _vertStripNextInc = height * vs->pitch - 1 * vs->format.bytesPerPixel;
    let _vertStripNextInc = height * pitch - 1;

  	// memset(dither_table, 0, sizeof(dither_table));
    let dither_table = new Array(128);
    dither_table.fill(0);

  	// if (vs->hasTwoBuffers)
  	// 	dst = vs->backBuf + y * vs->pitch + x * 8;
  	// else
  	// 	dst = (byte *)vs->getBasePtr(x * 8, y);
    //
  	// mask_ptr = getMaskBuffer(x, y, 1);

    let srcoffset = 0;
    let dstoffset = 0;
    let ditheroffset = 0;

  	// if (table) {
  	// 	run = table.run[stripnr];
  	// 	color = table.color[stripnr];
    //   src = ptr;
  	// 	srcoffset = table.offsets[stripnr];
  	// 	theX = left;
  	// 	maxX = right;
  	// } else {
  		run = 1;
  		color = 0;
  		src = ptr;
  		theX = 0;
  		maxX = width;
  	// }

  	// Decode and draw the image data.
  	// assert(height <= 128);
  	for (; theX < maxX; theX++) {
  		// ptr_dither_table = dither_table;
      ditheroffset = 0;

  		for (theY = 0; theY < height; theY++) {
  			if (--run == 0) {
  				// data = *src++;
          data = src[srcoffset++];
  				if (data & 0x80) {
  					run = data & 0x7f;
  					dither = true;
  				} else {
  					run = data >> 4;
  					dither = false;
  				}
  				// color = _roomPalette[data & 0x0f];
          color = data & 0x0f;
  				if (run == 0) {
  					// run = *src++;
            run = src[srcoffset++];
  				}
  			}
  			if (!dither) {
  				// *ptr_dither_table = color;
          dither_table[ditheroffset] = color;
  			}
  			if (left <= theX && theX < right) {
  				// *dst = *ptr_dither_table++;
          dst[dstoffset] = dither_table[ditheroffset++];
  				// dst += vs->pitch;
          dstoffset += pitch;
  			}
  		}
  		if (left <= theX && theX < right) {
  			// dst -= _vertStripNextInc;
        dstoffset -= _vertStripNextInc;
  		}
  	}

    // console.log('decodeBitmap', srcoffset);


  	// // Draw mask (zplane) data
  	// theY = 0;
    //
  	// if (table) {
  	// 	src = ptr + table->zoffsets[stripnr];
  	// 	run = table->zrun[stripnr];
  	// 	theX = left;
  	// } else {
  	// 	run = *src++;
  	// 	theX = 0;
  	// }
  	// while (theX < right) {
  	// 	const byte runFlag = run & 0x80;
  	// 	if (runFlag) {
  	// 		run &= 0x7f;
  	// 		data = *src++;
  	// 	}
  	// 	do {
  	// 		if (!runFlag)
  	// 			data = *src++;
    //
  	// 		if (left <= theX) {
  	// 			*mask_ptr = data;
  	// 			mask_ptr += _numStrips;
  	// 		}
  	// 		theY++;
  	// 		if (theY >= height) {
  	// 			if (left <= theX) {
  	// 				mask_ptr -= _numStrips * height - 1;
  	// 			}
  	// 			theY = 0;
  	// 			theX += 8;
  	// 			if (theX >= right)
  	// 				break;
  	// 		}
  	// 	} while (--run);
  	// 	run = *src++;
  	// }

    return dst;
  }

  getRoom(num) {
    if (this.rooms[num])
      return this.rooms[num];

    let filename = this.resourceFilename(num);
    let stream = this.getResourceStream(filename);
    if (!stream) return;

    let width = stream.getUint16LE(4);
    let height = stream.getUint16LE(6);
    let IM00_offset = stream.getUint16LE(10);
    let numObjects = stream.getUint8(20);
    let numSounds = stream.getUint8(22);
		let numScripts = stream.getUint8(23);

    // let ptr = stream.getBytes(IM00_offset);
    // let pixels = this.prepareDrawBitmap(ptr, width, height);
    // let pixelsRGBA = this.graphics.indexedToRGBA(pixels);
    // let canvas =  Tools.createCanvasFromBuffer(pixelsRGBA, width, height);

    // let overlay = document.querySelector('#overlay');
    // overlay.appendChild(canvas);
    // console.log('Room', num, width, height, numObjects, IM00_offset);

    let room = new Room({
        id: num,
        width: width,
        height: height,
        IM00_offset: IM00_offset,
        numObjects: numObjects,
        numSounds: numSounds,
        numScripts: numScripts
      });

    this.rooms[num] = room;

    return room;
  }

  getRoomList() {
    try {
      let files = fs.readdirSync(this.rootPath);
      // console.log(files);
      files = files.filter(element => {
        let name = element.toLowerCase();
        return (path.extname(name) == '.lfl' && name !== '00.lfl' && name !== '99.lfl');
      });
      let numbers = [];
      for (var i = 0; i < files.length; i++) {
        let number = parseInt(files[i].substring(0, 2));
        if (!isNaN(number))
          numbers.push(number);
      }
      return numbers;
    } catch (err) {
      console.log(err.message);
    }
    // return [];
  }


}

module.exports = Scumm2;
