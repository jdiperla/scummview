const {EventEmitter} = require('events');

class RoomImage extends EventEmitter {
  constructor(params={}) {
    super();
    this.el = params.el || document.createElement('div');

    this.el.addEventListener('mousedown', this);
    this.el.addEventListener('wheel', this);
  }

  setImage(image) {
    if (this.el.firstChild) this.el.removeChild(this.el.firstChild);
    this.el.scrollLeft = 0;
    this.el.appendChild(image);
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
         this.el.scrollLeft -= event.movementX;
         this.scrolled = true;
       } else {
         let dx = event.clientX - this.mouseDownX;
         let dy = event.clientY - this.mouseDownY;
         if (event.buttons & 1 && Math.abs(dx) > 2) {
           this.el.scrollLeft -= dx;
           this.startDrag();
         }
       }
     }
  }

  onWheel(event) {
    this.el.scrollLeft += event.deltaY;
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

module.exports = RoomImage;
