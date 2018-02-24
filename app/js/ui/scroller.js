const html = require('./html');
const Component = require('./component');

class Scroller extends Component {
  constructor(params={}) {
    super(params);
    this.render();
  }

  render() {
    this.scrollerEl = html.div().class('scroller').dom();
    // this.spacerEl = html.div().dom();
    this.grabEl = html.div().class('scroller-grab').dom();

    // this.scrollerEl.appendChild(this.spacerEl);
    this.scrollerEl.appendChild(this.grabEl);

    this.el.appendChild(this.scrollerEl);

    window.addEventListener('resize', this);
    this.grabEl.addEventListener('mousedown', this);

    this.model.component.addEventListener('wheel', this);
    // this.grabEl.addEventListener('mousemove', this);

    this.updateElements();
  }

  updateElements() {
    let page = this.model.component.offsetWidth;
    let total = this.model.component.scrollWidth;
    if (page < total) {
      this.grabEl.style.width = ((page * (page / total)) >> 0) + 'px';
      // this.spacerEl.style.width = ;
      let offset = Math.round(page * (this.model.component.scrollLeft / total));
      this.grabEl.style.left =  offset + 'px';
      // console.log(offset);
    } else {
      this.grabEl.style.width = 0;
    }
  }

  update(props={}) {
    // console.log('update');
    super.update(props);
    this.updateElements();
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
    // console.log('down');
  }

  onMouseUp(event) {
    this.endDrag();
  }

  scrollBy(amt) {
    // let ratio = Math.abs(amt) / this.scrollerEl.offsetWidth;
    // this.grabEl.style.left = (this.grabEl.offsetLeft+amt) + 'px';
    let ratio = this.model.component.scrollWidth / this.scrollerEl.offsetWidth;

    this.model.component.scrollLeft += amt * ratio;

    // this.el.scrollLeft -=
    this.updateElements();
  }

  onMouseMove(event) {
    // this.updateElements();
    // if (event.buttons & 1) {
    //   // console.log('frag');
    //   this.model.component.scrollLeft += event.movementX;
    //   this.updateElements();
    // }
    if ((!event.buttons & 1)) {
     this.drag = false;
     this.down = false;
    }
    if (this.down) {
      if (this.drag) {
        // console.log('draggin');
        this.scrollBy(event.movementX);
        this.scrolled = true;
      } else {
        let dx = event.clientX - this.mouseDownX;
        let dy = event.clientY - this.mouseDownY;
        if (event.buttons & 1 && Math.abs(dx) > 2) {
          // this.el.scrollLeft -= dx;
          this.scrollBy(dx);
          this.startDrag();
        }
      }
    }
  }

  onWheel(event) {
    this.scrollBy(event.deltaY);
  }

  onResize(event) {
    this.updateElements();
  }

  onBlur(event) {
    this.endDrag();
  }

  handleEvent(event) {
    if (event.type == 'mousedown') {
      this.onMouseDown(event);
    } else if (event.type == 'mouseup') {
      this.onMouseUp(event);
    } else if (event.type == 'mousemove') {
      this.onMouseMove(event);
    } else if (event.type == 'wheel') {
      this.onWheel(event);
    } else if (event.type == 'resize') {
      this.onResize(event);
    } else if (event.type == 'blur') {
      this.onBlur(event);
    }
  }

}

module.exports = Scroller;
