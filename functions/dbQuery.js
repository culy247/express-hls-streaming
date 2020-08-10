const { Videos, Video_groups, Admins, Category_maps, Categories, Tag_maps, Tags } = require('../models');
var { encrypt } = require('./common');

async function adminLogin(account, password, callback) {
    //패스워드 암호화
    password = await encrypt(password);
    await Admins.findOne({
        where: {
            account: account,
            password: password
        }
    }).then((result) => {
        callback(result);
    });
}

function getAllVideo_group(callback) {
    Video_groups.findAll().then(result => {
        callback(result);
    });
}

function getVideo_group(unique_id, callback) {
    Video_groups.findOne({
        where: {
            unique_id: unique_id
        }
    }).then(result => {
        callback(result);
    }).catch(err => {
        throw err;
    })
};

function getCategoriesByVideo_group(unique_id, callback) {
    let result = [];
    Category_maps.findAll({
        where: {
            video_group_unique_id: unique_id
        }
    }).then((result_category_maps) => {
        result_category_maps.forEach((category_map) => {
            Categories.findOne({
                where: {
                    id: category_map.category_id
                }
            }).then((result_categories) => {
                result.push(result_categories);
                if (result_category_maps.length === result.length) {
                    callback(result);
                }
            }).catch(err => {
                throw err;
            });
        });
    }).catch(err => {
        throw err;
    });
};

function getTagsByVideo_group(unique_id, callback) {
    let result = [];
    Tag_maps.findAll({
        where: {
            video_group_unique_id: unique_id
        }
    }).then((result_Tag_maps) => {
        result_Tag_maps.forEach((tag_map) => {
            Tags.findOne({
                where: {
                    id: tag_map.tag_id
                }
            }).then((result_tags) => {
                result.push(result_tags);
                if (result_Tag_maps.length === result.length) {
                    callback(result);
                }
            });
        });
    });
};

function getVideosCountByVideo_group(unique_id, callback) {
    Videos.count({
        where: {
            video_group_unique_id: unique_id
        }
    }).then(result => {
        callback(result);
    });
}

function getAllCategories(callback) {
    Categories.findAll().then((result) => {
        callback(result);
    });
}

function getAllTags(callback) {
    Tags.findAll().then((result) => {
        callback(result);
    });
}

function insertVideoGroup(param, callback) {
    Video_groups.create({
        unique_id: param.unique_id,
        title: param.title,
        img: param.img,
        service_yn: param.service_yn
    }).then(result => {
        callback();
    }).catch(err => {
        throw err;
    });
}

function updateVideoGroup(param, callback) {
    Video_groups.update({
        title: param.title,
        img: param.img,
        serivce_yn: param.service_yn
    }, {
        where: { unique_id: param.unique_id }
    }).then(result => {
        callback();
    }).catch(err => {
        throw err;
    });
}

function getCategoryUsedCount(category_id, callback) {
    Category_maps.count({
        where: {
            category_id: category_id
        }
    }).then(result => {
        callback(result);
    });
}

function getCategory(category_id, callback) {
    Categories.findOne({
        where: {
            id: category_id
        }
    }).then(result => {
        callback(result);
    }).catch(err => {
        throw err;
    })
}

function updateCategory_map(video_group_unique_id, category_ids, callback) {
    Category_maps.destroy({
        where: {
            video_group_unique_id: video_group_unique_id
        }
    }).then(result => {
        if (Array.isArray(category_ids)) {
            for (var i = 0; i < category_ids.length; i++) {
                Category_maps.create({
                    video_group_unique_id: video_group_unique_id,
                    category_id: category_ids[i]
                }).catch(err => {
                    throw err;
                });

                if (category_ids.length - 1 === i) {
                    callback();
                    break;
                }
            }
        } else { //배열이 아닐 경우
            let id = category_ids;
            Category_maps.create({
                video_group_unique_id: video_group_unique_id,
                category_id: id
            }).then(result => {
                callback();
            }).catch(err => {
                throw err;
            });
        }
    }).catch(err => {
        throw err;
    });
}

function updateTag_map(video_group_unique_id, tag_ids, callback) {
    Tag_maps.destroy({
        where: {
            video_group_unique_id: video_group_unique_id
        }
    }).then(result => {
        if (Array.isArray(tag_ids)) {
            for (var i = 0; i < tag_ids.length; i++) {
                Tag_maps.create({
                    video_group_unique_id: video_group_unique_id,
                    tag_id: tag_ids[i]
                }).catch(err => {
                    throw err;
                });

                if (tag_ids.length - 1 === i) {
                    callback();
                    break;
                }
            }
        } else {
            let id = tag_ids;
            Tag_maps.create({
                video_group_unique_id: video_group_unique_id,
                tag_id: id
            }).then(result => {
                callback();
            }).catch(err => {
                throw err;
            });
        }
    }).catch(err => {
        throw err;
    })
}

