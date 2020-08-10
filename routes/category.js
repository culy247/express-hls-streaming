var express = require('express');
var router = express.Router();

const { 
    getAllCategories, 
    getCategoryUsedCount, 
    getCategoryNameValid,
    insertCategory,
    updateCategory,
    deleteCategory
} = require('../functions/dbQuery');

const {
    loginSessionCheck
} = require('../functions/session');

router.get('/category', (req, res, next) => {
    let result = [];

    loginSessionCheck(req, (flag) => {
        if (flag) { //세션 정보가 있다면
            getAllCategories((result_categories) =>{
                if(result_categories.length > 0 ){
                    result_categories.forEach((category) => {
                        getCategoryUsedCount(category.id, (result_usedCount) => {
                            result.push({category : category, usedCount : result_usedCount});
                            if(result_categories.length === result.length) {
                                res.render('category', { account: req.session.account, categories: result });
                            }
                        });
                    });
                }else{
                    res.render('category', {
                        account: req.session.account,
                        categories: null
                    });
                }
            });
        } else { //if no session data, redirect login page
            res.redirect('/');
        }
    });
});


router.post('/categoryValid', (req, res, next) =>{
    let name = req.body.name;
    getCategoryNameValid(name ,(count) =>{
        if(count > 0) {
            res.send(false);
        }else{
            res.send(true);
        }
    });
});

router.post('/insertCategory', (req, res, next) => {
    let param = {
        name: req.body.name
    };

    loginSessionCheck(req, (flag) => {
        if (flag) { //세션 정보가 있다면
            getCategoryNameValid(param.name, (count) =>{
                if(count > 0) {
                    res.redirect('/category');
                }else{
                    insertCategory(param, () => {
                        res.redirect('/category');
                    });
                }
            });
        }else{
            res.redirect('/');
        }
    });
});

router.get('/getCategoryUsedCount/:id', (req, res , next) =>{
    let id = req.params.id;
    getCategoryUsedCount(id, (result) =>{
        res.send({count:result});
    });
});

router.get('/deleteCategory/:id', (req, res, next) => {
    let id = req.params.id;

    loginSessionCheck(req, (flag) => {
        if(flag){
            getCategoryUsedCount(id, (result) =>{
                if(result <= 0){
                    deleteCategory(id, () => {
                        res.redirect('/category');
                    });
                }else{
                    res.redirect('/category');
                }
            });
        }else{
            res.redirect('/');
        }
    });
});

router.post('/updateCategory', (req, res, next) =>{
    let id = req.body.id;
    let name = req.body.name;
    loginSessionCheck(req, (flag) => {
        if(flag){
            getCategoryNameValid(name ,(count) =>{
                if(count > 0) {
                    res.send(false);
                }else{
                    updateCategory(id, name, () =>{
                        res.send(true);
                    });
                }
            });
        }else {
            res.send(false);
        }
    });
});

module.exports = router;