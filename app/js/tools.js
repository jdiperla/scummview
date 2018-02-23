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

  static createImageFromBuffer(src, width, height) {
    if (src && width > 0 && height > 0) {
      let canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      let ctx = canvas.getContext('2d');
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < imageData.data.length; i++) {
        imageData.data[i] = src[i];
      }
      ctx.putImageData(imageData, 0, 0);

      let image = new Image();
      image.src = canvas.toDataURL();

      return image;
    }
  }

  static createCanvasFromBuffer(src, width, height) {
    if (src) {
      if (width > 0 && height > 0) {
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < imageData.data.length; i++) {
          imageData.data[i] = src[i];
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas;
      }
    }
  }


}


module.exports = Tools;
