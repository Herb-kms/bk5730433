/**
 * @file routes/downloads.js
 * @description 복사기마트 자료실(다운로드) 데이터 및 드라이버/매뉴얼 파일 업로드 CRUD API Express 라우터 모듈
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('./auth');
const multer = require('multer');
const downloadModel = require('../models/downloadModel');
const storageService = require('../services/storageService');

// Multer 메모리 스토리지 구성 (파일 시스템 I/O 방식 및 클라우드 업로드 대기)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 자료실은 10MB 제한
});

// API: 자료실 목록 조회
router.get('/downloads', async (req, res) => {
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    try {
        const rows = await downloadModel.getAll();
        res.json(rows);
    } catch (err) {
        console.error('자료실 조회 실패', err);
        res.status(500).json({ error: '자료실 조회 실패' });
    }
});

// API: 자료 등록 (관리자용)
router.post('/downloads', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
        const { title, description } = req.body;
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '.');

        if (!title || !req.file) {
            return res.status(400).json({ error: '제목과 파일은 필수 항목입니다.' });
        }

        // 이미지 최적화 비활성화 (드라이버/매뉴얼 문서이므로)
        const file_url = await storageService.uploadFile(req.file, 'uploads', { optimizeImage: false });
        const file_name = req.file.originalname;

        const newId = await downloadModel.create({
            title, description, file_url, file_name, date
        });

        res.json({ id: newId, message: '등록 성공' });
    } catch (err) {
        console.error('자료 등록 실패', err);
        res.status(500).json({ error: '자료 등록 실패' });
    }
});

// API: 자료 수정 (관리자용)
router.put('/downloads/:id', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ error: '제목은 필수 항목입니다.' });
        }

        const oldDownload = await downloadModel.getById(req.params.id);
        if (!oldDownload) {
            return res.status(404).json({ error: '수정할 자료를 찾을 수 없습니다.' });
        }

        let updateData = { title, description };

        if (req.file) {
            // 기존 파일 물리적 삭제
            if (oldDownload.file_url) {
                await storageService.deleteFile(oldDownload.file_url);
            }
            updateData.file_url = await storageService.uploadFile(req.file, 'uploads', { optimizeImage: false });
            updateData.file_name = req.file.originalname;
        }

        await downloadModel.update(req.params.id, updateData);
        res.json({ message: '수정 성공' });
    } catch (err) {
        console.error('자료 수정 실패', err);
        res.status(500).json({ error: '자료 수정 실패' });
    }
});

// API: 자료 삭제 (관리자용)
router.delete('/downloads/:id', isAuthenticated, async (req, res) => {
    try {
        const download = await downloadModel.getById(req.params.id);
        if (download && download.file_url) {
            await storageService.deleteFile(download.file_url);
        }
        await downloadModel.delete(req.params.id);
        res.json({ message: '삭제 성공' });
    } catch (err) {
        console.error('자료 삭제 실패', err);
        res.status(500).json({ error: '자료 삭제 실패' });
    }
});

module.exports = router;
