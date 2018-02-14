const Rectangle = require('../rectangle');
const Room = require('./room');
const Charset = require('./charset');

const fh = require('../file_helper');
const path = require('path');
const crypto = require('crypto');

var OF_OWNER_ROOM = 0x0F;
var OF_OWNER_MASK = 0x0F;
var OF_STATE_MASK = 0xF0;
var OF_STATE_SHL = 4;

var INDEX_URL = '00.lfl';
var CHARSET_URL = '99.lfl';

var ROOM_PALETTE = [
  0x000000, 	0x0000AA, 	0x00AA00, 	0x00AAAA,
  0xAA0000, 	0xAA00AA, 	0xAA5500, 	0xAAAAAA,
  0x555555, 	0x5555FF, 	0x55FF55, 	0x55FFFF,
  0xFF5555, 	0xFF55FF, 	0xFFFF55, 	0xFFFFFF
];

const GAME_FILE_PATTERNS = {
  'INDY3': [
    '00.LFL', '01.LFL', '02.LFL', '03.LFL', '04.LFL', '06.LFL', '07.LFL',
    '08.LFL', '09.LFL', '12.LFL', '13.LFL', '14.LFL', '15.LFL', '16.LFL',
    '17.LFL', '18.LFL', '19.LFL', '20.LFL', '21.LFL', '22.LFL', '23.LFL',
    '24.LFL', '25.LFL', '26.LFL', '27.LFL', '28.LFL', '29.LFL', '30.LFL',
    '31.LFL', '32.LFL', '33.LFL', '34.LFL', '35.LFL', '36.LFL', '37.LFL',
    '38.LFL', '39.LFL', '40.LFL', '41.LFL', '42.LFL', '43.LFL', '44.LFL',
    '45.LFL', '46.LFL', '47.LFL', '48.LFL', '49.LFL', '50.LFL', '51.LFL',
    '52.LFL', '53.LFL', '54.LFL', '55.LFL', '56.LFL', '57.LFL', '58.LFL',
    '59.LFL', '60.LFL', '61.LFL', '62.LFL', '63.LFL', '64.LFL', '66.LFL',
    '67.LFL', '68.LFL', '69.LFL', '70.LFL', '71.LFL', '72.LFL', '73.LFL',
    '74.LFL', '75.LFL', '76.LFL', '77.LFL', '78.LFL', '79.LFL', '80.LFL',
    '81.LFL', '82.LFL', '83.LFL', '84.LFL', '85.LFL', '86.LFL', '87.LFL',
    '90.LFL', '91.LFL', '92.LFL', '93.LFL', '94.LFL', '98.LFL', '99.LFL'
  ]
};

class Scumm3 {
  constructor(params={}) {
    this.dataPath = params.dataPath;
    this.fileList = params.fileList;

    this._screenPitch = 320;
    this._w = 320;
    this._h = 200;
    this._rect = new Rectangle(0, 0, this._w, this._h);

    this.bytes = null;

    this.fileSize = 0;

    this._numGlobalObjects = 0;
    this._numRooms = 0;
    this._numCostumes = 0;
    this._numScripts = 0;
    this._numSounds = 0;

    this._classData = new Array();
    this._objectOwnerTable = new Array();
    this._objectStateTable = new Array();

    this._roomOffsets = null;
    this._resource = [];

    this._charsetData = new Uint8Array();
    this._charset = null;
    this._room = null;

    this._objectNum = -1;

    this.files = [];
  }

  static detect(filepath) {
    return fh.exists(path.join(filepath, INDEX_URL));
  }

  load(callback) {
    this.requestFile(INDEX_URL, (data) => {
      let result = this.readIndex(data);
      callback(result);
    });
  }

  requestFile(filename, callback) {
    let filepath = path.join(app.getPath(), filename);
    fh.readFile(filepath, (data) => {
      // this.files[path] = data;
      if (callback) callback(data);
    });
  }

  decrypt(byteArray)
  {
  	for (var i = 0; i < byteArray.length; i++) {
  		byteArray[i] = byteArray[i] ^ 0xFF;
  	}
  }

  readIndex(data) {
    this.files[INDEX_URL] = data;

    var offset = 0;
    var b;
    var byteArray = this.files[INDEX_URL];

    this.decrypt(byteArray);

    let magic = byteArray[1] << 8 | byteArray[0];

    console.log('magic', magic.toString(16));
    if (magic !== 0x100) return false;

    offset += 2;

    this._numGlobalObjects = byteArray[offset + 1] << 8 | byteArray[offset];

    offset += 2;
    offset += this._numGlobalObjects * 4;

    this._numRooms = byteArray[offset];
    offset += 1;
    offset += this._numRooms * 3;

    this._numCostumes = byteArray[offset];
    offset += 1;
    offset += this._numCostumes * 3;

    this._numScripts = byteArray[offset];
    offset += 1;
    offset += this._numScripts * 3;

    this._numSounds = byteArray[offset];
    offset += 1;

    // console.log("Objects: " + this._numGlobalObjects);
    // console.log("Rooms: " + this._numRooms);
    // console.log("Costumes: " + this._numCostumes);
    // console.log("Scripts: " + this._numScripts);
    // console.log("Sounds: " + this._numSounds);

    this.readGlobalObjects();

    this._resource["Room"] = this._numRooms ? new Array(this._numRooms) : [];
    this._resource["Costume"] = this._numCostumes ? new Array(this._numCostumes) : [];
    this._resource["Script"] = this._numScripts ? new Array(this._numScripts) : [];
    this._resource["Sound"] = this._numSounds ? new Array(this._numSounds) : [];

    if (this._numRooms) this.readResourceList("Room");
    // if (this._numCostumes) this.readResourceList("Costume");
    // if (this._numScripts) this.readResourceList("Script");
    // if (this._numSounds) this.readResourceList("Sound");

    return true;
  }

