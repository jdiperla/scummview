const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const Graphics = require('./graphics');
const Scumm = require('./engine/scumm');

// md5 hash generated from background image of game's first room
const IMAGE_HASHES = {
  'b8210cdbbc0bba35d3cf6493f2650563': { id: 'zakenhanced', title: 'Zak McKracken and the Alien Mindbenders', version: '2' },
  '0df3a3876576a974a6c71a4cbb2e114b': { id: 'loomdemo', title: 'Loom Demo', version: '3.5.20' },
  // '0df3a3876576a974a6c71a4cbb2e114b': { name: 'loomdemoshort', ver: '3.5.37' },
  'bfc3b12a06107ffcd091ce06a00a02b3': { id: 'loom', title: 'Loom', version: '3.5.37' },
  '86c9eeb0638d7196f86897c7946ee276': { id: 'loomalt', title: 'Loom (alt)', version: '3.5.40' },
  '962516d84a568feffcd4e1baf39eea86': { id: 'indy3', title: 'Indiana Jones and the Last Crusade', version: '3.?' },
  // 'cc970d1111e50e9d8af83c60b3825bc7': { id: 'monkey', name: 'The Secret of Monkey Island', version: '4.0.62' }
  'da937fa3d5c3157b3f82321fa459ea36': { id: 'monkey', title: 'The Secret of Monkey Island', version: '4.0.62' }
};

class Detector {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.version = Detector.detectMajorVersion(this.rootPath);
  }

  static gameInfoFromHash(hash) {
    let gameInfo;
    for (let item in IMAGE_HASHES) {
      if (item === hash) {
        let info = IMAGE_HASHES[item];
        gameInfo = {
          id: info.id,
          title: info.title,
          version: info.version
        };
        break;
      }
    }
    return gameInfo;
  }

  static nameFromHash(hash) {
    let name;
    for (let item in IMAGE_HASHES) {
      if (item === hash) {
        name = IMAGE_HASHES[item].title;
        break;
      }
    }
    return name;
  }

  static detectMajorVersion(rootPath) {
    let version;
    try {
      // version 2 or 3 ?
      fs.accessSync(path.join(rootPath, '00.lfl'), fs.constants.F_OK | fs.constants.R_OK);
      try {
        // version 3?
        fs.accessSync(path.join(rootPath, '99.lfl'), fs.constants.F_OK | fs.constants.R_OK);
        return 3;
      } catch (err) {
        // version 1 or 2?
      }
      try {
        // Version 2?
        fs.accessSync(path.join(rootPath, '58.lfl'), fs.constants.F_OK | fs.constants.R_OK);
        return 2;
      } catch (err) {
      }
    } catch (err) {
    }
    try {
      // Version 4?
      fs.accessSync(path.join(rootPath, '000.lfl'), fs.constants.F_OK | fs.constants.R_OK);
      return 4;
    } catch (err) {
    }
    return 0;
  }

}

module.exports = Detector;