function getTagUsedCount(tag_id, callback) {
    Tag_maps.count({
        where: {
            tag_id: tag_id
        }
    }).then(result => {
        callback(result);
    })
}

//중복되는 카데고리 카운트
function getCategoryNameValid(name, callback) {
    Categories.count({
        where: {
            name: name
        }
    }).then(result => {
        callback(result);
    });
}

function insertCategory(param, callback) {
    Categories.create({
        name: param.name
    }).then(result => {
        callback();
    }).catch(err => {
        throw err;
    })
}

function deleteCategory(category_id, callback) {
    Categories.destroy({
        where: {
            id: category_id
        }
    }).then(result => {
        callback();
    }).catch(err => {
        throw err;
    });
}

//중복되는 카데고리 카운트
function getTagNameValid(name, callback) {
    Tags.count({
        where: {
            name: name
        }
    }).then(result => {
        callback(result);
    });
}

function insertTag(param, callback) {
    Tags.create({
        name: param.name
    }).then(result => {
        callback();
    }).catch(err => {
        throw err;
    })
}

function deleteTag(tag_id, callback) {
    Tags.destroy({
        where: {
            id: tag_id
        }
    }).then(result => {
        callback();
    }).catch(err => {
        throw err;
    });
}


function insertCategory_map(video_group_unique_id, category_ids, callback) {
    if (Array.isArray(category_ids)) {
        for (var i = 0; i < category_ids.length; i++) {
            Category_maps.create({
                video_group_unique_id: video_group_unique_id,
                category_id: category_ids[i]
            }).catch(err => {
                throw err;
            });

            if (category_ids.length - 1 === i) {
                callback();
                break;
            }
        }
    } else { //배열이 아닐 경우
        let id = category_ids;
        Category_maps.create({
            video_group_unique_id: video_group_unique_id,
            category_id: id
        }).then(result => {
            callback();
        }).catch(err => {
            throw err;
        });
    }
}

function insertTag_map(video_group_unique_id, tag_ids, callback) {
    if (Array.isArray(tag_ids)) {
        for (var i = 0; i < tag_ids.length; i++) {
            Tag_maps.create({
                video_group_unique_id: video_group_unique_id,
                tag_id: tag_ids[i]
            }).catch(err => {
                throw err;
            });

            if (tag_ids.length - 1 === i) {
                callback();
                break;
            }
        }
    } else {
        let id = tag_ids;
        Tag_maps.create({
            video_group_unique_id: video_group_unique_id,
            tag_id: id
        }).then(result => {
            callback();
        }).catch(err => {
            throw err;
        });
    }
}
function getVideos(video_group_unique_id, callback) {
    Videos.findAll({
        where: {
            video_group_unique_id: video_group_unique_id
        },
        order: [
            ['list_level', 'ASC']
        ]
    }).then(result => {
        callback(result);
    }).catch(err => {
        throw err;
    });
}

function getVideo(unique_id, callback) {
    Videos.findOne({
        where: { unique_id: unique_id }
    }).then(result => {
        callback(result);
    }).catch(err => {
        throw err;
    });
}

function insertVideo(param, callback) {
    Videos.max('list_level', {
        where: { video_group_unique_id: param.video_group_unique_id }
    }).then(max_list_level => {
        Videos.create({
            unique_id: param.unique_id,
            list_level: max_list_level + 1,
            video_group_unique_id: param.video_group_unique_id,
            title: param.title,
            subscript: param.subscript,
            m3u8: param.m3u8,
            release_date: param.release_date
        }).then(result => {
            callback();
        }).catch(err => {
            throw err;
        });
    }).catch(err => {
        throw err;
    });
}

function updateVideo(param, callback) {
    Videos.update({
        title: param.title,
        subscript: param.subscript,
        release_date: param.release_date
    }, {
        where: { unique_id: param.unique_id }
    }).then(result => {
        callback();
    }).catch(err => {
        throw err;
    })
}

function deleteVideo(unique_id, callback) {
    Videos.destroy(
        {
            where: { unique_id: unique_id }
        }).then(result => {
            callback();
        }).catch(err => {
            throw err;
        })
}

