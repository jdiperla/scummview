

class Room {
  constructor(params={}) {
    this.id = params.id;
    this.width = params.width;
    this.height = params.height;
    this.IM00_offset = params.IM00_offset;
    this.numObjects = params.numObjects;
    this.numSounds = params.numSounds;
    this.numScripts = params.numScripts;
  }

}

module.exports = Room;
