'use strict';
const crypto = require('crypto');
const disk = require('diskusage');
const os = require('os');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
//======================================================================
//스트리밍 컨버팅 작업을 위한 socket
const io = require("socket.io-client");
const socket = io('http://localhost:3000');
//======================================================================

//using password...
function encrypt(str) {
    var hash = crypto.createHash('sha256').update(str).digest('base64');
    return hash;
}

function systemInfo(callback) {
    disk.check(`${__dirname}`, (err, diskSpace) =>{
        let disk_info = {
            free: (diskSpace.free / (1024 * 1024 * 1024)).toFixed(1),
            total: (diskSpace.total / (1024 * 1024 * 1024)).toFixed(1)
        }

        let mem_info = { //memory, convert to gb data / (1024 * 1024 * 1024)
            freemem: (os.freemem() / (1024 * 1024 * 1024)).toFixed(2),
            totalmem: (os.totalmem().toFixed(2) / (1024 * 1024 * 1024)).toFixed(2)
        };

        let os_info = {
            type: os.type(),
            arch: os.arch(),
            platform: os.platform()
        };

        let cpu_info = os.cpus();

        callback({ os_info, mem_info, disk_info, cpu_info });
    });
}

//create stream file's
function hlsConvert(path, video_group_unique_id, unique_id, m3u8_name, callback) {
    var path_split = path.split(/[/\,\\,//]/);
    var origin_f_name = path_split[path_split.length - 1];

    ffmpegWorkSwitch(true, () => { //스트리밍 컨버트 작업 여부 true
        createStreamFolder(`${video_group_unique_id}/${unique_id}`, () => {

            ffmpeg(path).outputOptions([
                '-profile:v', 'baseline',
                '-level', '3.0',
                '-start_number', '0',
                '-hls_time', '10',
                '-hls_list_size', '0',
                '-f', 'hls'
            ])
            .output(`./hls/${video_group_unique_id}/${unique_id}/${m3u8_name}.m3u8`)
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
                //스크린샷 추출.. 영상 시작 10초에서 추출한다.
                ffmpeg(path).outputOptions([
                    '-f', 'image2',
                    '-t', '0.001',
                    '-ss', '10'
                ])
                .output(`./hls/${video_group_unique_id}/${unique_id}/${m3u8_name}.jpg`)
                .on('progress', function (progress) {
                    console.log('processing: ', progress);
                })
                .on('end', function (err, stdout, stderr) {
                    var data = {
                        log: `[Create Thumbnail]: ${m3u8_name}.jpg`
                    }
                    console.log(data.log);
                    socket.emit('ffmpeg-progress', data);
                    ffmpegWorkSwitch(false, () => { //스트리밍 컨버트 작업 여부 false
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
    encrypt,
    systemInfo,
    hlsConvert,
    deleteFolderRecursive,
    getStateJson
}