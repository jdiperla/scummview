const crypto = require('crypto');

class Tools {

  static decrypt(data, enc) {
    let buffer = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      buffer[i] = data[i] ^ enc;
    }
    return buffer;
  }

  static checksum(str, algorithm, encoding) {
    return crypto
      .createHash(algorithm || 'md5')
      .update(str, 'utf8')
      .digest(encoding || 'hex')
  }

}


module.exports = Tools;
