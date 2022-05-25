var express = require('express');
var router = express.Router();
var uuid4 = require('uuid4');
var fs = require('fs-extra');
var path = require('path');

var { hlsConvert, generateThumbnail } = require('../functions/common');
const uploadPath = path.join(__dirname, '/../storage/');
fs.ensureDir(uploadPath);

router.post('/upload', (req, res, next) => {
    req.pipe(req.busboy);

    req.busboy.on('file', (fileName, file, info) => {
        console.log(`Upload of '${fileName}' started`);
        const filePath = path.join(uploadPath, fileName + '.mp4');
        const stream = fs.createWriteStream(filePath);
        file.pipe(stream);
        stream.on('close', () => {
            console.log(`Upload of '${filePath}' finished`);
            //io object
            let param = {
                unique_id: uuid4(),
                m3u8: uuid4(),
                fileName: fileName
            }
            
            hlsConvert(filePath, param.unique_id, param.m3u8, function() {
                generateThumbnail(`${__dirname}/../storage/${fileName}.mp4`, {
                    outputDirectory: `${__dirname}/../hls/${param.unique_id}`,
                    outputFileName: 'sprite',
                    secondsPerThumbnail: true,
                    thumbnailSize: {
                        width: 200,
                        height: 150
                    },
                    spriteImages: true,
                    spritesImagePath: '/',
                }, function(error, metadata) {
                    //console.log('On callback', error, metadata )
                });
            });
            res.redirect(`/`);
        });
    });
});

module.exports = router;
