function categoryInsertSubmit() {
    let form = document.getElementById('categoryInsertForm');
    let name = (form.name.value).trim();

    if (name.length <= 0) {
        alert('Please Input Category Name');
        return;
    }
    axios.post('/categoryValid', { name: name }).then(result => {
        if (result.data) {
            form.submit();
        } else {
            alert('Category name Is Duplicated!')
        }
    }).catch(err => {
        alert(err);
    });
}

function categoryDelete(id, name) {
    let result = confirm(`Do you want Delete this Category? [ ${name} ]`);
    if (result) {
        axios.get(`/getCategoryUsedCount/${id}`).then(result => {
            if (result.data.count > 0) {
                alert('The category cannot be delete.\nThere is a video group using this category.')
            } else {
                window.location.href = `/deleteCategory/${id}`;
            }
        })
    }
}

function tagDelete(id, name) {
    let result = confirm(`Do you want Delete this Tag? [ ${name} ]`)
    if(result) {
        axios.get(`/getTagUsedCount/${id}`).then(result => {
            if(result.data.count > 0 ){
                alert('The Tag cannot be delete.\nTher is a video group using this category.');
            } else {
                window.location.href = `/deleteTag/${id}`;
            }
        });
    }

}

function tagInsertSubmit() {
    let form = document.getElementById('tagInsertForm');
    let name = (form.name.value).trim();

    if (name.length <= 0) {
        alert('Please Input Tag Name');
        return;
    }

    axios.post('/tagValid', { name: name }).then(result => {
        if (result.data) {
            form.submit();
        } else {
            alert('Tag name Is Duplicated!');
        }
    }).catch(err => {
        alert(err);
    });
}
//===========================================================
function updateVideoSort(new_ord, old_ord, video_group_unique_id, unique_id) {
    axios.post('/updateVideoSort', {
        new_ord: new_ord,
        old_ord: old_ord,
        video_group_unique_id: video_group_unique_id,
        unique_id: unique_id
    }).then(result => {
        location.reload();
    }).catch(err => {
        alert(err);
    });
}
//===========================================================
//using for video, video_group
function img_preview(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('img_view').setAttribute('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}
//컨테이너에 태그, 카테고리 적재
function container_loader(container_name, e) {
    let id = e.options[e.selectedIndex].value;
    let name = e.options[e.selectedIndex].text;
    let data_list = document.getElementsByName(container_name);

    if (id !== '') {
        //컨테이너 데이터 검사
        container_data_valid(data_list, id, function (result) {
            if (result) {
                var container = document.getElementById(container_name + '_container');
                //=======================================
                var data_node = document.createElement('input');
                data_node.setAttribute('type', 'hidden');
                data_node.setAttribute('name', container_name);
                data_node.setAttribute('value', id);
                //=======================================
                var li_node = document.createElement('li');
                var li_text = document.createTextNode(name);
                var a_node = document.createElement('a');

                var i_node = document.createElement('i');
                i_node.setAttribute('class','fas fa-times');


                a_node.setAttribute('href', `javascript:container_discharger('${container_name}','${id}')`);
                a_node.setAttribute('class', 'btn btn-danger btn-sm');
                a_node.appendChild(i_node);

                li_node.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-center');
                li_node.setAttribute('id', id);
                li_node.appendChild(li_text);
                li_node.appendChild(a_node);
                li_node.appendChild(data_node);
                //=======================================
                container.appendChild(li_node);
            }
        });
    }
    e.selectedIndex = 0;
}

//컨테이너에 태그, 카테고리 삭제
function container_discharger(container_name, id) {
    var container = document.getElementById(container_name + '_container');
    var children = container.childNodes;

    children.forEach((child) => {
        if (child.id === id) {
            console.log('delete node');
            child.remove();
        }
    });
}

//이미 로드 된 카테고리 ,태그를 중복으로 올리지 않도록 검사
function container_data_valid(data_list, id, callback) {
    if (data_list.length === 0) {
        callback(true);
    } else {
        for (var i = 0; i < data_list.length; i++) {
            if (data_list[i].value == id) {
                callback(false);
                break;
            }
            if (data_list.length - 1 == i) {
                callback(true);
                break;
            }
        };
    }
}

//submit 하기 전 videoGroup 데이터 검증
//객체 전달이 없으므로 update, insert 공용으로 사용
function videoGroupValid(router_name) {
    var category_container_list = document.getElementsByName('category');
    var tag_container_list = document.getElementsByName('tag');
    var title = document.getElementById('title').value.trim();
    var img = document.getElementById('img');
    if (title.length <= 0) {
        alert('not set title');
        return false;
    }
    //img process
    if (router_name == 'insert') {
        if (img.value.length <= 0) {
            alert('not set img');
            return false;
        }
    }

    if (category_container_list.length <= 0) {
        alert('not set category');
        return false;
    }
    if (tag_container_list.length <= 0) {
        alert('not set tag');
        return false;
    }
}
//submit 하기 전 video 데이터 검증
function videoUpdateValid(){
    var title = document.getElementById('title').value.trim();
    var subscript = document.getElementById('subscript').value.trim();
    var release_date = document.getElementById('release_date').value;

    if (title.length <= 0) {
        alert('title is not set');
        return;
    }
    if (subscript.length <= 0) {
        alert('subscript is not set');
        return;
    }

    if (release_date.length <= 0) {
        alert('release date is not set');
        return;
    }

    document.getElementById('videoUpdateForm').submit();

}

//submit 하기 전 video 데이터 검증
//video 객체 유효성 검사로 인해 해당 함수는 update와 공유하지 않는다.
function videoInsertValid() {
    var title = document.getElementById('title').value.trim();
    var subscript = document.getElementById('subscript').value.trim();
    var release_date = document.getElementById('release_date').value;
    var video_path = document.getElementById('video_path').value.trim();

    if (title.length <= 0) {
        alert('title is not set');
        return;
    }
    if (subscript.length <= 0) {
        alert('subscript is not set');
        return;
    }

    if (release_date.length <= 0) {
        alert('release date is not set');
        return;
    }

    if (video_path.length <= 0) {
        alert('video file path is not set');
        return;
    } else {
        axios.post('/videoExistValid', { path: video_path }).then(result => {
            if (result.data) {
                if (confirm('스트림 파일 컨버팅은 비동기로 수행합니다.\n컨버팅이 완료된 후에 리스트가 업데이트 됩니다.\n컨버팅을 수행 할까요?')) {
                    document.getElementById('videoInsertForm').submit();
                } else {
                    return;
                }
            } else {
                alert('비디오 파일이 입력한 경로에 존재하지 않거나 허용하지 않는 확장자입니다.\n 확장자 및 경로를 확인하세요.');
                return;
            }
        }).catch(err => {
            console.log(err);
        });
    }
}

function serviceSwitch(sel) {
    let unique_id = sel.getAttribute('unique_id');
    let service_yn = sel.value;
    axios.get(`/videosCount/${unique_id}`).then(result => {
        if (result.data.count > 0) {
            axios.post('/serviceSwitch', {
                data: {
                    unique_id: unique_id,
                    service_yn: service_yn
                }
            }).then(result => {
                location.reload();
            }).catch(err => {
                console.log(err);
            });
        } else {
            alert('스트림이 없으므로 서비스를 전환 할 수 없습니다.\n먼저 비디오 스트림을 등록 하세요.')
            sel.selectedIndex = 0;
        }
    }).catch(err => {
        console.log(err);
    });

}

function deleteVideoGroup(unique_id) {
    let con = confirm('등록된 비디오 스트리밍 정보도 삭제되며, 복구되지 않습니다.\n정말로 삭제할까요?');
    axios.get('/isDeleteableVideoGroup').then(result => {
        if (con) {
            if (result.data === false) {
                window.location.href = `/deleteVideoGroup/${unique_id}`;
            } else {
                alert('백 그라운드에서 진행 중인 스트리밍 컨버트 작업이 있습니다.\n잠시 후 다시 시도하세요.')
            }
        }
    });
}


function ctNameEdit(id) {
    let span = document.getElementById(`span_${id}`);
    let input = document.getElementById(`input_${id}`);
    let btn_edit = document.getElementById(`btn_edit_${id}`);
    let btn_cancel = document.getElementById(`btn_cancel_${id}`);
    let btn_submit = document.getElementById(`btn_submit_${id}`);
    span.setAttribute('hidden', 'hidden');
    input.removeAttribute('hidden');

    btn_edit.setAttribute('hidden', 'hidden');
    btn_cancel.removeAttribute('hidden');
    btn_submit.removeAttribute('hidden');
}

function ctNameEditCancel(id) {
    let span = document.getElementById(`span_${id}`);
    let input = document.getElementById(`input_${id}`);
    let btn_edit = document.getElementById(`btn_edit_${id}`);
    let btn_cancel = document.getElementById(`btn_cancel_${id}`);
    let btn_submit = document.getElementById(`btn_submit_${id}`);
    span.removeAttribute('hidden');
    input.setAttribute('hidden', 'hidden');

    btn_edit.removeAttribute('hidden');
    btn_cancel.setAttribute('hidden', 'hidden');
    btn_submit.setAttribute('hidden', 'hidden');
}

function categoryUpdateSubmit(id) {
    let name = document.getElementById(`input_${id}`).value.trim();

    if (name.length <= 0) {
        alert('Please Input Category Name');
        return;
    }

    axios.post('/categoryValid', { name: name }).then(result => {
        if (result.data) {
            axios.post('/updateCategory', {
                id: id,
                name: name
            }).then(result => {
                location.reload();
            });
        } else {
            alert('Category name Is Duplicated!')
        }
    }).catch(err => {
        alert(err);
    });

}

function tagUpdateSubmit(id) {
    let name = document.getElementById(`input_${id}`).value.trim();

    if (name.length <= 0) {
        alert('Please Input Tag Name');
        return;
    }
    
    axios.post('/tagValid', { name: name }).then(result => {
        if (result.data) {
            axios.post('/updateTag', {
                id: id,
                name: name
            }).then(result => {
                location.reload();
            });
        } else {
            alert('Tag name Is Duplicated!');
        }
    }).catch(err => {
        alert(err);
    });

}

// video stream preview functions =================================
function videoPreviewSet(title, video_group_unique_id, unique_id, m3u8){
    let stream_src = `/hls/${video_group_unique_id}/${unique_id}/${m3u8}.m3u8`;
    document.getElementById('preview_video_title').textContent = title;
    
    if(Hls.isSupported()){
        var preview_video = document.getElementById('preview_video');
        var hls = new Hls();
        hls.loadSource(stream_src);
        hls.attachMedia(preview_video);
    }
}

//demo function
function copyHlsAttr(e, video_group_unique_id, unique_id, m3u8){
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = `http://localhost:3000/api/stream/${video_group_unique_id}/${unique_id}/${m3u8}.m3u8`;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);

    
    alert('Copied url, only use for local');
    e.value="Copied!";
}

function videoPreviewClose(){
    document.getElementById('preview_video').pause();
}

function videoDelete(unique_id, title){
    var result = confirm(`Are you sure you want to delete [${title}] ?\nThis operation is irreversible.`);
    if(result){
        axios.post('/deleteVideo', { unique_id: unique_id }).then(result => {
            if (result.data) {
                location.reload();
            } else {
                location.href='/';
            }
        }).catch(err => {
            alert(err);
        });
    }
}

// video stream preview functions =================================