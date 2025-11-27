const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. 게시판 목록 (검색 + 페이지네이션 + 슬라이드용 본문 조회)
router.get('/', (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = 5; // 페이지당 10개
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // 검색 조건 처리
    let whereClause = '';
    let params = [];
    if (search) {
        whereClause = 'WHERE b.title LIKE ?';
        params.push(`%${search}%`);
    }

    // 전체 게시물 수 (페이지네이션 계산용)
    const countQuery = `SELECT COUNT(*) AS count FROM board b ${whereClause}`;
    
    db.query(countQuery, params, (err, countResult) => {
        if (err) throw err;

        const totalPosts = countResult[0].count;
        const totalPages = Math.ceil(totalPosts / limit);

        // 게시물 조회
        const sql = `
            SELECT b.*, u.user_name 
            FROM board b 
            JOIN users u ON b.user_id = u.user_id 
            ${whereClause} 
            ORDER BY b.board_id DESC 
            LIMIT ? OFFSET ?`;
        
        const queryParams = [...params, limit, offset];

        db.query(sql, queryParams, (err, results) => {
            if (err) throw err;
            res.render('board', { // views/board.ejs 렌더링
                title: '게시판',
                user: req.session.user || null,
                posts: results,
                currentPage: page,
                totalPages: totalPages,
                search: search
            });
        });
    });
});

// 2. 글쓰기 페이지 (GET)
router.get('/write', (req, res) => {
    if (!req.session.user) return res.redirect('/login'); // 로그인 필수
    res.render('test/boardWrite', { title: '글쓰기', user: req.session.user });
});

// 3. 글쓰기 저장 (POST)
router.post('/write', (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const { title, content } = req.body;
    const user_id = req.session.user.user_id;

    const sql = 'INSERT INTO board (user_id, title, content) VALUES (?, ?, ?)';
    db.query(sql, [user_id, title, content], (err) => {
        if (err) throw err;
        res.redirect('/board');
    });
});

// 4. 조회수 증가 API
router.post('/increase-view/:id', (req, res) => {
    const boardId = req.params.id;
    
    // 1. 조회수 +1
    db.query('UPDATE board SET views = views + 1 WHERE board_id = ?', [boardId], (err) => {
        if (err) return res.json({ success: false });
        
        // 2. 증가된 조회수 반환
        db.query('SELECT views FROM board WHERE board_id = ?', [boardId], (err, result) => {
            if (err) return res.json({ success: false });
            res.json({ success: true, newViews: result[0].views });
        });
    });
});

// 5. 게시물 삭제
router.get('/delete/:id', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    
    const boardId = req.params.id;
    const userId = req.session.user.user_id;
    
    let sql;
    let params;

    // 관리자(admin@example.com)인지 확인
    if (user.email === 'admin@example.com') {
        // 관리자라면: 작성자(user_id) 확인 없이 글 번호만 맞으면 무조건 삭제
        sql = 'DELETE FROM board WHERE board_id = ?';
        params = [boardId];
    } else {
        // 일반 유저라면: 글 번호 AND 작성자(user_id)가 모두 일치해야 삭제
        sql = 'DELETE FROM board WHERE board_id = ? AND user_id = ?';
        params = [boardId, user.user_id];
    }

    db.query(sql, params, (err, result) => {
        if (err) throw err;
        
        // 삭제된 줄이 없으면(글이 없으면)
        if (result.affectedRows === 0) {
            console.log("삭제 권한이 없거나 게시물이 없습니다.");
        }
        
        res.redirect('/board');
    });
});

// 6. 수정 페이지 보여주기 (GET)
router.get('/edit/:id', (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const boardId = req.params.id;
    const user = req.session.user;

    // 해당 게시물 데이터 가져오기
    db.query('SELECT * FROM board WHERE board_id = ?', [boardId], (err, results) => {
        if (err) throw err;
        
        if (results.length === 0) {
            return res.send("<script>alert('존재하지 않는 게시물입니다.'); location.href='/board';</script>");
        }

        const post = results[0];

        // 권한 체크: 본인 글이거나 관리자('admin@example.com')만 수정 가능
        if (post.user_id !== user.user_id && user.email !== 'admin@example.com') {
             return res.send("<script>alert('수정 권한이 없습니다.'); location.href='/board';</script>");
        }

        // 수정 화면 렌더링 (기존 데이터를 post 변수로 전달)
        res.render('test/boardModify', { 
            title: '글 수정', 
            user: user, 
            post: post 
        });
    });
});

// 7. 수정 내용 저장하기 (POST)
router.post('/edit/:id', (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const boardId = req.params.id;
    const { title, content } = req.body;
    const user = req.session.user;

    // 권한 체크 로직을 쿼리에 포함 (관리자는 조건 없이, 일반 유저는 user_id 일치 조건)
    let sql = 'UPDATE board SET title = ?, content = ? WHERE board_id = ?';
    let params = [title, content, boardId];

    if (user.email !== 'admin@example.com') {
        sql += ' AND user_id = ?';
        params.push(user.user_id);
    }

    db.query(sql, params, (err, result) => {
        if (err) throw err;

        if (result.affectedRows === 0) {
            return res.send("<script>alert('수정 권한이 없거나 게시물이 없습니다.'); location.href='/board';</script>");
        }

        // 수정 성공 시 목록으로 이동
        res.redirect('/board');
    });
});

module.exports = router;