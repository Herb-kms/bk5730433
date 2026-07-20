/**
 * @file routes/notices.js
 * @description 복사기마트 공지사항 조회 및 작성/수정/삭제(CRUD) API Express 라우터 모듈
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('./auth');
const noticeModel = require('../models/noticeModel');

// API: 공지사항 목록 조회
router.get('/notices', async (req, res) => {
    try {
        const rows = await noticeModel.getAll();
        res.json(rows);
    } catch (err) {
        console.error('공지사항 조회 실패', err);
        res.status(500).json({ error: '공지사항 조회 실패' });
    }
});

// API: 공지사항 등록 (관리자용)
router.post('/notices', isAuthenticated, async (req, res) => {
    try {
        const { title, content, type, is_pinned } = req.body;
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '.');
        if (!title || !content || !type) {
            return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }
        
        const newId = await noticeModel.create({
            title, content, type, is_pinned: is_pinned ? 1 : 0, date
        });
        
        res.json({ id: newId, message: '등록 성공' });
    } catch (err) {
        console.error('공지사항 등록 실패', err);
        res.status(500).json({ error: '공지사항 등록 실패' });
    }
});

// API: 공지사항 수정 (관리자용)
router.put('/notices/:id', isAuthenticated, async (req, res) => {
    try {
        const { title, content, type, is_pinned } = req.body;
        if (!title || !content || !type) {
            return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }
        
        await noticeModel.update(req.params.id, {
            title, content, type, is_pinned: is_pinned ? 1 : 0
        });
        
        res.json({ message: '수정 성공' });
    } catch (err) {
        console.error('공지사항 수정 실패', err);
        res.status(500).json({ error: '공지사항 수정 실패' });
    }
});

// API: 공지사항 삭제 (관리자용)
router.delete('/notices/:id', isAuthenticated, async (req, res) => {
    try {
        await noticeModel.delete(req.params.id);
        res.json({ message: '삭제 성공' });
    } catch (err) {
        console.error('공지사항 삭제 실패', err);
        res.status(500).json({ error: '공지사항 삭제 실패' });
    }
});

module.exports = router;
