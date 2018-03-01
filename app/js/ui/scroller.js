const html = require('./html');
const Component = require('./component');

class Scroller extends Component {
  constructor(params={}) {
    super(params);
    this.component = params.component;
    this.orientation = params.orientation || 'vertical';
    this.offset = 0;
    this.render();
  }

  render() {
    this.el = html.div().class('scroller').class(this.orientation).dom();

    this.grabEl = html.div().class('scroller-grab').class(this.orientation).dom();
    this.grabEl.addEventListener('mousedown', this);
    this.el.appendChild(this.grabEl);

    window.addEventListener('resize', this);
    this.component.addEventListener('wheel', this);

    this.updateElements();
  }

  updateElements() {
    let page, total, canal;

    if (this.orientation == 'horizontal') {
      page = this.component.offsetWidth;
      total = this.component.scrollWidth;
      canal = this.el.offsetWidth;
    } else {
      page = this.component.offsetHeight;
      total = this.component.scrollHeight;
      canal = this.el.offsetHeight;
    }

    let size = 0;

    if (page < total) {
      // this.grabEl.style.width = Math.round((page * (page / total))) + 'px';
      size = Math.round(page * (page / total));
    } else {
      // this.grabEl.style.width = 0;
      // this.grabEl.style.left = 0;
      size = 0;
      this.offset = 0;
    }

    // if (this.grabEl.offsetLeft + this.grabEl.offsetWidth > this.el.offsetWidth) {
    //   this.grabEl.style.left = (this.el.offsetWidth - this.grabEl.offsetWidth) + 'px';
    // } else if (this.grabEl.offsetLeft < 0) {
    //   this.grabEl.style.left = 0;
    // }
    //
    // let ratio = (this.grabEl.offsetLeft) / (this.el.offsetWidth - this.grabEl.offsetWidth);
    // this.component.scrollLeft = (this.component.scrollWidth - this.component.offsetWidth) * ratio;

    if (this.offset + size > canal) {
      this.offset = canal - size;
    } else if (this.offset < 0) {
      this.offset = 0;
    }

    let ratio = this.offset / (canal - size);

    if (this.orientation == 'horizontal') {
      this.component.scrollLeft = (total - page) * ratio;
      this.grabEl.style.width = size + 'px';
      this.grabEl.style.left = this.offset + 'px';
    } else {
      this.component.scrollTop = (total - page) * ratio;
      this.grabEl.style.height = size + 'px';
      this.grabEl.style.top = this.offset + 'px';
    }

  }

  update(props={}) {
    super.update(props);
    this.updateElements();
  }

  reset() {
    this.offset = 0;
  }

  adjust() {
    this.updateElements();
  }

  scrollBy(amt) {
    this.offset += amt;
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
        this.scrollBy(this.orientation == 'horizontal' ? event.movementX : event.movementY);
        this.scrolled = true;
      } else {
        // let dx = event.clientX - this.mouseDownX;
        // let dy = event.clientY - this.mouseDownY;
        // if (event.buttons & 1 && Math.abs(this.orientation == 'horizontal' ? dx : dy) > 2) {
        //   if (this.orientation == 'horizontal')
        //     this.scrollBy(dx);
        //   else
        //     this.scrollBy(dy);
        this.startDrag();
        // }
      }
    }
  }

  onWheel(event) {
    let amt = this.orientation == 'horizontal' ? event.deltaX : event.deltaY;
    this.scrollBy(amt);
  }

  onResize(event) {
    // this.updateElements();
    this.adjust();
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