function updateVideoSort(new_ord, old_ord, video_group_unique_id, unique_id, callback) {
    console.log('enter');
    console.log(new_ord);
    console.log(old_ord);
    console.log(video_group_unique_id);
    console.log(unique_id);
    function final(callback) {
        Videos.update({ list_level: new_ord }, { where: { unique_id: unique_id } })
            .then(result => { callback(); })
            .catch(err => { throw err; });
    }

    if (old_ord - new_ord > 0) {//양수, 높은 순번에서 낮은 순번으로 이동할 때
        Videos.sequelize.query(`update videos set list_level = list_level+1 where video_group_unique_id = '${video_group_unique_id}' and list_level between ${Number(new_ord)} and ${Number(old_ord) - 1}`)
            .then(result => {
                final(() => {
                    callback();
                });
            }).catch(err => {
                throw err;
            });
    } else { //음수, 낮은 순번에서 높은 순번으로 이동할 때
        Videos.sequelize.query(`update videos set list_level = list_level-1 where video_group_unique_id = '${video_group_unique_id}' and list_level between ${Number(old_ord) + 1} AND ${Number(new_ord)}`)
            .then(result => {
                final(() => {
                    callback()
                });
            }).catch(err => {
                throw err;
            });
    }
    /*
    step
    1번이 4번으로 갈 경우에

    2번~4번 까지의 인덱스를 각각 -1
    (1초과 4 이하)

    기존의 1번을 4번으로 배속

    update videos set list_level = list_level-1 where ...

    old - new = 양수 일 경우
    ==
    step 4번이 1번으로 갈 경우에

    1 ~ 3 까지의 인덱스를 각각 +1

    update videos set list_level = list_level + 1 where ...
    old - new = 음수
    */
}

function deleteVideoGroup(video_group_unique_id, callback) {
    Video_groups.destroy({
        where: { unique_id: video_group_unique_id }
    }).then(result => {
        Videos.destroy({
            where: { video_group_unique_id: video_group_unique_id }
        }).then(result => {
            callback();
        }).catch(err => {
            throw err;
        });
    }).catch(err => {
        throw err;
    });
}

function serviceSwitch(unique_id, service_yn, callback) {
    Video_groups.update({ service_yn: service_yn }, {
        where: { unique_id: unique_id }
    }).then(result => {
        callback();
    }).catch(err => {
        throw err;
    })
}

function updateCategory(id, name, callback) {
    Categories.update({ name: name }, {
        where: { id: id }
    }).then(result => {
        callback();
    }).catch(err => {
        throw err;
    })
}

function updateTag(id, name, callback) {
    Tags.update({ name: name }, {
        where: { id: id }
    }).then(result => {
        callback();
    }).catch(err => {
        throw err;
    })
}

function getTag(tag_id, callback) {
    Tags.findOne({
        where: { id: tag_id }
    }).then(result => {
        callback(result);
    }).catch(err => {
        throw err;
    })
}

function getVideo_groupsByCategory(category_id, callback) {
    Category_maps.findAll({
        include:[{
            model: Video_groups
        }],
        where: {
            category_id: category_id
        },
        order: [
            ['id', 'DESC']
        ]
    }).then(result_video_group => {
        callback(result_video_group);
    }).catch(err => {
        throw err;
    });
}

function getVideo_groupsByTag(tag_id, callback) {
    Tag_maps.findAll({
        include:[{
            model: Video_groups
        }],
        where: {
            tag_id: tag_id
        },
        order: [
            ['id', 'DESC']
        ]
    }).then(result_video_group => {
        callback(result_video_group);
    }).catch(err => {
        throw err;
    });
}

module.exports = {
    adminLogin,
    getAllVideo_group,
    getCategoriesByVideo_group,
    getTagsByVideo_group,
    getVideosCountByVideo_group,

    insertVideoGroup,
    updateVideoGroup,

    getAllCategories,
    getAllTags,
    getCategoryUsedCount,
    getTagUsedCount,

    getCategoryNameValid,
    insertCategory,
    deleteCategory,

    getTagNameValid,
    insertTag,
    deleteTag,

    insertCategory_map,
    insertTag_map,
    getVideos,
    getVideo,
    getVideo_group,

    insertVideo,
    updateVideo,
    deleteVideo,
    updateVideoSort,

    deleteVideoGroup,

    serviceSwitch,
    updateCategory_map,
    updateTag_map,

    updateCategory,
    updateTag,

    getCategory,
    getVideo_groupsByCategory,
    getTag,
    getVideo_groupsByTag
}