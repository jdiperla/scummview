const html = require('./html');
const Component = require('./component');
const Scroller = require('./scroller');

class RoomImage extends Component {
  constructor(params={}) {
    super(params);
    this.model.objects = [];
    this.render();
  }

  render() {
    let container = html.div().class('room-image-container');

    let canvas = document.createElement('canvas');
    canvas.id = 'graphic';
    canvas.width = this.model.width;
    canvas.height = this.model.height;

    let component = html.div().class('room-image').append(canvas);
    // let outer = html.div().class('room-image-border');
    // outer.append(component);

    container.dom().append(component.dom());
    // container.dom().append(outer.dom());

    // this.scroller = new Scroller({ component: component.dom(), orientation: 'horizontal' });
    this.scroller = new Scroller({ component: component.dom(), orientation: 'horizontal' });
    container.dom().append(this.scroller.dom());

    this.el = container.dom();

    this.el.addEventListener('mousedown', this);
    this.el.addEventListener('wheel', this);

    this.updateElements();
  }

  renderImage() {
    let canvas = this.el.querySelector('.room-image').firstChild;
    canvas.width = this.model.width;
    canvas.height = this.model.height;

    let ctx = canvas.getContext('2d');
    if (this.model.image) {
      ctx.drawImage(this.model.image, 0, 0);
    }

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
        ctx.globalCompositeOperation = 'difference';
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.rect(ob.x_pos+0.5, ob.y_pos+0.5, ob.width-1, ob.height-1);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  updateElements() {
    this.renderImage();
    this.scroller.update();
  }

  update(model={}) {
    // console.log('scrollImage.update', model);
    super.update(model);
    this.updateElements();

    // let canvas = this.el.querySelector('#graphic');
    //
    // canvas.width = this.model.width;
    // canvas.height = this.model.height;
    //
    // let ctx = canvas.getContext('2d');
    //
    // if (this.model.image) {
    //   ctx.drawImage(this.model.image, 0, 0);
    //   // if (this.model.image.completed) {
    //   //   ctx.drawImage(this.model.image, 0, 0);
    //   // } else {
    //   //   this.model.image.onload = () => ctx.drawImage(this.model.image, 0, 0);
    //   // }
    // } else {
    //   // this.model.image = document.createElement('img');
    //   // this.model.image.width = this.model.width;
    //   // this.model.image.height = this.model.height;
    // }
  }

  reset() {
    this.model.objects = [];
    this.tempObject = null;
    this.scroller.reset();
    this.renderImage();
  }

  adjust() {
    this.scroller.adjust();
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

module.exports = RoomImage;
