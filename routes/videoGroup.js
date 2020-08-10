var express = require('express');
var router = express.Router();
var uuid4 = require('uuid4');
var multer = require('multer');
var fs = require('fs');
var async = require('async');

var storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'temp/'); },
    filename: function (req, file, cb) {
        var format = file.mimetype.split('/');
        format = format[1];
        cb(null, file.fieldname + '-' + Date.now() + '.' + format);
    }
});

var upload = multer({ storage: storage });

//db functions
const {
    getAllVideo_group, getCategoriesByVideo_group, getTagsByVideo_group, getVideosCountByVideo_group,
    getAllCategories, getAllTags, getVideo_group, getVideo_groupsByCategory, getVideo_groupsByTag, getCategory, getTag,
    insertVideoGroup, insertCategory_map, insertTag_map,
    deleteVideoGroup, serviceSwitch,
    updateVideoGroup, updateCategory_map, updateTag_map
} = require('../functions/dbQuery');

//session functions
const { loginSessionCheck } = require('../functions/session');

//전체 video_group 리스트 및 페이지 호출
router.get('/videoGroup', (req, res, next) => {
    loginSessionCheck(req, (flag) => {
        if (flag) { //세션 정보가 있다면
            const result = [];
            //video_group db call ========================
            getAllVideo_group((result_video_groups) => {
                if (result_video_groups.length > 0) {
                    result_video_groups.forEach((video_group) => {
                        async.waterfall([
                            function (callback) {
                                let items = [];
                                getCategoriesByVideo_group(video_group.unique_id, (result_categories) => {
                                    items.push(result_categories);
                                    callback(null, items);
                                });
                            },
                            function (items, callback) {
                                getTagsByVideo_group(video_group.unique_id, (result_tags) => {
                                    items.push(result_tags);
                                    callback(null, items);
                                });
                            },
                            function (items, callback) {
                                getVideosCountByVideo_group(video_group.unique_id, (result_videosCount) => {
                                    items.push(result_videosCount);
                                    callback(null, items);
                                });
                            }
                        ], function (err, items) {
                            if (err) { throw err };
                            result.push({
                                video_group: video_group,
                                categories: items[0],
                                tags: items[1],
                                videoCount: items[3]
                            });
                            //if data set complete, render main.ejs with data
                            if (result_video_groups.length === result.length) {
                                res.render('videoGroup', {
                                    account: req.session.account,
                                    video_groups: result
                                });
                            }
                        });
                    });
                    //video_group db call ========================
                } else { //if data null
                    res.render('videoGroup', {
                        account: req.session.account,
                        video_groups: null
                    });
                }
            });
        } else { //if no session data, redirect login page
            res.redirect('/');
        }
    });
});

//video_group 추가 페이지 및 데이터 호출
router.get('/videoGroup_add', (req, res, next) => {
    loginSessionCheck(req, (flag) => {
        if (flag) {
            getAllCategories((categories) => {
                getAllTags((tags) => {
                    res.render('videoGroup_add', {
                        account: req.session.account,
                        categories: categories,
                        tags: tags
                    });
                });
            });
        } else {
            res.redirect('/');
        }
    })
});

//video_group 신규 추가
router.post('/insertVideoGroup', upload.single('img'), (req, res, next) => {
    loginSessionCheck(req, (flag) => {
        if (flag) {
            let unique_id = uuid4();

            let videoGroup_param = {
                unique_id: unique_id,
                title: req.body.title,
                img: req.file.filename,
                service_yn: false
            }

            var category_ids = req.body.category;
            var tag_ids = req.body.tag;

            async.waterfall([
                function (callback) {
                    insertVideoGroup(videoGroup_param, () => { callback(); });
                },
                function (callback) {
                    insertCategory_map(unique_id, category_ids, () => { callback(); });
                },
                function (callback) {
                    insertTag_map(unique_id, tag_ids, () => { callback(); });
                }
            ], function (err) {
                fs.mkdir('hls/' + unique_id, (err) => {
                    fs.rename(req.file.path, 'hls/' + unique_id + '/' + req.file.filename, () => {
                        //remove temp img file at /temp
                        fs.unlink(req.file.path, (err) => { console.log(err); });
                        res.redirect('/videoGroup');
                    })
                });
            });
        } else {
            res.redirect('/');
        }
    });
});

