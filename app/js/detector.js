const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const Graphics = require('./graphics');
const Game = require('./game');

// md5 hash generated from background image of game's first room
const IMAGE_HASHES = {
  '0df3a3876576a974a6c71a4cbb2e114b': { id: 'loomdemo', name: 'Loom Demo', version: '3.5.20' },
  // '0df3a3876576a974a6c71a4cbb2e114b': { name: 'loomdemoshort', ver: '3.5.37' },
  'bfc3b12a06107ffcd091ce06a00a02b3': { id: 'loom', name: 'Loom', version: '3.5.37' },
  '86c9eeb0638d7196f86897c7946ee276': { id: 'loomalt', name: 'Loom (alt)', version: '3.5.40' },
  '962516d84a568feffcd4e1baf39eea86': { id: 'indy3', name: 'Indiana Jones and the Last Crusade', version: '3.?' },
  // 'cc970d1111e50e9d8af83c60b3825bc7': { id: 'monkey', name: 'The Secret of Monkey Island', version: '4.0.62' }
  'da937fa3d5c3157b3f82321fa459ea36': { id: 'monkey', name: 'The Secret of Monkey Island', version: '4.0.62' }
};

class Detector {

  static gameInfoFromHash(hash) {
    let gameInfo;
    for (let item in IMAGE_HASHES) {
      if (item === hash) {
        let info = IMAGE_HASHES[item];
        gameInfo = {
          id: info.id,
          name: info.name,
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
        name = IMAGE_HASHES[item].name;
        break;
      }
    }
    return name;
  }

  static detectMajorVersion(rootPath) {
    let version;
    try {
      fs.accessSync(path.join(rootPath, '00.lfl'), fs.constants.F_OK | fs.constants.R_OK);
      // version 2 or 3
      try {
        fs.accessSync(path.join(rootPath, '99.lfl'), fs.constants.F_OK | fs.constants.R_OK);
        // version 3
        return 3;
      } catch (err) {
        // console.log(err.message);
        // guessing version 2
        return 2;
      }
    } catch (err) {
      // console.log(err.message);
    }
    try {
      fs.accessSync(path.join(rootPath, '000.lfl'), fs.constants.F_OK | fs.constants.R_OK);
       // version 4
       return 4;
    } catch (err) {
      // console.log(err.message);
    }
    return 0;
  }

}

module.exports = Detector;
