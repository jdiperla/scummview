const html = require('./html');
const Component = require('./component');

class Scroller extends Component {
  constructor(params={}) {
    super();

    this.offset = 0;
    this.orientation = params.orientation || 'vertical';

    this.el = html.div().class('scroller').class(this.orientation).dom();

    this.gripEl = html.div().class('scroller-grab').class(this.orientation).dom();
    this.gripEl.addEventListener('mousedown', this);

    this.el.appendChild(this.gripEl);
  }

  updateElements() {

    // if (this.orientation == 'horizontal') {
    //   page = this.model.component.offsetWidth;
    //   total = this.model.component.scrollWidth;
    //   canal = this.el.offsetWidth;
    // } else {
    //   page = this.model.component.offsetHeight;
    //   total = this.model.component.scrollHeight;
    //   canal = this.el.offsetHeight;
    // }

    // let page = this.model.page;
    // let total = this.model.total;
    // let canal = this.orientation == 'horizontal' ? this.el.offsetWidth : this.el.offsetHeight;
    // let size = 0;
    //
    // if (page < total) {
    //   size = Math.round(page * (page / total));
    // } else {
    //   size = 0;
    //   this.offset = 0;
    // }
    //
    // if (this.offset + size > canal) {
    //   this.offset = canal - size;
    // } else if (this.offset < 0) {
    //   this.offset = 0;
    // }
    //
    // let ratio = this.offset / (canal - size);
    //
    // if (this.orientation == 'horizontal') {
    //   // this.model.component.scrollLeft = (total - page) * ratio;
    //   this.gripEl.style.width = size + 'px';
    //   this.gripEl.style.left = this.offset + 'px';
    // } else {
    //   // this.model.component.scrollTop = (total - page) * ratio;
    //   this.gripEl.style.height = size + 'px';
    //   this.gripEl.style.top = this.offset + 'px';
    // }
  }

  render() {
    // this.updateElements();
  }

  update(model={}) {
    super.update(model);

    let page = this.model.page;
    let total = this.model.total;

    let grip = this.orientation == 'horizontal' ? this.el.offsetWidth : this.el.offsetHeight;
    let size = this.orientation == 'horizontal' ? this.el.offsetWidth : this.el.offsetHeight;

    if (this.model.offset !== undefined) {
      this.offset = this.model.offset * size;
    }

    if (page >= total) {
      this.offset = 0;
      grip = 1;
    } else {
      let ratio = page / total;
      grip = grip * ratio;
    }

    if (this.orientation == 'horizontal') {
      this.gripEl.style.width = grip + 'px';
      this.gripEl.style.left = this.offset + 'px';
    } else {
      this.gripEl.style.height = grip + 'px';
      this.gripEl.style.top = this.offset + 'px';
    }

    this.grip = grip;
    this.size = size;

  }

  reset() {
    this.offset = 0;
  }

  scrollBy(amt) {
    this.offset += amt;

    let size = this.size;//this.orientation == 'horizontal' ? this.el.offsetWidth : this.el.offsetHeight;
    let grip = this.grip;//this.orientation == 'horizontal' ? this.gripEl.offsetWidth : this.gripEl.offsetHeight;

    if (this.offset + grip > size) {
      this.offset = size - grip;
    } else if (this.offset < 0) {
      this.offset = 0;
    }

    if (this.orientation == 'horizontal') {
      this.gripEl.style.left = this.offset + 'px';
    } else {
      this.gripEl.style.top = this.offset + 'px';
    }

    this.emit('scroll');
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
        // this.scrolled = true;
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
    // let amt = this.orientation == 'horizontal' ? event.deltaX : event.deltaY;
    // this.scrollBy(amt);
  }

  onResize(event) {
    // this.adjust();
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