//video_group 내용 수정 페이지 및 데이터 호출
router.get('/videoGroup_edit/:unique_id', (req, res, next) => {
    loginSessionCheck(req, (flag) => {
        if (flag) {
            let unique_id = req.params.unique_id;
            getVideo_group(unique_id, (result_video_group) => {
                if (result_video_group) {
                    async.waterfall([
                        function (callback) { //video_group에 설정된 categories
                            let items = [];
                            getCategoriesByVideo_group(unique_id, (result_categories) => {
                                items.push(result_categories);
                                callback(null, items);
                            });
                        },
                        function (items, callback) { //video_group에 설정된 tags
                            getTagsByVideo_group(unique_id, (result_tags) => {
                                items.push(result_tags); callback(null, items);
                            });
                        },
                        function (items, callback) { //db에 등록된 모든 categories
                            getAllCategories((categories) => {
                                callback(null, items, categories);
                            });
                        },
                        function (items, categories, callback) { //db에 등록된 모든 tags
                            getAllTags((tags) => {
                                callback(null, items, categories, tags);
                            })
                        }
                    ], function (err, items, categories, tags) {
                        res.render('video_group_edit', {
                            account: req.session.account,
                            video_group: {
                                video_group: result_video_group,
                                categories: items[0],
                                tags: items[1],
                            },
                            categories: categories,
                            tags: tags,
                        });
                    });
                } else {
                    res.redirect('/');
                }
            });
        } else {
            res.redirect('/');
        }
    });
});

//video_group 내용 수정
router.post('/updateVideoGroup', upload.single('img'), (req, res, next) => {
    loginSessionCheck(req, (flag) => {
        if (flag) {
            let param = {
                unique_id: req.body.unique_id,
                title: req.body.title,
                service_yn: false
            }

            let f_img = req.file;

            if (typeof f_img === 'undefined') {
                param.img = req.body.img_old;
            } else {
                param.img = f_img.filename;
            }

            var category_ids = req.body.category;
            var tag_ids = req.body.tag;

            async.waterfall([
                function(callback){
                    updateVideoGroup(param, () => { callback(); });
                },
                function(callback){
                    updateCategory_map(param.unique_id, category_ids, () => { callback(); });
                },
                function(callback){
                    updateTag_map(param.unique_id, tag_ids, () => { callback(); });
                }
            ], function(err){
                if(err){ throw err};
                fs.mkdir('hls/' + param.unique_id, (err) => {
                    if (f_img) { //업로드한 파일이 있다면, 임시 폴더에서 이동 후, 기존 이미지 파일 삭제
                        fs.rename(f_img.path, 'hls/' + param.unique_id + '/' + f_img.filename, () => { })
                    }
                });
                res.redirect('/videoGroup');
            });
        } else {
            res.redirect('/');
        }
    });
});

//video_group이 삭제 가능한 상태인지 체크
// 스트림 컨버트 작업이 진행 중일 때 삭제 못하게 하기 위함.
router.get('/isDeleteableVideoGroup', (req, res, next) => {
    let { getStateJson } = require('../functions/common');
    getStateJson((state) => {
        res.send(state.is_ffmpegWork);
    });
});

//video_group 삭제
router.get('/deleteVideoGroup/:unique_id', (req, res, next) => {
    let { getStateJson, deleteFolderRecursive } = require('../functions/common');
    loginSessionCheck(req, (flag) => {
        if (flag) {
            getStateJson((state) => {
                if (state.is_ffmpegWork === false) {
                    let unique_id = req.params.unique_id;
                    deleteVideoGroup(unique_id, () => {
                        deleteFolderRecursive('./hls/' + unique_id);
                        res.redirect('/videoGroup');
                    });
                } else {
                    res.redirect('/videoGroup');
                }
            });
        } else {
            res.redirect('/');
        }
    });
});

//스트림 서비스 스위칭
router.post('/serviceSwitch', (req, res, next) => {
    loginSessionCheck(req, (flag) => {
        if (flag) {
            let unique_id = req.body.data.unique_id;
            let service_yn = req.body.data.service_yn;

            serviceSwitch(unique_id, service_yn, () => {
                res.send(true);
            })
        } else {
            res.send(false);
        }
    });
});

// axios, video_group 정보를 수정할 때 videos 테이블에 영향을 줄만한 사안일 경우의 검증 처리용
//현재는 video_group row 삭제시에만 사용  
router.get('/videosCount/:unique_id', (req, res, next) => {
    let unique_id = req.params.unique_id;
    getVideosCountByVideo_group(unique_id, (result) => {
        res.send({ count: result });
    });
});

