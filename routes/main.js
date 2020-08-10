var express = require('express');
var router = express.Router();

//file system
const fs = require('fs');

//db functions
const { adminLogin } = require('../functions/dbQuery')

//session functions
const {
  loginSessionCheck,
  setLoginSession,
  distLoginSession
} = require('../functions/session')

const {
  systemInfo
} = require('../functions/common');

/* GET home page. */
//세션 체크, 세션 정보가 없으면 main으로 보낸다.
router.get('/', (req, res, next) => {
  loginSessionCheck(req, (flag) => {
    if (flag) {
      res.redirect('/main');
    } else {
      res.render('login');
    }
  })
});

router.post('/login', async (req, res, next) => {
  let param = JSON.parse(JSON.stringify(req.body));
  let account = param['account'];
  let password = param['password'];

  //admin login
  await adminLogin(account, password, (result_admin) => {
    if (result_admin != null) {
      setLoginSession(req, result_admin.account);
    }
  });
  res.redirect('/');
});

router.get('/logout', (req, res, next) => {
  distLoginSession(req);
  res.redirect('/');
});

router.get('/main', (req, res, next) => {
  loginSessionCheck(req, (flag) => {
    if (flag) { //세션 정보가 있다면
      systemInfo((result) => {
        res.render('main', {
          account: req.session.account,
          system_info: result
        });
      });
    } else { //if no session data, redirect login page
      res.redirect('/');
    }
  });
});

// 스트리밍 파일 요청
//https://gist.github.com/julianfresco/c921d0102c1cdde5b78749ce660cb748
router.get('/stream/:video_group_unique_id/:unique_id/:m3u8', (req, res, next) => {
  let video_group_unique_id = req.params.video_group_unique_id;
  let unique_id = req.params.unique_id;
  let m3u8 = req.params.m3u8;

  let f_path = `${__dirname}/../hls/${video_group_unique_id}/${unique_id}/${m3u8}`;

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
