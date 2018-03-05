const html = require('./html');
const Component = require('./component');
const RoomList = require('./room_list');
const RoomDetail = require('./room_detail');

class Rooms extends Component {
  constructor(params={}) {
    super(params);


    this.el = html.div().class('rooms').dom();

    this.list = new RoomList();
    this.list.on('select', (id) => {
      this.emit('select', id);
    });
    this.el.appendChild(this.list.dom());

    this.detail = new RoomDetail();
    this.el.appendChild(this.detail.dom());
  }

  updateDetail(model={}) {
    this.detail.update(model);
  }

  updateList(model={}) {
    this.list.update(model);
  }

  updateListItem(model={}) {
    this.list.updateThumbnail(model.id, model.image);
  }

  reset() {
    this.list.reset();
    // this.detail.reset();
  }

  adjust() {
    this.list.adjust();
    // this.detail.adjust();
  }
}

module.exports = Rooms;
