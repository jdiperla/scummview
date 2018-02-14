
function Charset(byteArray) {
  this.numChars = 0;
  this.fontHeight = 0;
  this.widthTable = new Array();

  var offset = 0;
  var tmp = 0;

  this.numChars = byteArray[4];
  this.fontHeight = byteArray[5];
  offset = 6;

  this.data = new Uint8Array(this.numChars*8);

  for (var i = 0; i < this.numChars; i++)
  {
    this.widthTable.push(byteArray[offset]);
    offset++;
  }

  for (var j = 0; j < this.numChars*8; j++)
  {
    // data.writeByte(byteArray[offset]);
    // this.data.push(byteArray[offset]);
    this.data[j] = byteArray[offset];

    offset++;
  }

}