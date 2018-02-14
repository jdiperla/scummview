const {EventEmitter} = require('events');

let thumbWidth = 128;
let thumbHeight = ((thumbWidth / 320) * 144)>>0;

class RoomList extends EventEmitter {
  constructor(params={}) {
    super();
    this.el = params.el || document.createElement('div');

    this.containerEl = document.createElement('div');
    this.containerEl.classList.add('room-list-container');

    this.el.addEventListener('mousedown', this);
    this.el.addEventListener('wheel', this);

    this.el.appendChild(this.containerEl);
    this.direction = 1;
  }

  clear() {
    while (this.containerEl.firstChild) {
      this.containerEl.removeChild(this.containerEl.firstChild);
    }
  }

  createListItem(room) {
    let el = document.createElement('div');
    el.dataset.id = room.id;
    el.classList.add('room-list-item');

    let textEl = document.createElement('div');
    textEl.classList.add('room-list-item-text');
    textEl.style.pointerEvents = 'none';
    textEl.innerHTML = `${room.id}`;

    let thumbEl = document.createElement('div');
    thumbEl.classList.add('room-list-item-image');
    thumbEl.id = 'thumbnail-' + room.id;
    thumbEl.style.pointerEvents = 'none';
    thumbEl.style.width = thumbWidth + 'px';
    thumbEl.style.height = thumbHeight + 'px';
    el.appendChild(thumbEl);

    el.appendChild(textEl);

    el.onclick = (event) => {
      if (!this.scrolled) {
        this.emit('select', event.target.dataset.id);
      }
      this.scrolled = false;
    };

    this.containerEl.appendChild(el);
  }

  setThumbnail(id, width, height, roomImageData) {
    let canvas = document.createElement('canvas');
    canvas.width = thumbWidth;
    canvas.height = thumbHeight;

    if (roomImageData) {
      let canvasTemp = document.createElement('canvas');
      canvasTemp.width = width;
      canvasTemp.height = height;
      let ctx = canvasTemp.getContext('2d');
      let imageData = ctx.getImageData(0, 0, canvasTemp.width, canvasTemp.height);
      for (var i = 0; i < imageData.data.length; i++) {
        imageData.data[i] = roomImageData[i];
      }
      ctx.putImageData(imageData, 0, 0);

      ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'medium';
      ctx.drawImage(canvasTemp, 0, 0, canvas.width, (canvas.height * (320/width))>>0);
    }

    let image = new Image();
    image.id = id;
    image.onload = (event) => {
      let id = event.target.id;
      let el = document.getElementById('thumbnail-' + id);
      el.appendChild(event.target);
    };
    image.src = canvas.toDataURL();

    image.style.pointerEvents = 'none';
  }

  startDrag() {
    window.addEventListener('blur', this);
    window.addEventListener('mouseup', this);
    this.drag = true;
  }

  endDrag() {
    if (this.drag) {
      window.removeEventListener('blur', this);
      window.removeEventListener('mouseup', this);
      this.drag = false;
    }
    if (this.down) {
      window.removeEventListener('mousemove', this);
      this.down = false;
    }
  }

  onMouseDown(event) {
    this.down = true;
    this.mouseDownX = event.clientX;
    this.mouseDownY = event.clientY;
    window.addEventListener('mousemove', this);
  }

  onMouseUp(event) {
    this.endDrag();
  }

  onMouseMove(event) {
    if ((!event.buttons & 1)) {
      this.drag = false;
      this.down = false;
    }
    if (this.down) {
      if (this.drag) {
        if (this.direction)
          this.el.scrollTop -= event.movementY;
        else
          this.el.scrollLeft -= event.movementX;
        this.scrolled = true;
      } else {
        let dx = event.clientX - this.mouseDownX;
        let dy = event.clientY - this.mouseDownY;
        if (event.buttons & 1 && Math.abs(this.direction?dy:dx) > 2) {
          if (this.direction) {
            this.el.scrollTop -= dy;
          } else {
            this.el.scrollLeft -= dx;
          }
          this.startDrag();
        }
      }
    }
  }

  onWheel(event) {
    if (this.direction)
      this.el.scrollTop += event.deltaY;
    else
      this.el.scrollLeft += event.deltaX;
  }

  onBlur(event) {
    this.endDrag();
  }

  handleEvent(event) {
    if (event.type == 'mousedown') {
      this.onMouseDown(event);
    }
    else if (event.type == 'mouseup') {
      this.onMouseUp(event);
    }
    else if (event.type == 'mousemove') {
      this.onMouseMove(event);
    }
    else if (event.type == 'wheel') {
      this.onWheel(event);
    }
    else if (event.type == 'blur') {
      this.onBlur(event);
    }
  }
}

module.exports = RoomList;
