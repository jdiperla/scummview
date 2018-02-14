const LocalObject = require('./local_object');

class Room {
  constructor(data) {
    this.data = data;

    var offset = 0;
    var objOffset = 0;
    var obj = null;
    var defaultPtr = 0;

    this.width = (this.data[5] << 8) | this.data[4];
    this.height = (this.data[7] << 8) | this.data[6];
    this.numObjects = this.data[20];
    this.IM00_offs = (this.data[11] << 8) | this.data[10];

    this.localObjects = new Array();

    offset = 29;

    defaultPtr = this.data[28 + 2 * this.numObjects];

    for (var i = 0; i < this.numObjects; i++)
    {
      obj = new LocalObject();

      obj.OBIMoffset = (this.data[offset + 1] << 8) | this.data[offset];
      obj.OBCDoffset = (this.data[(offset + 2 * this.numObjects) + 1] << 8) | this.data[offset + 2 * this.numObjects];

      objOffset = obj.OBCDoffset - 2;

      obj.objNumber = (this.data[objOffset + 7] << 8) | this.data[objOffset + 6];

      obj.xPos = this.data[objOffset + 9] * 8;
      obj.yPos = (this.data[objOffset + 10] & 0x7F) * 8;

      obj.parentState = (this.data[objOffset + 10] & 0x80) ? 1 : 0;

      obj.width = this.data[objOffset + 11] * 8;

      obj.parent = this.data[objOffset + 12];

      obj.walkX = (this.data[objOffset + 14] << 8) | this.data[objOffset + 13];
      obj.walkY = (this.data[objOffset + 16] << 8) | this.data[objOffset + 15];
      obj.actorDir = this.data[objOffset + 17] & 7;

      obj.height = this.data[objOffset + 17] & 0xF8;

      obj.smapLen = (this.data[obj.OBIMoffset + 1] << 8) | this.data[obj.OBIMoffset];

      offset += 2;

      this.localObjects.push(obj);
    }
  }

}

module.exports = Room;
