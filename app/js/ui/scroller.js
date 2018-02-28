const html = require('./html');
const Component = require('./component');

class Scroller extends Component {
  constructor(params={}) {
    super(params);
    this.component = params.component;
    this.orientation = params.orientation || 'horizontal';
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
    if (this.orientation == 'horizontal') {
      let page = this.component.offsetWidth;
      let total = this.component.scrollWidth;

      if (page < total) {
        this.grabEl.style.width = Math.round((page * (page / total))) + 'px';
      } else {
        this.grabEl.style.width = 0;
        this.grabEl.style.left = 0;
      }

      if (this.grabEl.offsetLeft + this.grabEl.offsetWidth > this.el.offsetWidth) {
        this.grabEl.style.left = (this.el.offsetWidth - this.grabEl.offsetWidth) + 'px';
      } else if (this.grabEl.offsetLeft < 0) {
        this.grabEl.style.left = 0;
      }

      let ratio = (this.grabEl.offsetLeft) / (this.el.offsetWidth - this.grabEl.offsetWidth);
      this.component.scrollLeft = (this.component.scrollWidth - this.component.offsetWidth) * ratio;

    } else {
      let page = this.component.offsetHeight;
      let total = this.component.scrollHeight;

      if (page < total) {
        this.grabEl.style.height = Math.round((page * (page / total))) + 'px';
      } else {
        this.grabEl.style.height = 0;
        this.grabEl.style.top = 0;
      }

      if (this.grabEl.offsetTop + this.grabEl.offsetHeight > this.el.offsetHeight) {
        this.grabEl.style.top = (this.el.offsetHeight - this.grabEl.offsetHeight) + 'px';
      } else if (this.grabEl.offsetTop < 0) {
        this.grabEl.style.top = 0;
      }

      let ratio = (this.grabEl.offsetTop) / (this.el.offsetHeight - this.grabEl.offsetHeight);
      this.component.scrollTop = (this.component.scrollHeight - this.component.offsetHeight) * ratio;
    }
  }

  update(props={}) {
    super.update(props);
    this.updateElements();
  }

  reset() {
    if (this.orientation == 'horizontal') {
      this.grabEl.style.left = 0;
      this.component.scrollLeft = 0;
    } else {
      this.grabEl.style.top = 0;
      this.component.scrollTop = 0;
    }
  }

  scrollBy(amt) {
    if (this.orientation == 'horizontal') {
      if ((amt < 0 && this.grabEl.offsetLeft > 0) || (amt > 0 && this.grabEl.offsetLeft + this.grabEl.offsetWidth < this.el.offsetWidth))
        this.grabEl.style.left = (this.grabEl.offsetLeft + amt) + 'px';
    } else {
      // if ((amt < 0 && this.grabEl.offsetTop > 0) || (amt > 0 && this.grabEl.offsetTop + this.grabEl.offsetHeight < this.el.offsetHeight))
        this.grabEl.style.top = (this.grabEl.offsetTop + amt) + 'px';
    }
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
        if (this.orientation == 'horizontal')
          this.scrollBy(event.movementX);
        else
          this.scrollBy(event.movementY);
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
    this.scrollBy(event.deltaY*0.1);
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
