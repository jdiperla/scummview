
const Rectangle = require('./rectangle');
const Detector = require('./detector');
const Tools = require('./tools');
const Scumm2 = require('./engine/scumm2/scumm2');
const Scumm3 = require('./engine/scumm3/scumm3');
const Scumm4 = require('./engine/scumm4/scumm4');

const html = require('./ui/html');
const Component = require('./ui/component');
const Pane = require('./ui/pane');
const Panel = require('./ui/panel');

const Sidebar = require('./ui/sidebar');
const Game = require('./ui/game');
const Rooms = require('./ui/rooms');
const Charsets = require('./ui/charsets');

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let app = {};
let game;
let rooms = [];
let roomid = 0;
let ui = {};

// let thumbWidth = 64;
// let thumbHeight = 40;

let thumbWidth = 128;
let thumbHeight = 80;

function createThumbnailFromCanvas(image) {
  let canvas = document.createElement('canvas');
  if (image) {
    let ratio = (thumbWidth / image.width);
    let width = thumbWidth;
    let height = thumbHeight * ratio * (image.height / thumbHeight)

    canvas.width = thumbWidth;
    canvas.height = height;

    let ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'medium';
    ctx.drawImage(image, 0, 0, canvas.width, height);

  } else {
    canvas.width = thumbWidth;
    canvas.height = thumbHeight;
  }

  return canvas;
}

function showRoomDetail(id) {
  // roomid = id;
  let room = game.getRoom(id);
  let objects = [];

  if (room.objects) {
    for (var i = 0; i < room.objects.length; i++) {
      let ob = room.objects[i];
      let image = Tools.createCanvasFromBuffer(game.getRoomObjectBitmap(id, ob.number), ob.width, ob.height);
      objects.push({
        number: ob.number,
        x_pos: ob.x_pos,
        y_pos: ob.y_pos,
        width: ob.width,
        height: ob.height,
        name: ob.name,
        parent: ob.parent,
        parentstate: ob.parentstate,
        bytes: ob.bytes,
        image: image,
      });
    }
  }

  let model = {
    id: room.id,
    name: room.name,
    width: room.width,
    height: room.height,
    image: Tools.createCanvasFromBuffer(game.getRoomBitmap(id), room.width, room.height),
    objects: objects
  }

  ui.rooms.updateDetail(model);
  // ui.rooms.adjust();
}

function showPanel(id) {
  if (id == 'game') {
    // console.log('info');
    ui.content.clear();
    ui.content.add(ui.game);
    ui.sidebar.setActive('game');
  }
  else if (id == 'rooms') {
    // console.log('rooms');
    ui.content.clear();
    ui.content.add(ui.rooms);
  }
  else if (id == 'charsets') {
    // console.log('charsets');
    ui.content.clear();
    ui.content.add(ui.charsets);
  }
}

function updateRoomList(roomids) {
  // console.log('updateRoomList');
  rooms = [];

  let items = [];

  for (var i = 0; i < roomids.length; i++) {
    let room = game.getRoom(roomids[i]);
    // console.log(room);
    // let canvas = Tools.createCanvasFromBuffer(game.getRoomBitmap(room.id), room.width, room.height);
    // let thumbnail = createThumbnailFromCanvas(canvas);
    let thumbnail = createThumbnailFromCanvas(null);

    let item = {
      id: room.id,
      description: room.id,
      width: room.width,
      height: room.height,
      image: thumbnail
    };

    items.push(item);

    setTimeout(() => {
      let bitmap = game.getRoomBitmap(room.id);
      let canvas = Tools.createCanvasFromBuffer(bitmap, room.width, room.height);
      let thumbnail = createThumbnailFromCanvas(canvas);
      ui.rooms.updateListItem({ id: room.id, description: room.id, image: thumbnail });
    }, Math.random() * 100 + 50);
  }

  let model = {
    list: { items: items }
  };

  // ui.rooms.update(model);

  ui.rooms.updateList({ items: items });

  // ui.roomList.update({ items: items });
}

