const html = require('./html');
const Component = require('./component');
const RoomList = require('./room_list');
const RoomDetail = require('./room_detail');

class Room extends Component {
  constructor(params={}) {
    super(params);
    this.render();
  }

  render() {
    this.el = html.div().class('room-content').dom();

    this.list = new RoomList();
    this.list.on('select', (id) => {
      // showRoomDetail(id);
      this.emit('select', id);
    });
    this.detail = new RoomDetail();

    this.el.appendChild(this.list.dom());
    this.el.appendChild(this.detail.dom());
  }

  show(model={}) {
    this.detail.update(model);
  }

  updateList(model={}) {
    this.list.update(model);
  }

  updateListItem(model={}) {
    this.list.updateThumbnail(model.id, model.image);
  }

  updateElements() {
    // this.list.update();
    // this.detail.update();
  }

  update(model={}) {
    super.update(model);
    this.updateElements();
  }

  reset() {
    this.list.reset();
    this.detail.reset();
  }

  adjust() {
    this.list.adjust();
    this.detail.adjust();
  }
}

module.exports = Room;
