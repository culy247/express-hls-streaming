'use strict';
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const vttGenerate = require('./vtt');
//======================================================================
const io = require("socket.io-client");
const socket = io('http://localhost:3000');

async function generateThumbnail(path, options, callback) {
    vttGenerate(path, options, function(err, metadata) {
        //console.dir(metadata)
        if( callback ){ callback(err, metadata) }
    });
}
//create stream file's
function hlsConvert(path, unique_id, m3u8_name, callback) {
    var path_split = path.split(/[/\,\\,//]/);
    var origin_f_name = path_split[path_split.length - 1];

    ffmpegWorkSwitch(true, () => { 
        createStreamFolder(`${unique_id}`, () => {

            ffmpeg(path).outputOptions([
                '-profile:v', 'baseline',
                '-level', '3.0',
                '-start_number', '0',
                '-hls_time', '10',
                '-hls_list_size', '0',
                '-f', 'hls'
            ])
            .output(`./hls/${unique_id}/${m3u8_name}.m3u8`)
            .on('progress', function (progress) {
                var data = {
                    log: `[Stream Convert]: ${origin_f_name} - ${m3u8_name}.m3u8 | ${progress.percent.toFixed(2)} % done`
                }
                console.log(data.log);
                socket.emit('ffmpeg-progress', data);
            })
            .on('end', function (err, stdout, stderr) {
                console.log('Finished processing!' /*, err, stdout, stderr*/);
                console.log('create screen shot...');
                
                ffmpeg(path).outputOptions([
                    '-f', 'image2',
                    '-t', '0.001',
                    '-ss', '10'
                ])
                .output(`./hls/${unique_id}/${m3u8_name}.jpg`)
                .on('progress', function (progress) {
                    console.log('processing: ', progress);
                })
                .on('end', function (err, stdout, stderr) {
                    var data = {
                        log: `[Create Thumbnail]: ${m3u8_name}.jpg`
                    }
                    console.log(data.log);
                    socket.emit('ffmpeg-progress', data);
                    ffmpegWorkSwitch(false, () => {
                        var data = {
                            log: `===== [${origin_f_name}] Processing Finished! =====`
                        }
                        console.log(data.log);
                        socket.emit('ffmpeg-progress', data);
                        callback();
                    });
                }).run();
            }).run();
        });
    });
}

function ffmpegWorkSwitch(flag, callback) {
    fs.readFile('./temp/state.json', 'utf8', function (err, data) {
        var state = JSON.parse(data);
        state.is_ffmpegWork = flag;
        state = JSON.stringify(state);
        fs.writeFile('./temp/state.json', state, (err) => {
            if (err) throw err;
            callback();
        });
    });
}

function getStateJson(callback) {
    fs.readFile('./temp/state.json', 'utf8', function (err, data) {
        var state = JSON.parse(data);
        callback(state);
    });
}

function createStreamFolder(video_group_unique_id, callback) {
    if (!fs.existsSync('./hls/' + video_group_unique_id)) {
        fs.mkdirSync('./hls/' + video_group_unique_id);
    }
    callback();
}

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

module.exports = {
    hlsConvert,
    deleteFolderRecursive,
    getStateJson,
    generateThumbnail
}
