var express = require('express');
var router = express.Router();

const {
    getAllTags,
    getTagUsedCount,
    getTagNameValid,
    insertTag,
    updateTag,
    deleteTag
} = require('../functions/dbQuery');

const {
    loginSessionCheck
} = require('../functions/session');

router.get('/tag', (req, res, next) => {
    let result = [];

    loginSessionCheck(req, (flag) => {
        if (flag) { //세션 정보가 있다면
            getAllTags((result_tags) => {
                if (result_tags.length > 0) {
                    result_tags.forEach((tag) => {
                        getTagUsedCount(tag.id, (result_used_count) => {
                            result.push({
                                tag: tag,
                                used_count: result_used_count
                            });
                            if (result_tags.length === result.length) {
                                res.render('tag', {
                                    account: req.session.account,
                                    tags: result
                                });
                            };
                        });
                    });
                } else {
                    res.render('tag', {
                        account: req.session.account,
                        tags: null
                    });
                }
            });
        } else { //if no session data, redirect login page
            res.redirect('/');
        }
    });
});

router.post('/tagValid', (req, res, next) => {
    let name = req.body.name;

    loginSessionCheck(req, (flag) => {
        if (flag) { //세션 정보가 있다면
            getTagNameValid(name, (count) => {
                if (count > 0) {
                    res.send(false);
                } else {
                    res.send(true);
                }
            });
        } else { //if no session data, redirect login page
            res.redirect('/');
        }
    });
});

router.post('/insertTag', (req, res, next) => {
    let param = {
        name: req.body.name
    };

    loginSessionCheck(req, (flag) => {
        if (flag) { //세션 정보가 있다면
            getTagNameValid(param.name, (count) => {
                if (count > 0) {
                    res.redirect('/tag');
                } else {
                    insertTag(param, () => {
                        res.redirect('/tag');
                    });
                }
            });
        } else {
            res.redirect('/');
        }
    });
});

router.get('/getTagUsedCount/:id', (req, res, next) => {
    let id = req.params.id;
    getTagUsedCount(id, (result) => {
        res.send({ count: result });
    })
})

router.get('/deleteTag/:id', (req, res, next) => {
    let id = req.params.id;

    loginSessionCheck(req, (flag) => {
        if (flag) {
            getTagUsedCount(id, (result) => {
                if(result <= 0) {
                    deleteTag(id, () => {
                        res.redirect('/tag');
                    });
                } else {
                    res.redirect('/tag');
                }
            });
        } else {
            res.redirect('/');
        }
    });
});

router.post('/updateTag', (req, res, next) => {
    let id = req.body.id;
    let name = req.body.name;
    loginSessionCheck(req, (flag) => {
        if (flag) {
            getTagNameValid(name, (count) => {
                if (count > 0) {
                    res.send(false);
                } else {
                    updateTag(id, name, () => {
                        res.send(true);
                    });
                }
            });
        } else {
            res.send(false);
        }
    });
});

module.exports = router;