const html = require('./html');
const Component = require('./component');
const Scroller = require('./scroller');

class ScrollPane extends Component {
  constructor(params={}) {
    super();

    this.offset = 0;
    this.orientation = params.orientation || 'vertical';

    this.el = html.div().class('scroll-pane').class(this.orientation).dom();

    this.contentEl = html.div().class('scroll-pane-content').class(this.orientation).dom();
    this.el.appendChild(this.contentEl);

    this.controlEl = html.div().class('scroll-pane-control').class(this.orientation).dom();
    this.el.appendChild(this.controlEl);

    this.scroller = new Scroller({ orientation: this.orientation });
    this.scroller.on('scroll', (ratio) => {
      this.onScroller();
    });
    this.controlEl.appendChild(this.scroller.dom());

    this.contentEl.addEventListener('wheel', this);
    // window.addEventListener('wheel', this);
    window.addEventListener('resize', this);
  }

  update(model={}) {
    super.update(model);

    if (this.model.component) {
      if (this.model.component !== this.contentEl.firstChild) {
        if (this.contentEl.firstChild) this.contentEl.removeChild(this.contentEl.firstChild);
        this.contentEl.appendChild(this.model.component);
      }
    }

    let rect = this.contentEl.getBoundingClientRect();

    this.page = (this.orientation == 'horizontal' ? this.contentEl.offsetWidth : this.contentEl.offsetHeight);
    this.total = (this.orientation == 'horizontal' ? this.contentEl.scrollWidth : this.contentEl.scrollHeight);
    // this.total = (this.orientation == 'horizontal' ? rect.width : rect.height);
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
    if (this.orientation == 'horizontal')
      this.contentEl.scrollLeft = 0;
    else
      this.contentEl.scrollTop = 0;
  }

  scrollBy(amt) {
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
    // let rect = this.el.getBoundingClientRect();
    // let x = event.pageX;
    // let y = event.pageY;
    // if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
    //   let amt = this.orientation == 'horizontal' ? event.deltaX : event.deltaY;
    //   this.scrollBy(amt);
    // }
    let amt = this.orientation == 'horizontal' ? event.deltaX : event.deltaY;
    this.scrollBy(amt);
    // console.log(amt);
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