  readGlobalObjects() {
    var offset = 0;
    var bits;
    var tmp;

    var byteArray = this.files[INDEX_URL];

    offset += 2;

    for (var i = 0; i != this._numGlobalObjects; i++) {
      bits = byteArray[offset];
      bits |= byteArray[offset + 1] << 8;
      bits |= byteArray[offset + 2] << 16;
      offset += 3;
      this._classData.push(bits);
      tmp = byteArray[offset];
      offset++;
      this._objectOwnerTable.push(tmp & OF_OWNER_MASK);
      this._objectStateTable.push(tmp >> OF_STATE_SHL);
    }

    for (var i = 0; i < this._classData.length; i++) {
      //trace("OBowner: " + _classData[i].toString(2));
    }
  }

  readResourceList(type) {
    var offset = 0;
    var num = 0;
    var i = 0;

    var byteArray = this.files[INDEX_URL];

    offset = 4 + this._numGlobalObjects * 4;

    if (type == "Room") {
      num = byteArray[offset];
      offset++;
      offset += this._numRooms;
    }
    else if (type == "Costume") {
      offset++;
      offset += this._numRooms * 3;
      num = byteArray[offset];
    }
    else if (type == "Script") {
      offset++;
      offset += this._numRooms * 3;
      offset++;
      offset += this._numCostumes * 3;
      num = byteArray[offset];
    }
    else if (type == "Sound") {
      offset++;
      offset += this._numRooms * 3;
      offset++;
      offset += this._numCostumes * 3;
      offset++;
      offset += this._numScripts * 3;
      num = byteArray[offset];
    }
    // console.log('num', num);

    for (i = 0; i < num; i++) {
      this._resource[type][i] = {};

      if (type == "Room")
        this._resource[type][i]["roomno"] = i;
      else
        this._resource[type][i]["roomno"] = byteArray[offset];

      offset++;
    }

    for (i = 0; i < num; i++) {
      let roomOffset = byteArray[offset + 1] << 8 | byteArray[offset];
      this._resource[type][i].offset = roomOffset;
      if (this._resource[type][i].offset == 0xFFFF) {
        // console.log(i, 'invalid');
      } else {
        // console.log(i, roomOffset);
      }
      offset += 2;
    }
  }

  readCharset(data) {
    this.files[CHARSET_URL] = data;
    this._charsetData = this.files[CHARSET_URL];
    this._charset = new Charset(this._charsetData);
  }

  readRoom(roomNo, callback) {
    let pixels;
    // var filename = (roomNum < 10 ? "0" + roomNum : "" + roomNum) + '.lfl';
    let filename = (roomNo + '.lfl').padStart(6, '0');

    this.requestFile(filename, (data) => {
      var byteArray = data;

      this.decrypt(byteArray);
      // for (var i = 0; i < byteArray.length; i++) {
      //   byteArray[i] ^= 0xFF;
      // }

      let room = new Room(byteArray);

      callback(room);
    });
  }

  getRoomImage(roomNo, callback) {
    this.readRoom(roomNo, (room) => {
      console.log(room);
      let pixels = new Array(room.width * room.height);
      let roomData = new Uint8Array(room.data.slice(room.IM00_offs));
      let pixelData = new Uint8Array(room.width * room.height * 4);

      for (var i = 0; i < room.width/8; i++) {
        this.drawStripEGA(0, 0, pixels, room.width, roomData, room.height, i);
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
      callback(pixelData, room.width, room.height);
    });
  }

  drawStripEGA(dstX, dstY, dst, dstPitch, src, height, strip) {
    var offset = -1;
    var smapLen;
    var srcOffset = 0;

    var _paletteMod = 0;
    var color = 0;
    var run = 0;
    var x = 0;
    var y = 0;
    var z;

    var a = 0;

    smapLen = (src[1] << 8) | src[0];

    if (strip * 2 + 2 < smapLen) {
      offset = (src[strip * 2 + 2 + 1] << 8) | src[strip * 2 + 2];
    }

    srcOffset += offset;
    x = strip * 8;

    while (x < (strip + 1) * 8) {
      color = src[srcOffset++];

      if (color & 0x80) {
        run = color & 0x3f;

        if (color & 0x40) {
          color = src[srcOffset++];

          if (run == 0) {
            run = src[srcOffset++];
          }
          for (z = 0; z < run; z++) {
            dst[(dstY + y) * dstPitch + x + dstX] = (z & 1) ? ROOM_PALETTE[(color & 0xf) + _paletteMod] : ROOM_PALETTE[(color >> 4) + _paletteMod];

            y++;
            if (y >= height) {
              y = 0;
              x++;
            }
          }
        } else {
          if (run == 0) {
            run = src[srcOffset++];
          }

          for (z = 0; z < run; z++) {
            dst[(dstY + y) * dstPitch + x + dstX] = dst[(dstY + y) * dstPitch + x + dstX - 1];
            y++;
            if (y >= height) {
              y = 0;
              x++;
            }
          }
        }
      } else {
        run = color >> 4;
        if (run == 0) {
          run = src[srcOffset++];
        }

        for (z = 0; z < run; z++) {
          dst[(dstY + y) * dstPitch + x + dstX] = ROOM_PALETTE[(color & 0xf) + _paletteMod];
          y++;
          if (y >= height) {
            y = 0;
            x++;
          }
        }
      }
      if (srcOffset > src.length) break;
    }
  }
}

module.exports = Scumm3;
