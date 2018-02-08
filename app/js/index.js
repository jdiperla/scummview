var app = {};

var OF_OWNER_ROOM = 0x0F;
var OF_OWNER_MASK = 0x0F;
var OF_STATE_MASK = 0xF0;
var OF_STATE_SHL = 4;

var INDEX_URL = './data/00.lfl';
var CHARSET_URL = './data/99.lfl';

var BASE_PATH = './data/';

var ROOM_PALETTE = [
0x000000, 	0x0000AA, 	0x00AA00, 	0x00AAAA,
0xAA0000, 	0xAA00AA, 	0xAA5500, 	0xAAAAAA,
0x555555, 	0x5555FF, 	0x55FF55, 	0x55FFFF,
0xFF5555, 	0xFF55FF, 	0xFFFF55, 	0xFFFFFF
];


app.init = function() {
  console.log('init');

  window.addEventListener('keydown', app.onKeyDown);

  app._screenPitch = 320;
  app._w = 320;
  app._h = 200;
  app._rect = new Rectangle(0, 0, app._w, app._h);

  app.bitmap = document.createElement('canvas');
  app.bitmap.width = app._w;
  app.bitmap.height = app._h;
  app.bitmap.style.background = '#00FF00';

  document.body.appendChild(app.bitmap);

  app.ctx = app.bitmap.getContext('2d');

  // app.pixels = new Array(app._w * app._h);
  app.pixels = null;
  app.bytes = null;

  app.fileSize = 0;

  app._numGlobalObjects = 0;
  app._numRooms = 0;
  app._numCostumes = 0;
  app._numScripts = 0;
  app._numSounds = 0;

  app._classData = new Array();
  app._objectOwnerTable = new Array();
  app._objectStateTable = new Array();

  app._roomOffsets = null;
  app._resource = new Object();

  app._charsetData = new Uint8Array();
  app._charset = null;
  app._room = null;

  app._objectNum = -1;

  app.files = [];

  app.roomNum = 2;

  app.requestBinary(INDEX_URL, app.readIndex);
  app.requestBinary(CHARSET_URL, app.readCharset);

  app.requestRoom(app.roomNum);
}


app.requestRoom = function(room) {
  var filename = (room < 10 ? "0" + room : "" + room) + '.lfl';
  app.requestBinary(BASE_PATH + filename, app.readRoom);
}


app.requestBinary = function(url, callback) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function(event) {
    var request = event.target;
    if (request.readyState === XMLHttpRequest.DONE) {
      // everything is good, the response is received
      if (request.status === 200) {
        // perfect!
        var arrayBuffer = request.response;
        if (arrayBuffer) {
          app.files[url] = new Uint8Array(arrayBuffer);
          callback(url);
        }
      } else {
        // there was a problem with the request,
        // for example the response may contain a 404 (Not Found)
        // or 500 (Internal Server Error) response code
      }
    } else {
      // still not ready
    }
  };

  request.open('GET', url, true);
  request.responseType = "arraybuffer";
  request.send(null);
}


app.decrypt = function(byteArray)
{
	for (var i = 0; i < byteArray.length; i++) {
		byteArray[i] = byteArray[i] ^ 0xFF;
	}
}


app.readIndex = function() {
  var offset = 0;
  var b;
  var byteArray = app.files[INDEX_URL];

  app.decrypt(byteArray);

  b = byteArray[1] << 8 | byteArray[0];
  console.log(b);

  offset += 2;

  app._numGlobalObjects = byteArray[offset + 1] << 8 | byteArray[offset];

  offset += 2;
  offset += app._numGlobalObjects * 4;

  app._numRooms = byteArray[offset];
  offset += 1;
  offset += app._numRooms * 3;

  app._numCostumes = byteArray[offset];
  offset += 1;
  offset += app._numCostumes * 3;

  app._numScripts = byteArray[offset];
  offset += 1;
  offset += app._numScripts * 3;

  app._numSounds = byteArray[offset];
  offset += 1;

  console.log("Objects: " + app._numGlobalObjects);
  console.log("Rooms: " + app._numRooms);
  console.log("Costumes: " + app._numCostumes);
  console.log("Scripts: " + app._numScripts);
  console.log("Sounds: " + app._numSounds);

  app.readGlobalObjects();

  app._resource["Room"] = new Array(app._numRooms);
  app._resource["Costume"] = new Array(app._numCostumes);
  app._resource["Script"] = new Array(app._numScripts);
  app._resource["Sound"] = new Array(app._numSounds);

  app.readResourceList("Room");
  app.readResourceList("Costume");
  app.readResourceList("Script");
  app.readResourceList("Sound");
}


