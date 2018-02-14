
class LocalObject {
  constructor() {
    this.xPos = 0
    this.yPos = 0;
    this.width = 0
    this.height = 0;
    this.objNumber = 0;
    this.parentState = 0;
    this.parent = 0;
    this.walkX = 0
    this.walkY = 0;
    this.actorDir = 0;
    this.OBIMoffset = 0;
    this.OBCDoffset = 0;
    this.smapLen = 0;
  }
}

module.exports = LocalObject;
