
class Stream {
  constructor(buffer, baseOffset=0) {
    this.buffer = buffer;
    this.baseOffset = baseOffset;
    // this.offset = 0;
  }

  get size() {
    return this.buffer.length;
  }

  // skip(size) {
  //   this.offset += size;
  // }

  // seek(offset) {
  //   this.offset = offset;
  // }

  // reset() {
  //   this.offset = 0;
  // }

  decrypt(enc) {
    for (let i = 0; i < this.buffer.length; i++) {
      this.buffer[i] = this.buffer[i] ^ enc;
    }
  }

  getBytes(offset, size) {
    if (size == undefined)
      return this.buffer.slice(this.baseOffset + offset);
    else
      return this.buffer.slice(this.baseOffset + offset, this.baseOffset + offset + size);
    // if (size == undefined) {
    //   let bytes = this.buffer.slice(this.offset);
    //   this.offset = this.buffer.length;
    //   return bytes;
    // } else {
    //   let bytes = this.buffer.slice(this.offset, this.offset + size);
    //   this.offset += size;
    //   return bytes;
    // }
  }

  getUint8(offset) {
    return this.buffer[this.baseOffset + offset];
    // if (offset == undefined) {
    //   return this.buffer[this.offset++];
    // } else {
    //   return this.buffer[offset];
    // }
  }

  getUint16LE(offset) {
    return this.buffer[this.baseOffset + offset + 1] << 8 | this.buffer[this.baseOffset + offset];

    // if (offset == undefined) {
    //   let uint16 = this.buffer[this.offset + 1] << 8 | this.buffer[this.offset];
    //   this.offset += 2;
    //   return uint16;
    // } else {
    //   return this.buffer[offset + 1] << 8 | this.buffer[offset];
    // }
  }

  getUint32LE(offset) {
    let uint32 = this.buffer[this.baseOffset + offset + 3] << 24 |
      this.buffer[this.baseOffset + offset + 2] << 16 |
      this.buffer[this.baseOffset + offset + 1] << 8 |
      this.buffer[this.baseOffset + offset];

    return uint32;

    // if (offset == undefined) {
    //   let uint32 = this.buffer[this.offset + 3] << 24 | this.buffer[this.offset + 2] << 16 |
    //     this.buffer[this.offset + 1] << 8 | this.buffer[this.offset];
    //   this.offset += 4;
    //   return uint32;
    // } else {
    //   return
    //     this.buffer[offset + 3] << 24 | this.buffer[offset + 2] << 16 |
    //     this.buffer[offset + 1] << 8 | this.buffer[offset];
    // }
  }

  // atBegin() {
  //   return this.offset == 0;
  // }
  //
  // atEnd() {
  //   return this.offset > this.buffer.length - 1;
  // }
}

module.exports = Stream;
