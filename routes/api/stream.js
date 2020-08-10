var express = require('express');
var router = express.Router();
//file system
const fs = require('fs');

// 스트리밍 파일 요청
//참고 자료 https://gist.github.com/julianfresco/c921d0102c1cdde5b78749ce660cb748
router.get('/stream/:video_group_unique_id/:unique_id/:f_name', (req, res, next) => {
    //need user, stream yn check

    // ==========================
    let video_group_unique_id = req.params.video_group_unique_id;
    let unique_id = req.params.unique_id;
    let f_name = req.params.f_name;

    let f_path = `${__dirname}/../../hls/${video_group_unique_id}/${unique_id}/${f_name}`;

    fs.stat(f_path, (err, stats) => {
        if (!stats || err) {
            res.status(404).end();
        } else {
            var f_ext = f_path.slice(f_path.lastIndexOf('.'));

            //클라이언트에서 m3u8 요청을 보내면 목록에 있는 ts 파일을 순차적으로 요청한다.
            // m3u8과 ts 요청 분기처리 로직
            switch (f_ext) {
                case '.m3u8':
                    res.status(200).set('Content-Type', 'application/vnd.apple.mpegurl');
                    fs.createReadStream(f_path).pipe(res);
                    break;
                case '.ts':
                    res.status(200).set('Content-Type', 'video/MP2T');
                    fs.createReadStream(f_path).pipe(res);
                    break;
                default:
                    res.status(404).send(`Unexpected file type ${f_ext}`);
            }
        }
    })
});

module.exports = router;
