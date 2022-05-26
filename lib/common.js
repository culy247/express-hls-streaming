'use strict';
const Promise = require('/opt/node_modules/bluebird');
const vttGenerate = require('./vtt');

async function generateThumbnail(path, options) {
    return new Promise( (resolve, reject) => {
        vttGenerate(path, options, function(err, metadata) {
            resolve({err, metadata})
        });
    } )
}

module.exports = {
    generateThumbnail
}
