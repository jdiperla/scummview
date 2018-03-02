

class Room {
  constructor(params={}) {
    this.id = params.id;
    room.width = params.width;
    room.height = params.height;
    room.IM00_offset = params.IM00_offset;
    room.numObjects = params.numObjects;
    room.numSounds = params.numSounds;
    room.numScripts = params.numScripts;
  }

}

module.exports = Room;