//sort by category
router.get('/videoGroup/category/:category_id', (req, res, next) => {
    let category_id = req.params.category_id;
    let result = [];
    loginSessionCheck(req, (flag) => {
        if (flag) { //로그인 여부
            getCategory(category_id, (result_category) => {
                if (result_category !== null) { //category parameter가 있는 경우
                    getVideo_groupsByCategory(category_id, (result_video_groups) => {
                        if (result_video_groups.length > 0) { // video_group이 카테고리를 가지고 있는 경우
                            //category 기준 필터링한 video_group 순환하며 카테고리, 태그 정보 호출
                            result_video_groups.forEach((video_group) => {
                                async.waterfall([
                                    function(callback){
                                        let items = [];
                                        getCategoriesByVideo_group(video_group["Video_group"].unique_id, (result_categories) => {
                                            items.push(result_categories);
                                            callback(null, items);
                                        });
                                    },
                                    function(items, callback){
                                        getTagsByVideo_group(video_group["Video_group"].unique_id, (result_tags) => {
                                            items.push(result_tags);
                                            callback(null, items);
                                        });
                                    },
                                    function(items, callback) {
                                        getVideosCountByVideo_group(video_group["Video_group"].unique_id, (result_videosCount) => {
                                            items.push(result_videosCount);
                                            callback(null, items);
                                        });
                                    }
                                ], function(err, items){
                                    if(err){throw err};
                                    //set data
                                    result.push({
                                        video_group: video_group["Video_group"],
                                        categories: items[0],
                                        tags: items[1],
                                        video_count: items[2]
                                    });
                                    //if data set complete, render main.ejs with data
                                    if (result_video_groups.length === result.length) {
                                        res.render('videoGroup_sort_category', {
                                            account: req.session.account,
                                            category: result_category,
                                            video_groups: result
                                        });
                                    }
                                });
                            }); //video_groups.forEach((video_group)
                        } else {
                            res.render('videoGroup_sort_category', {
                                account: req.session.account,
                                category: result_category,
                                video_groups: null
                            });
                        }
                    });
                } else {
                    res.redirect('/videoGroup');
                }
            });
        } else {
            res.redirect('/');
        }
    });
});

//sort by tag
router.get('/videoGroup/tag/:tag_id', (req, res, next) => {
    let tag_id = req.params.tag_id;
    let result = [];
    loginSessionCheck(req, (flag) => {
        if (flag) {
            getTag(tag_id, (result_tag) => {
                if (result_tag !== null) { //tag parameter가 있는 경우
                    getVideo_groupsByTag(tag_id, (result_video_groups) => {
                        if (result_video_groups.length > 0) {
                            //tag 기준 필터링한 video_group 순환하며 카테고리, 태그 정보 호출
                            result_video_groups.forEach((video_group) => {
                                async.waterfall([
                                    function(callback){
                                        let items = [];
                                        getCategoriesByVideo_group(video_group["Video_group"].unique_id, (result_categories) => {
                                            items.push(result_categories);
                                            callback(null, items);
                                        });
                                    },
                                    function(items, callback){
                                        getTagsByVideo_group(video_group["Video_group"].unique_id, (result_tags) => {
                                            items.push(result_tags);
                                            callback(null, items);
                                        });
                                    },
                                    function(items, callback) {
                                        getVideosCountByVideo_group(video_group["Video_group"].unique_id, (result_videosCount) => {
                                            items.push(result_videosCount);
                                            callback(null, items);
                                        });
                                    }
                                ], function(err, items){
                                    if(err){ throw err };

                                    result.push({
                                        video_group: video_group["Video_group"],
                                        categories: items[0],
                                        tags: items[1],
                                        videoCount: items[2]
                                    });
                                    //if data set complete, render main.ejs with data
                                    if (result_video_groups.length === result.length) {
                                        res.render('videoGroup_sort_tag', {
                                            account: req.session.account,
                                            tag: result_tag,
                                            video_groups: result
                                        });
                                    }
                                })
                            }); //video_groups.forEach((video_group)
                        } else {
                            res.render('videoGroup_sort_tag', {
                                account: req.session.account,
                                tag: result_tag,
                                video_groups: null
                            });
                        }
                    });
                } else {
                    res.redirect('/videoGroup');
                }
            });
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;