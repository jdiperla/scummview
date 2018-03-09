const html = require('./html');
const Component = require('./component');
const ScrollPane = require('./scroll_pane');

class RoomList extends Component {
  constructor(params={}) {
    super(params);

    this.direction = 1;

    this.el = html.div().class('room-list-container').dom();
    this.itemsEl = html.div().class('room-list-items').dom();

    this.scrollPane = new ScrollPane();
    this.scrollPane.update({ component: this.itemsEl });

    this.el.appendChild(this.scrollPane.dom());
  }

  render() {
    if (this.model.items) {
      this.clear();
      for (var i = 0; i < this.model.items.length; i++) {
        let item = this.model.items[i];
        let el = this.renderListItem(item);
        this.itemsEl.append(el);
      }

    }
  }

  renderListItem(item) {
    let component = html.div()
      .dataset('id', item.id)
      .class('room-list-item')
      .append(
        html.div()
          .id('thumbnail' + item.id)
          .class('room-list-item-image')
          .append(item.image)
      )
      .append(
        html.div().class('room-list-item-text')
          .append(html.div().class('room-list-item-title').append(html.text(item.name || item.id)))
          .append(html.text(item.width + 'x' + item.height))
      )
      .on('click', (event) => {
        let id = event.target.dataset.id;
        if (!this.scrolled) {
          this.emit('select', id);
        }
        this.scrolled = false;
      })
    ;
    return component.dom();
  }

  update(model) {
    super.update(model);
    this.render();
    this.scrollPane.update();
  }


  reset() {
    this.scrollPane.reset();
  }

  clear() {
    while (this.itemsEl.firstChild) this.itemsEl.removeChild(this.itemsEl.firstChild);
  }

  updateThumbnail(id, image) {
    let el = this.itemsEl.querySelector('#thumbnail' + id);
    el.removeChild(el.firstChild);
    el.appendChild(image);
  }

  handleEvent(event) {
    // if (event.type == 'mousedown') {
    //   this.onMouseDown(event);
    // }
    // else if (event.type == 'mouseup') {
    //   this.onMouseUp(event);
    // }
    // else if (event.type == 'mousemove') {
    //   this.onMouseMove(event);
    // }
    // else if (event.type == 'wheel') {
    //   this.onWheel(event);
    // }
    // else if (event.type == 'blur') {
    //   this.onBlur(event);
    // }
  }
}

module.exports = RoomList;
