
class Stream {
  constructor(buffer) {
    // this.buffer = new Uint8Array(buffer);
    this.buffer = buffer;
    this.offset = 0;
  }

  get size() {
    return this.buffer.length;
  }

  skip(size) {
    this.offset += size;
  }

  seek(offset) {
    this.offset = offset;
  }

  reset() {
    this.offset = 0;
  }

  getBytes(size) {
    if (size == undefined) {
      let bytes = this.buffer.slice(this.offset);
      this.offset = this.buffer.length;
      return bytes;
    } else {
      let bytes = this.buffer.slice(this.offset, this.offset + size);
      this.offset += size;
      return bytes;
    }
  }

  getUint8(offset) {
    if (offset == undefined) {
      return this.buffer[this.offset++];
    } else {
      return this.buffer[offset];
    }
  }

  getUint16(offset) {
    if (offset == undefined) {
      let uint16 = this.buffer[this.offset + 1] << 8 | this.buffer[this.offset];
      this.offset += 2;
      return uint16;
    } else {
      return this.buffer[offset + 1] << 8 | this.buffer[offset];
    }
  }

  getUint32(offset) {
    if (offset == undefined) {
      let uint32 = this.buffer[this.offset + 3] << 24 | this.buffer[this.offset + 2] << 16 |
        this.buffer[this.offset + 1] << 8 | this.buffer[this.offset];
      this.offset += 4;
      return uint32;
    } else {
      return
        this.buffer[offset + 3] << 24 | this.buffer[offset + 2] << 16 |
        this.buffer[offset + 1] << 8 | this.buffer[offset];
    }
  }

  atBegin() {
    return this.offset == 0;
  }

  atEnd() {
    return this.offset > this.buffer.length - 1;
  }
}

module.exports = Stream;
