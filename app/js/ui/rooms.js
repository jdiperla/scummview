const html = require('./html');
const Component = require('./component');
const RoomList = require('./room_list');
const RoomDetail = require('./room_detail');

class Rooms extends Component {
  constructor(params={}) {
    super(params);

    this.el = html.div().class('rooms').dom();

    this.roomList = new RoomList();
    this.roomList.on('select', (id) => {
      this.emit('select', id);
    });
    this.el.appendChild(this.roomList.dom());

    this.roomDetail = new RoomDetail();
    this.el.appendChild(this.roomDetail.dom());
  }

  update(model={}) {
    super.update(model);
    this.roomList.update(this.model.list);
    this.roomDetail.update(this.model.detail);
  }

  // updateDetail(model={}) {
  //   this.roomDetail.update(model);
  // }
  //
  // updateList(model={}) {
  //   this.roomList.update(model);
  // }

  updateListItem(model={}) {
    this.roomList.updateThumbnail(model.id, model.image);
  }

  reset() {
    this.roomList.reset();
    this.roomDetail.reset();
  }

  clear() {
    this.roomList.clear();
    this.roomDetail.clear();
  }

  // adjust() {
  //   this.roomList.adjust();
  //   this.roomDetail.adjust();
  // }
}

module.exports = Rooms;
