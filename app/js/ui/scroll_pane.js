const html = require('./html');
const Component = require('./component');
const Scroller = require('./scroller');

class ScrollPane extends Component {
  constructor(params={}) {
    super();

    this.offset = 0;
    this.orientation = params.orientation || 'vertical';

    this.el = html.div().class('scroll-pane').class(this.orientation).dom();

    this.contentEl = html.div().class('scroll-pane-content').dom();
    this.el.appendChild(this.contentEl);

    this.controlEl = html.div().class('scroll-pane-control').dom();
    this.el.appendChild(this.controlEl);

    this.scroller = new Scroller();
    this.scroller.on('scroll', (ratio) => {
      // this.updateOffset((this.total - this.page) * ratio);
      // this.updateOffset(this.total * ratio);
      this.onScroller();
    });
    this.controlEl.appendChild(this.scroller.dom());

    this.contentEl.addEventListener('wheel', this);
    window.addEventListener('resize', this);
  }

  updateElements() {
    // let page, total, canal;
    //
    // if (this.orientation == 'horizontal') {
    //   page = this.model.component.offsetWidth;
    //   total = this.model.component.scrollWidth;
    //   canal = this.el.offsetWidth;
    // } else {
    //   page = this.model.component.offsetHeight;
    //   total = this.model.component.scrollHeight;
    //   canal = this.el.offsetHeight;
    // }
    //
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
    //   this.model.component.scrollLeft = (total - page) * ratio;
    //   this.grabEl.style.width = size + 'px';
    //   this.grabEl.style.left = this.offset + 'px';
    // } else {
    //   this.model.component.scrollTop = (total - page) * ratio;
    //   this.grabEl.style.height = size + 'px';
    //   this.grabEl.style.top = this.offset + 'px';
    // }
  }

  render() {
    // this.updateElements();
  }

  update(model={}) {
    super.update(model);

    if (this.model.component) {
      if (this.model.component !== this.contentEl.firstChild) {
        if (this.contentEl.firstChild) this.contentEl.removeChild(this.contentEl.firstChild);
        this.contentEl.appendChild(this.model.component);
      }
    }

    this.page = (this.orientation == 'horizontal' ? this.contentEl.offsetWidth : this.contentEl.offsetHeight);
    this.total = (this.orientation == 'horizontal' ? this.contentEl.scrollWidth : this.contentEl.scrollHeight);
    this.offset = (this.orientation == 'horizontal' ? this.contentEl.scrollLeft : this.contentEl.scrollTop);

    this.scroller.update({ page: this.page, total: this.total, offset: this.offset / this.total });
  }

  updateOffset(value) {
    // this.offset = value;
    // if (this.orientation == 'horizontal') {
    //   this.contentEl.scrollLeft = this.offset;
    // } else {
    //   this.contentEl.scrollTop = this.offset;
    // }
  }

  reset() {
    this.offset = 0;
  }

  scrollBy(amt) {
    // console.log(amt);
    this.offset += amt;
    if (this.orientation == 'horizontal') {
      this.contentEl.scrollLeft = this.offset;
    } else {
      this.contentEl.scrollTop = this.offset;
    }
    this.update();
  }

  onScroller() {
    this.offset = (this.scroller.offset / this.scroller.size) * this.total;
    if (this.orientation == 'horizontal') {
      this.contentEl.scrollLeft = this.offset;
    } else {
      this.contentEl.scrollTop = this.offset;
    }
  }

  onWheel(event) {
    let amt = this.orientation == 'horizontal' ? event.deltaX : event.deltaY;
    this.scrollBy(amt);
  }

  onResize(event) {
    this.update();
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

module.exports = ScrollPane;