function updateElements() {
  let roomids = game.getRoomList();

  // console.log(roomids);

  updateRoomList(roomids);

  // let dropEl = document.querySelector('#drop');
  // if (dropEl)
  //   dropEl.style.visibility = 'hidden';
  //
  // ui.charsets.clear();
  //
  // let model = { charsets: [] };
  // for (var i = 0; i < game.charsets.length; i++) {
  //   let charset = game.charsets[i];
  //   // console.log(charset);
  //   model.charsets[i] = { characters: [] };
  //   for (var j = 0; j < charset.characters.length; j++) {
  //     let ch = charset.characters[j];
  //     if (ch) {
  //       let bitmap = charset.getBitmap(j);
  //       let image = Tools.createCanvasFromBuffer(bitmap, ch.width, ch.height);
  //       model.charsets[i].characters.push({ image: image, width: ch.width, height: ch.height });
  //     } else {
  //       model.charsets[i].characters.push({ width: 8, height: 8 });
  //     }
  //   }
  // }
  //
  // ui.charsets.update(model);
  //
  // ui.rooms.reset();
  // ui.rooms.adjust();


  ui.game.update({ title: game.title, version: game.version });

  // showPanel('game');
}

function createElements() {
  // ui.app = document.querySelector('#app');

  ui.game = new Game();

  ui.rooms = new Rooms();
  ui.rooms.on('select', (id) => {
    showRoomDetail(id);
  });

  ui.charsets = new Charsets();

  // ui.pane = new Pane();
  // ui.pane.add({ component: ui.rooms, title: 'Rooms' });
  // ui.pane.add({ component: ui.char, title: 'Charsets' });
  // ui.pane.show(0);
  // ui.main.appendChild(ui.pane.dom());

  ui.main = new Pane();

  ui.sidebar = new Sidebar();
  ui.sidebar.update({ items: [
      { id: 'game', title: 'Game' },
      { id: 'rooms', title: 'Rooms' },
      { id: 'charsets', title: 'Charsets' }
    ]
  });
  ui.sidebar.on('select', (id) => {
    showPanel(id);
    ui.sidebar.setActive(id);
  });

  ui.content = new Panel();
  ui.content.addClass('content');

  ui.main.add({ component: ui.sidebar })
  ui.main.add({ component: ui.content });

  document.querySelector('#app').appendChild(ui.main.dom());

  showPanel('game');
}

function detect(rootPath) {
  let detector = new Detector(rootPath);
  // console.log(detector.version);

  if (detector.version == 2) {
    game = new Scumm2(detector);
  }
  else if (detector.version == 3) {
    game = new Scumm3(detector);
  }
  else if (detector.version == 4) {
    game = new Scumm4(detector);
  }
  if (game) updateElements();
}

function onKeyDown(event) {
}

function onDrop(event) {
  event.preventDefault();

  let files = event.dataTransfer.files;

  if (files[0]) {
    let path = files[0].path;
    let stats = fs.statSync(path);
    if (stats.isDirectory()) {
      detect(path);
    } else {
      console.log(`"${path}" is not a directory`);
    }
  }
}

function onDragOver(event) {
  event.preventDefault();
}

function onDragEnter(event) {
  event.preventDefault();
}

function onDragEnd(event) {
  event.preventDefault();
}

function onContextMenu() {
  // event.preventDefault();
  // console.log('menu');
}

function initEventListeners() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('drop', onDrop);
  window.addEventListener('dragover', onDragOver);
  window.addEventListener('dragenter', onDragEnter);
  window.addEventListener('dragend', onDragEnd);
  window.addEventListener('contextmenu', onContextMenu);
}

function ready() {
  console.log('ready');

  initEventListeners();
  createElements();
}

window.onload = () => {
  ready();
}

window.app = app;
