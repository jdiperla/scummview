
class Stream {
  constructor(buffer) {
    this.buffer = new Uint8Array(buffer);
    this.offset = 0;
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

  getUint8(enc=0) {
    let uint8 = this.buffer[this.offset]^enc;
    this.offset++;
    return uint8;
  }

  getUint16(enc=0) {
    let uint16 = (this.buffer[this.offset + 1]^enc) << 8 | (this.buffer[this.offset]^enc);
    this.offset += 2;
    return uint16;
  }

  getUint32(enc=0) {
    let uint32 =
      (this.buffer[this.offset + 3]^enc) << 24 |
      (this.buffer[this.offset + 2]^enc) << 16 |
      (this.buffer[this.offset + 1]^enc) << 8 |
      (this.buffer[this.offset]^enc);
    this.offset += 4;
    return uint32;
  }

  atBegin() {
    return this.offset == 0;
  }

  atEnd() {
    return this.offset > this.buffer.length - 1;
  }
}

module.exports = Stream;
