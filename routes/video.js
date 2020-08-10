var express = require('express');
var router = express.Router();
var uuid4 = require('uuid4');

var fs = require('fs');

const {
    getVideo_group,
    getVideos,
    getVideo,
    getCategoriesByVideo_group,
    getTagsByVideo_group,
    insertVideo,
    updateVideo,
    deleteVideo,
    updateVideoSort

} = require('../functions/dbQuery');

const { loginSessionCheck } = require('../functions/session');
const async = require('async');

router.get('/video/:video_group_unique_id', (req, res, next) => {
    loginSessionCheck(req, (flag) => {
        if (flag) { //세션 정보가 있다면
            let video_group_unique_id = req.params.video_group_unique_id;
            getVideo_group(video_group_unique_id, (result_video_group) => {
                if( result_video_group != null){
                    async.waterfall([
                        function(callback){
                            let items = [];
                            getCategoriesByVideo_group(video_group_unique_id, (result_categories) => {
                                items.push(result_categories);
                                callback(null, items);
                            });
                        },
                        function(items, callback){
                            getTagsByVideo_group(video_group_unique_id, (result_tags) => {
                                items.push(result_tags);
                                callback(null, items);
                            });
                        },
                        function(items, callback){
                            getVideos(video_group_unique_id, (result_videos) => {
                                items.push(result_videos);
                                callback(null, items);
                            });
                        }
                    ], function(err, items){
                        if(err) { throw err };
                        res.render('video', {
                            account: req.session.account,
                            video_group: result_video_group,
                            categories: items[0],
                            tags: items[1],
                            videos: items[2]
                        });
                    });
                } else { //잘못된 접근
                    res.redirect('/');
                }
            });
        } else { //if no session data, redirect login page
            res.redirect('/');
        }
    });
});

router.get('/video_add/:video_group_unique_id', (req, res, next) => {
    loginSessionCheck(req, (flag) => {
        if (flag) { //세션 정보가 있다면
            let video_group_unique_id = req.params.video_group_unique_id;
            getVideo_group(video_group_unique_id, (video_group) => {
                res.render('video_add', {
                    account: req.session.account,
                    video_group: video_group,
                });
            });
        } else { //if no session data, redirect login page
            res.redirect('/');
        }
    });
});

router.get('/video_edit/:unique_id', (req, res, next) => {
    loginSessionCheck(req, (flag) => {
        if (flag) { //세션 정보가 있다면
            let unique_id = req.params.unique_id;
            getVideo(unique_id, (video) => {
                getVideo_group(video.video_group_unique_id, (video_group) => {
                    res.render('video_edit', {
                        account: req.session.account,
                        video_group: video_group,
                        video: video,
                    });
                });
            });
        } else { //if no session data, redirect login page
            res.redirect('/');
        }
    });
});

//파일 경로 검증용
router.post('/videoExistValid', (req, res, next) => {
    let video_path = req.body.path.trim();
    console.log(video_path);
    let path = require('path');
    let ext = path.parse(video_path).ext.toLowerCase().trim();
    console.log(fs.existsSync(video_path));
    console.log(fs.existsSync(video_path));
    console.log(fs.existsSync(video_path));
    console.log(fs.existsSync(video_path));
    console.log(fs.existsSync(video_path));
    console.log(fs.existsSync(video_path));

    if (fs.existsSync(video_path)) {
        if (ext == '.mp4' || ext == '.avi' || ext == '.mkv') {
            res.send(true);
        } else {
            res.send(false);
        }
    } else {
        res.send(false);
    }
});

router.post('/insertVideo', (req, res, next) => {
    loginSessionCheck(req, (flag) => {
        if (flag) {
            let { hlsConvert } = require('../functions/common');

            //io object
            let video_path = req.body.video_path.trim();

            let param = {
                video_group_unique_id: req.body.video_group_unique_id,
                unique_id: uuid4(),
                title: req.body.title.trim(),
                subscript: req.body.subscript.trim(),
                m3u8: uuid4(),
                release_date: req.body.release_date
            }

            //파일 변환
            hlsConvert(video_path, param.video_group_unique_id, param.unique_id, param.m3u8, () => {
                insertVideo(param, () => {});
            });
            res.redirect(`/`);
            //res.redirect(`/video/${ param.video_group_unique_id }`);
        } else {
            res.redirect('/');
        }
    });
});

router.post('/updateVideo', (req, res, next) => {
    let param = {
        unique_id : req.body.unique_id,
        title: req.body.title,
        subscript: req.body.subscript,
        release_date: req.body.release_date
    }

    updateVideo(param, () =>{
        res.redirect(`/video/${ req.body.video_group_unique_id }`)
    });
});

router.post('/updateVideoSort', (req, res, next) => {
    let new_ord = req.body.new_ord;
    let old_ord = req.body.old_ord;
    let video_group_unique_id = req.body.video_group_unique_id;
    let unique_id =req.body.unique_id;

    updateVideoSort(new_ord, old_ord, video_group_unique_id, unique_id, (result) =>{
        console.log(result);
        res.send(true);
    });
});

router.post('/deleteVideo', (req, res, next)=>{
    let { deleteFolderRecursive } = require('../functions/common');
    loginSessionCheck(req, (flag) => {
        if (flag) {
            let unique_id = req.body.unique_id;
            getVideo(unique_id,(result_video) => {
                deleteVideo(unique_id, () => {
                    deleteFolderRecursive(`./hls/${result_video.video_group_unique_id}/${result_video.unique_id}`);
                    res.send(true);
                });
            });
        }else {
            res.send(false);
        }
    });
});

module.exports = router;