app.readGlobalObjects = function() {
  var offset = 0;
  var bits;
  var tmp;

  var byteArray = app.files[INDEX_URL];

  offset += 2;

  for (var i = 0; i != app._numGlobalObjects; i++)
  {
    bits = byteArray[offset];
    bits |= byteArray[offset + 1] << 8;
    bits |= byteArray[offset + 2] << 16;
    offset += 3;
    app._classData.push(bits);
    tmp = byteArray[offset];
    offset++;
    app._objectOwnerTable.push(tmp & OF_OWNER_MASK);
    app._objectStateTable.push(tmp >> OF_STATE_SHL);
  }

  for (var i = 0; i < app._classData.length; i++)
  {
    //trace("OBowner: " + _classData[i].toString(2));
  }

}


app.readResourceList = function(type) {
  var offset = 0;
  var num = 0;
  var i = 0;

  var byteArray = app.files[INDEX_URL];

  offset = 4 + app._numGlobalObjects * 4;

  if (type == "Room")
  {
    num = byteArray[offset];
    offset++;
    offset += app._numRooms;
  }
  else if (type == "Costume")
  {
    offset++;
    offset += app._numRooms * 3;
    num = byteArray[offset];
  }
  else if (type == "Script")
  {
    offset++;
    offset += app._numRooms * 3;
    offset++;
    offset += app._numCostumes * 3;
    num = byteArray[offset];
  }
  else if (type == "Sound")
  {
    offset++;
    offset += app._numRooms * 3;
    offset++;
    offset += app._numCostumes * 3;
    offset++;
    offset += app._numScripts * 3;
    num = byteArray[offset];
  }

  for (i = 0; i < num; i++)
  {
    app._resource[type][i] = new Object();

    if (type == "Room")
      app._resource[type][i]["roomno"] = i;
    else
      app._resource[type][i]["roomno"] = byteArray[offset];

    offset++;
  }

  for (i = 0; i < num; i++)
  {
    app._resource[type][i]["offset"] = byteArray[offset + 1] << 8 | byteArray[offset];
    offset += 2;
  }
}


app.readCharset = function() {
  app._charsetData = app.files[CHARSET_URL];
  app._charset = new Charset(app._charsetData);
}


// parameters
// room: integer

app.readRoom = function(url) {
  // var offset = 0;
  // var filename = room < 10 ? "0" + room : "" + room;
  // app.requestBinary(BASE_PATH + filename + '.lfl', callback);

  // var filename = room < 10 ? "0" + room : "" + room;
  // var byteArray = app.files[BASE_PATH + filename + '.lfl'];
  var byteArray = app.files[url];

  for (var i = 0; i < byteArray.length; i++)
  {
    byteArray[i] ^= 0xFF;
  }

  app._room = new Room(byteArray);

  app.pixels = new Array(app._room.width * app._room.height);

  app._rect.x = 0;
  app._rect.y = 0;

  console.log('Room');
  console.log('data size: ' + byteArray.length);
  console.log('objects: ' + app._room.numObjects);
  console.log('image offset: ' + app._room.IM00_offs);
  console.log('width: ' + app._room.width);
  console.log('height: ' + app._room.height);

  app.drawRoom();
}


