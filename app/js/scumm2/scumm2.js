const path = require('path');
const fs = require('fs');

const Tools = require('../tools');
const Stream = require('../stream');
const Detector = require('../detector');
const Graphics = require('../graphics');
const Game = require('../game');
// const Charset = require('./charset');

const OF_OWNER_MASK = 0x0F;
const OF_STATE_MASK = 0xF0;
const OF_STATE_SHL = 4;


class Scumm2 extends Game {
  constructor(detector) {
    super(detector);
    this.filecache = [];
    this.graphics = new Graphics();
    this.detect();
  }

  detect() {
    this.parseIndex();

    this.getRoom(1);

    // this.parseCharset();
    //
    // let room = this.getRoom(1);
    // if (room) {
    //   let pixelsRGBA = this.getRoomBitmap(room.id);
    //
    //   // We hash the decoded image data from room 1 and compare that
    //   // against known hash values to identify the game
    //   let hash = Tools.checksum(pixelsRGBA);
    //
    //   let info = Detector.gameInfoFromHash(hash);
    //   if (info) {
    //     this.name = info.name;
    //     this.id = info.id;
    //     this.version = info.version;
    //   }
    // }
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

    console.log(this.numGlobalObjects, this.numRooms, this.numCostumes);
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
        console.log(err.message);
      }
    }
  }

  getResourceStream(filename) {
    let buffer;
    if (this.filecache[filename]) {
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


  prepareDrawBitmap(ptr, vs, x, y, width, height, stripnr, numstrip, table) {
  	//
  	// Since V3, all graphics data was encoded in strips, which is very efficient
  	// for redrawing only parts of the screen. However, V2 is different: here
  	// the whole graphics are encoded as one big chunk. That makes it rather
  	// difficult to draw only parts of a room/object. We handle the V2 graphics
  	// differently from all other (newer) graphic formats for this reason.
  	//
  	// StripTable *table = (_objectMode ? 0 : _roomStrips);
  	let left = (stripnr * 8);
  	let right = left + (numstrip * 8);
  	let dst;
  	let mask_ptr;
  	let src;
  	let color, data = 0;
  	let run;
  	let dither = false;
  	let dither_table[128];
  	let ptr_dither_table;
  	let theX, theY, maxX;

    let pitch = 320;
    // _vertStripNextInc = height * vs->pitch - 1 * vs->format.bytesPerPixel;
    let _vertStripNextInc = height * pitch - 1;

  	// memset(dither_table, 0, sizeof(dither_table));
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


  	if (table) {
  		run = table.run[stripnr];
  		color = table.color[stripnr];
      src = ptr;
  		srcoffset = table.offsets[stripnr];
  		theX = left;
  		maxX = right;
  	} else {
  		run = 1;
  		color = 0;
  		src = ptr;
  		theX = 0;
  		maxX = width;
  	}

  	// Decode and draw the image data.
  	// assert(height <= 128);
  	for (; theX < maxX; theX++) {
  		ptr_dither_table = dither_table;
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
          ptr_dither_table[ditheroffset] = color;
  			}
  			if (left <= theX && theX < right) {
  				// *dst = *ptr_dither_table++;
          dst[dstoffset] = ptr_dither_table[ditheroffset++];
  				// dst += vs->pitch;
          dstoffset += pitch;
  			}
  		}
  		if (left <= theX && theX < right) {
  			dst -= _vertStripNextInc;
  		}
  	}


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
  }

  generateStripTable(src, width, height) {
    // struct StripTable {
    // 	int offsets[160];
    // 	int run[160];
    // 	int color[160];
    // 	int zoffsets[120];	// FIXME: Why only 120 here?
    // 	int zrun[120];		// FIXME: Why only 120 here?
    // };

    let table = {
      offsets: [],
      run: [],
      color: [],
      zoffsets: [],
      zrun: [],
    };

  	// If no strip table was given to use, allocate a new one
  	// if (table == 0)
  	// 	table = (StripTable *)calloc(1, sizeof(StripTable));

  	// const byte *bitmapStart = src;
  	// byte color = 0, data = 0;
  	// int x, y, length = 0;
  	// byte run = 1;
    let bitmapStart = 0;
  	let color = 0, data = 0;
  	let x, y, length = 0;
  	let run = 1;

    let offset = 0;

  	// Decode the graphics strips, and memorize the run/color values
  	// as well as the byte offset.
  	for (x = 0; x < width; x++) {

  		if ((x % 8) == 0) {
  			// assert(x / 8 < 160);
  			table.run[x / 8] = run;
  			table.color[x / 8] = color;
  			// table.offsets[x / 8] = src - bitmapStart;
        table.offsets[x / 8] = offset - bitmapStart;
  		}

  		for (y = 0; y < height; y++) {
  			if (--run == 0) {
  				// data = *src++;
          data = src[offset++];
  				if (data & 0x80) {
  					run = data & 0x7f;
  				} else {
  					run = data >> 4;
  				}
  				if (run == 0) {
  					// run = *src++;
            run = src[offset++];
  				}
  				color = data & 0x0f;
  			}
  		}
  	}

  	// // The mask data follows immediately after the graphics.
  	// x = 0;
  	// y = height;
  	// width /= 8;
    //
  	// for (;;) {
  	// 	// length = *src++;
    //   length = src[offset++];
  	// 	// const byte runFlag = length & 0x80;
    //   let runFlag = length & 0x80;
  	// 	if (runFlag) {
  	// 		length &= 0x7f;
  	// 		// data = *src++;
    //     data = src[offset++];
  	// 	}
  	// 	do {
  	// 		if (!runFlag)
  	// 			// data = *src++;
    //       data = src[offset++];
    //
  	// 		if (y == height) {
  	// 			// assert(x < 120);
  	// 			// table.zoffsets[x] = src - bitmapStart - 1;
    //       table.zoffsets[x] = offset - bitmapStart - 1;
  	// 			table.zrun[x] = length | runFlag;
  	// 		}
  	// 		if (--y == 0) {
  	// 			if (--width == 0)
  	// 				return table;
  	// 			x++;
  	// 			y = height;
  	// 		}
  	// 	} while (--length);
  	// }

  	return table;
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

    console.log('Room', num, width, height, numObjects);

    let room = new Room({
        width: width,
        height: height,
        IM00_offset: IM00_offset,
        numObjects: numObjects,
        numSounds: numSounds,
        numScripts: numScripts
      });


  }

  getRoomList() {
    // try {
    //   let files = fs.readdirSync(this.rootPath);
    //   files = files.filter(element => {
    //     let name = element.toLowerCase();
    //     return (path.extname(name) == '.lfl' && name !== '00.lfl' && name !== '99.lfl');
    //   });
    //
    //   let numbers = [];
    //   for (var i = 0; i < files.length; i++) {
    //     numbers[i] = parseInt(files[i].substring(0, 2));
    //   }
    //
    //   return numbers;
    // } catch (err) {
    //
    // }
    return [];
  }


}

module.exports = Scumm2;
