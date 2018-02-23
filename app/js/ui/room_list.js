const {EventEmitter} = require('events');

const html = require('../html');

let thumbWidth = 128;
let thumbHeight = 80;

class RoomList extends EventEmitter {
  constructor(model={}) {
    super();
    this.model = model;
    this.direction = 1;
  }

  render() {
    let component = html.div().class('room-list');
    let inner = html.div().class('room-list-items');

    // this.containerEl = document.createElement('div');
    // this.containerEl.classList.add('room-list-container');

    if (this.model.items) {
      for (var i = 0; i < this.model.items.length; i++) {
        let item = this.model.items[i];
        let el = this.renderListItem(item);
        inner.append(el);
      }
    }

    component.append(inner);

    this.containerEl = inner.dom();
    this.el = component.dom();

    this.el.addEventListener('mousedown', this);
    this.el.addEventListener('wheel', this);
    // this.el.appendChild(this.containerEl);

    return this.el;
  }

  clear() {
    this.el.innerHTML = '';
    // while (this.containerEl.firstChild) {
    //   this.containerEl.removeChild(this.containerEl.firstChild);
    // }
  }

  renderListItem(item) {
    let component = html.div()
      .dataset('id', item.id)
      .class('room-list-item')
      .append(
        html.div()
          .attribute('id', 'thumbnail' + item.id)
          .class('room-list-item-image')
          .append(item.image)
      )
      .append(html.div().class('room-list-item-title').append(html.text(item.description)))
      .on('click', (event) => {
        let id = event.target.dataset.id;
        if (!this.scrolled) {
          this.emit('select', id);
        }
        this.scrolled = false;
      })
    ;

    return component.dom();

    // let el = document.createElement('div');
    // el.dataset.id = room.id;
    // el.classList.add('room-list-item');
    //
    // let textEl = document.createElement('div');
    // textEl.classList.add('room-list-item-text');
    // textEl.style.pointerEvents = 'none';
    // textEl.innerHTML = room.id + ' ' + (room.name || '');
    //
    // // el.appendChild(textEl);
    //
    // let thumbEl = document.createElement('div');
    // thumbEl.classList.add('room-list-item-image');
    // thumbEl.id = 'thumbnail-' + room.id;
    // thumbEl.style.pointerEvents = 'none';
    // thumbEl.style.width = thumbWidth + 'px';
    // thumbEl.style.height = thumbHeight + 'px';
    // el.appendChild(thumbEl);
    //
    // el.onclick = (event) => {
    //   if (!this.scrolled) {
    //     this.emit('select', event.target.dataset.id);
    //   }
    //   this.scrolled = false;
    // };
    //
    // // this.containerEl.appendChild(el);
    // this.el.appendChild(el);
  }

  setThumbnail(id, image) {
    // let canvas = document.createElement('canvas');
    // canvas.width = thumbWidth;
    // canvas.height = thumbHeight;
    // let ctx = canvas.getContext('2d');
    // ctx.fillStyle = 'black';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.imageSmoothingQuality = 'medium';
    //
    // let ratio = (canvas.width / image.width);
    //
    // ctx.drawImage(image, 0, 0, canvas.width, canvas.height * ratio * (image.height / canvas.height));
    //
    // let thumb = document.createElement('img');
    // thumb.id = id;
    // thumb.style.pointerEvents = 'none';
    // thumb.onload = (event) => {
    //   let id = event.target.id;
    //   let el = document.getElementById('thumbnail-' + id);
    //   if (el) el.appendChild(event.target);
    // };
    // thumb.src = canvas.toDataURL();
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
    // console.log('down');
    this.down = true;
    this.scrolled = false;
    this.mouseDownX = event.clientX;
    this.mouseDownY = event.clientY;
    window.addEventListener('mousemove', this);
    // console.log(event.target);
  }

  onMouseUp(event) {
    this.endDrag();
  }

  onMouseMove(event) {
    if ((!event.buttons & 1)) {
      this.drag = false;
      this.down = false;
      return;
    }
    if (this.down) {
      if (this.drag) {
        // console.log('drag');
        if (this.direction)
          this.el.scrollTop -= event.movementY;
        else
          this.el.scrollLeft -= event.movementX;
        this.scrolled = true;
      } else {
        let dx = event.clientX - this.mouseDownX;
        let dy = event.clientY - this.mouseDownY;
        if (event.buttons & 1 && Math.abs(this.direction?dy:dx) > 4) {
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
