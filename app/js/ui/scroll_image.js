const {EventEmitter} = require('events');

const html = require('../html');

class ScrollImage extends EventEmitter {
  constructor(model) {
    super();
    this.model = model;
    this.model.objects = [];
  }

  render() {
    let canvas = document.createElement('canvas');
    canvas.width = this.model.width;
    canvas.height = this.model.height;
    let ctx = canvas.getContext('2d');

    if (this.model.image) {
      if (this.model.image.completed) {
        ctx.drawImage(this.model.image, 0, 0);
      } else {
        this.model.image.onload = () => ctx.drawImage(this.model.image, 0, 0);
      }
    } else {
      this.model.image = document.createElement('img');
      this.model.image.width = this.model.width;
      this.model.image.height = this.model.height;
    }

    // canvas.style.opacity = 0;
    // canvas.style.transition = 1;

    let component = html.div()
      .attribute('class', 'scroll-image')
      .append(canvas)
      ;

    // component.dom().style.opacity = 1;

    this.el = component.dom();

    this.el.addEventListener('mousedown', this);
    this.el.addEventListener('wheel', this);

    return this.el;
  }

  renderImage() {
    let canvas = this.el.firstChild;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(this.model.image, 0, 0);
    for (var i = 0; i < this.model.objects.length; i++) {
      let o = this.model.objects[i];
      if (o.image)
        ctx.drawImage(o.image, o.x_pos, o.y_pos);
    }
    if (this.tempObject) {
      let ob = this.tempObject;
      if (ob.image) {
        ctx.drawImage(ob.image, ob.x_pos, ob.y_pos);
      } else {
        ctx.save();
        // ctx.globalCompositeOperation = 'exclusion';
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.rect(ob.x_pos+0.5, ob.y_pos+0.5, ob.width-1, ob.height-1);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  showObject(ob) {
    this.tempObject = ob;
    this.renderImage();
  }

  toggleObject(ob) {
    if (this.model.objects.find(element => element.number == ob.number)) {
      this.removeObject(ob);
      return false;
    } else {
      this.addObject(ob);
      return true;
    }
  }

  addObject(ob) {
    if (this.model.objects.find(element => element.number == ob.number))
      return;
    this.model.objects.push(ob);
    this.renderImage();
  }

  removeObject(ob) {
    if (this.model.objects.find(element => element.number == ob.number)) {
      this.model.objects = this.model.objects.filter(element => element.number !== ob.number);
      this.renderImage();
    }
  }

  setDimensions(width, height) {
    this.el.style.height = height + 'px';
  }

  setImage(image) {
    while (this.el.firstChild) this.el.removeChild(this.el.firstChild);
    this.el.appendChild(image);
    this.el.scrollLeft = 0;
    if (image.completed) {
      this.setDimensions(image.width, image.height);
    } else {
      image.onload = (event) => {
        this.setDimensions(event.target.width, event.target.height);
      };
    }
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

module.exports = ScrollImage;
