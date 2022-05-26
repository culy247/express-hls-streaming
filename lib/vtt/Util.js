'use strict';

const FFmpeg = require('/opt/node_modules/fluent-ffmpeg');
const fs = require('fs');
const moment = require('/opt/node_modules/moment');
const Promise = require('/opt/node_modules/bluebird');

FFmpeg.setFfmpegPath('/opt/bin/ffmpeg');
FFmpeg.setFfprobePath('/opt/bin/ffprobe')
/**
 * generateThumbnails() callback
 *
 * @callback thumbnailsCallback
 * @param {Error} err Any kind of error
 * @param {string[]} filenames Thumbnails names
 */

/**
 * Generate thumbnails
 *
 * @param {string} input all the information
 */
exports.generateThumbnails = function ({ input, metadata} ) {
  return new Promise(function (resolve, reject) {
    new FFmpeg({source: input.inputVideo})
      .on('error', onError)
      .on('filenames', onFileName)
      .on('end', onSuccess)
      .takeScreenshots(
        {
          size: parseInt(input.options.thumbnailSize.width) + 'x' + input.options.thumbnailSize.height,
          timeMarks: input.options.timeMarks,
          filename: '%s.png'
        },
        input.options.outputThumbnailDirectory
      );

    function onFileName(filenames) {
      this.filenames = filenames;
    }

    function onError(err) {
      reject(err)
    }

    function onSuccess() {
      let files = this.filenames;
      resolve({ files, metadata} );
    }
  })
};


/**
 * metadata() callback
 *
 * @callback metadataCallback
 * @param {Error} err Any kind of error
 * @param {object} metadata Duration, size, etc.
 */

/**
 * Get simple metadata for video
 *
 * @param {string} inputVideo Path to video file
 */
exports.metadata = function (inputVideo) {
  return new Promise(function (resolve, reject) {
    FFmpeg.ffprobe(inputVideo, onData);

    function onData(err, metadata) {
      if (err) {
        reject(err)
      }

      let streams = metadata.streams || null;
      let stream;

      if (!streams) {
        reject(err)
      }

      while (stream = streams.shift()) {
        if (stream.codec_type === 'video') {
          const result = {
            duration: parseFloat(metadata.format.duration),
            width: parseInt(stream.width, 10),
            height: parseInt(stream.height, 10),
            fps: parseInt((stream.r_frame_rate || stream.avg_frame_rate).replace(/\/1/, ''), 10)
          };
          resolve(result)
        }
      }
      reject(new Error('Source video file does not have video stream.'))
    }
  })
};

exports.deleteFiles = function (files) {
  return new Promise(function (resolve, reject) {
    let i = files.length;
    files.forEach(function (path) {
      fs.unlink(path, function (err) {
        i--;
        if (err) {
          reject(err);
        } else if (i <= 0) {
          resolve(null);
        }
      });
    });
  })
};

/**
 * Create timemark from number
 *
 * @param {float|string} mark
 * @returns {string} Formatted timemark
 */
exports.toTimemark = function (mark) {
  const m = moment(mark + '', 'X.SSS');
  return m.utc().format('HH:mm:ss.SSS')
};