app.drawRoom = function() {
  var roomData = new Uint8Array(app._room.data.slice(app._room.IM00_offs));
  var imageData = app.ctx.getImageData(0, 0, app._w, app._h);

  // for (var j = 0; j < app._rect.height; j++)
  // {
  //   for (var i = 0; i < app._rect.width; i++)
  //   {
  //     var rgba = imageData.data[(j * app._rect.width + i) * 4] << 24
  //         | imageData.data[(j * app._rect.width + i) * 4 + 1] << 16
  //         | imageData.data[(j * app._rect.width + i) * 4 + 2] << 8
  //         | imageData.data[(j * app._rect.width + i) * 4 + 3];
  //
  //     app.pixels[j * app._rect.width + i] = rgba;
  //   }
  // }

  for (var i = 0; i < app._room.width/8; i++)
  // for (var i = app._rect.x / 8; i < app._w / 8; i++)
  // for (var i = 24; i < 36; i++)
  {
    // app.drawStripEGA(0, 0, app.pixels, app._screenPitch, roomData, app._room.height, i);
    app.drawStripEGA(0, 0, app.pixels, app._room.width, roomData, app._room.height, i);
  }

  // console.log('HOLA', app._rect.width);

  for (var j = 0; j < app._rect.height; j++ )
  {
    for (var i = 0; i < app._rect.width; i++)
    {
      // var rgba = app.pixels[j * app._rect.width + i];
      var rgba = app.pixels[j * app._room.width + (i + app._rect.x)];
      imageData.data[(j * app._rect.width + i) * 4] = (rgba & 0xFF0000) >> 16;
      imageData.data[(j * app._rect.width + i) * 4 + 1] = (rgba & 0xFF00) >> 8;
      imageData.data[(j * app._rect.width + i) * 4 + 2] = (rgba & 0xFF);
      imageData.data[(j * app._rect.width + i) * 4 + 3] = 255;//(rgba & 0xFF);
      // bitmapData.setPixel(i, j, pixels[j * _rect.width + i]);
    }
  }

  // for (var i = 0; i < 32; i++) {
  //   imageData.data[i] = 255;
  // }

  app.ctx.putImageData(imageData, 0, 0);

  // app._room.data.position = 0;
}


app.drawStripEGA = function(dstX, dstY, dst, dstPitch, src, height, strip) {
  var offset = -1;
  var smapLen;
  var srcOffset = 0;

  var _paletteMod = 0;
  var color = 0;
  var run = 0;
  var x = 0;
  var y = 0;
  var z;

  var a = 0;

  smapLen = (src[1] << 8) | src[0];

  if (strip * 2 + 2 < smapLen)
  {
    offset = (src[strip * 2 + 2 + 1] << 8) | src[strip * 2 + 2];
  }

  srcOffset += offset;

  x = strip * 8;

  while (x < (strip + 1) * 8)
  {
    //color = *src++;
    color = src[srcOffset++];

    if (color & 0x80)
    {
      run = color & 0x3f;

      if (color & 0x40)
      {
        //color = * src++;
        color = src[srcOffset++];

        if (run == 0)
        {
          //run = * src++;
          run = src[srcOffset++];
        }
        for (z = 0; z < run; z++)
        {
          //*(dst + y * dstPitch + x) = (z & 1) ? _roomPalette[(color & 0xf) + _paletteMod] : _roomPalette[(color >> 4) + _paletteMod];
          dst[(dstY + y) * dstPitch + x + dstX] = (z & 1) ? ROOM_PALETTE[(color & 0xf) + _paletteMod] : ROOM_PALETTE[(color >> 4) + _paletteMod];

          y++;
          if (y >= height)
          {
            y = 0;
            x++;
          }
        }
      }
      else
      {
        if (run == 0)
        {
          //run = *src++;
          run = src[srcOffset++];
        }

        for (z = 0; z < run; z++)
        {
          //*(dst + y * dstPitch + x) = * (dst + y * dstPitch + x - 1);
          dst[(dstY + y) * dstPitch + x + dstX] = dst[(dstY + y) * dstPitch + x + dstX - 1];

          y++;
          if (y >= height)
          {
            y = 0;
            x++;
          }
        }
      }
    }
    else
    {
      run = color >> 4;
      if (run == 0)
      {
        //run = *src++;
        run = src[srcOffset++];
      }

      for (z = 0; z < run; z++)
      {
        //*(dst + y * dstPitch + x) = _roomPalette[(color & 0xf) + _paletteMod];
        dst[(dstY + y) * dstPitch + x + dstX] = ROOM_PALETTE[(color & 0xf) + _paletteMod];

        y++;

        if (y >= height)
        {
          y = 0;
          x++;
        }
      }
    }
  }
}


app.onKeyDown = function(event)
{
  if (event.key == "ArrowRight") {
    // // -->
    if (app._rect.x + app._rect.width + 8 < app._room.width) {
      app._rect.x += 8 ;
      app.drawRoom();
    }
  } else if (event.key == "ArrowLeft") {
    // <--
    if (app._rect.x >= 8) {
      app._rect.x -= 8;
      app.drawRoom();
    }
  } else if (event.key == "+") {
    // +
    app.roomNum++;
    app.requestRoom(app.roomNum);
  } else if (event.key == "-") {
    // -
    app.roomNum--;
    app.requestRoom(app.roomNum);
  }
}
