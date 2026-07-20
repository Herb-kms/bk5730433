/**
 * @file routes/reviews.js
 * @description 복사기마트 설치후기 조회 및 작성/수정/삭제(CRUD) API Express 라우터 모듈
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('./auth');
const multer = require('multer');
const reviewModel = require('../models/reviewModel');
const storageService = require('../services/storageService');

// Multer 메모리 스토리지 구성 (파일 시스템 I/O 방식 및 클라우드 업로드 대기)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

// API: 후기 목록 조회
router.get('/reviews', async (req, res) => {
    try {
        const category = req.query.category;
        const rows = await reviewModel.getByCategory(category);
        res.json(rows);
    } catch (err) {
        console.error('후기 목록 조회 실패', err);
        res.status(500).json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' });
    }
});

// API: 후기 작성
router.post('/reviews', (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: '로그인이 필요한 기능입니다.' });
    }
    next();
}, upload.single('image'), async (req, res) => {
    try {
        const { category, title, content, author } = req.body;
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '.');

        if (!category || !title || !content || !author) {
            return res.status(400).json({ error: '모든 필드를 입력해 주세요.' });
        }

        let image_url = null;
        if (req.file) {
            image_url = await storageService.uploadFile(req.file, 'uploads');
        }

        const newId = await reviewModel.create({
            category, title, content, author, date, image_url
        });

        res.json({ id: newId, message: '후기가 저장되었습니다.' });
    } catch (err) {
        console.error('후기 저장 실패', err);
        res.status(500).json({ error: '저장 중 오류가 발생했습니다.' });
    }
});

// API: 후기 수정 (관리자용)
router.put('/reviews/:id', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const { category, title, content, author } = req.body;
        if (!category || !title || !content || !author) {
            return res.status(400).json({ error: '모든 필드를 입력해 주세요.' });
        }

        const oldReview = await reviewModel.getById(req.params.id);
        if (!oldReview) {
            return res.status(404).json({ error: '수정할 후기를 찾을 수 없습니다.' });
        }

        let updateData = { category, title, content, author };

        if (req.file) {
            // 기존 파일 삭제
            if (oldReview.image_url) {
                await storageService.deleteFile(oldReview.image_url);
            }
            updateData.image_url = await storageService.uploadFile(req.file, 'uploads');
        }

        await reviewModel.update(req.params.id, updateData);
        res.json({ message: '수정 완료' });
    } catch (err) {
        console.error('후기 수정 실패', err);
        res.status(500).json({ error: '수정 중 오류가 발생했습니다.' });
    }
});

// API: 후기 삭제 (관리자용)
router.delete('/reviews/:id', isAuthenticated, async (req, res) => {
    try {
        const review = await reviewModel.getById(req.params.id);
        if (review && review.image_url) {
            await storageService.deleteFile(review.image_url);
        }
        await reviewModel.delete(req.params.id);
        res.json({ message: '삭제 완료' });
    } catch (err) {
        console.error('후기 삭제 실패', err);
        res.status(500).json({ error: '삭제 중 오류가 발생했습니다.' });
    }
});

module.exports = router;
