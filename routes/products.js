/**
 * @file routes/products.js
 * @description 복사기마트 임대/판매 복사기 및 프린터 제품 정보 관리(CRUD) API Express 라우터 모듈
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('./auth');
const multer = require('multer');
const productModel = require('../models/productModel');
const storageService = require('../services/storageService');

// Multer 메모리 스토리지 구성 (파일 시스템 I/O 방식 및 클라우드 업로드 대기)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { 
        fileSize: 5 * 1024 * 1024,
        fieldSize: 50 * 1024 * 1024 // Quill 에디터 본문 Base64 이미지 대응 용량 설정
    }
});

const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'detail_image', maxCount: 1 },
    { name: 'condition_image', maxCount: 1 }
]);

// API: 제품 목록 조회
router.get('/products', async (req, res) => {
    try {
        const { type, category } = req.query;
        const rows = await productModel.getAll({ type, category });
        res.json(rows);
    } catch (err) {
        console.error('제품 목록 조회 실패', err);
        res.status(500).json({ error: '제품 목록 조회 실패' });
    }
});

// API: 단일 제품 상세 조회
router.get('/products/:id', async (req, res) => {
    try {
        const row = await productModel.getById(req.params.id);
        if (!row) return res.status(404).json({ error: '제품을 찾을 수 없습니다.' });
        res.json(row);
    } catch (err) {
        console.error('제품 상세 조회 실패', err);
        res.status(500).json({ error: '제품 상세 조회 실패' });
    }
});

// API: 제품 등록 (관리자용)
router.post('/products', isAuthenticated, uploadFields, async (req, res) => {
    try {
        const { type, category, brand, name, price, badge, description, specs, naver_talk, kakao_talk, image_zoom_card, image_padding_card, image_zoom_1, image_padding_1, image_zoom_2, image_padding_2, image_zoom_3, image_padding_3 } = req.body;
        const date = new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
        
        if (!type || !category || !brand || !name || !price) {
            return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }

        let image_url = '/img/standing_color_copier.PNG';
        let image_url_1 = null;
        let image_url_2 = null;
        let image_url_3 = null;
        let detail_image_url = null;
        let condition_image_url = null;
 
        if (req.files) {
            if (req.files['image']) {
                image_url = await storageService.uploadFile(req.files['image'][0], 'uploads');
            }
            if (req.files['image1']) {
                image_url_1 = await storageService.uploadFile(req.files['image1'][0], 'uploads');
            }
            if (req.files['image2']) {
                image_url_2 = await storageService.uploadFile(req.files['image2'][0], 'uploads');
            }
            if (req.files['image3']) {
                image_url_3 = await storageService.uploadFile(req.files['image3'][0], 'uploads');
            }
            if (req.files['detail_image']) {
                detail_image_url = await storageService.uploadFile(req.files['detail_image'][0], 'uploads');
            }
            if (req.files['condition_image']) {
                condition_image_url = await storageService.uploadFile(req.files['condition_image'][0], 'uploads');
            }
        }
 
        const newId = await productModel.create({
            type, category, brand, name, price,
            image_url, image_url_1, image_url_2, image_url_3,
            badge, description, specs, naver_talk, kakao_talk, date,
            image_zoom_card, image_padding_card,
            image_zoom_1, image_padding_1,
            image_zoom_2, image_padding_2,
            image_zoom_3, image_padding_3,
            detail_image_url,
            condition_image_url
        });

        res.json({ id: newId, message: '제품 등록 성공' });
    } catch (err) {
        console.error('제품 등록 실패', err);
        res.status(500).json({ error: '제품 등록 실패' });
    }
});

// API: 제품 수정 (관리자용)
router.put('/products/:id', isAuthenticated, uploadFields, async (req, res) => {
    try {
        const { type, category, brand, name, price, badge, description, specs, naver_talk, kakao_talk, image_zoom_card, image_padding_card, image_zoom_1, image_padding_1, image_zoom_2, image_padding_2, image_zoom_3, image_padding_3 } = req.body;
        
        if (!type || !category || !brand || !name || !price) {
            return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }

        const oldProduct = await productModel.getById(req.params.id);
        if (!oldProduct) {
            return res.status(404).json({ error: '제품을 찾을 수 없습니다.' });
        }

        let updateData = {
            type, category, brand, name, price, badge, description, specs, naver_talk, kakao_talk,
            image_zoom_card, image_padding_card,
            image_zoom_1, image_padding_1,
            image_zoom_2, image_padding_2,
            image_zoom_3, image_padding_3
        };

        if (req.files) {
            if (req.files['image']) {
                // 기존 업로드된 제품 이미지가 기본 이미지가 아닌 경우에만 삭제
                if (oldProduct.image_url && !oldProduct.image_url.includes('/img/')) {
                    await storageService.deleteFile(oldProduct.image_url);
                }
                updateData.image_url = await storageService.uploadFile(req.files['image'][0], 'uploads');
            }
            if (req.files['image1']) {
                if (oldProduct.image_url_1) {
                    await storageService.deleteFile(oldProduct.image_url_1);
                }
                updateData.image_url_1 = await storageService.uploadFile(req.files['image1'][0], 'uploads');
            }
            if (req.files['image2']) {
                if (oldProduct.image_url_2) {
                    await storageService.deleteFile(oldProduct.image_url_2);
                }
                updateData.image_url_2 = await storageService.uploadFile(req.files['image2'][0], 'uploads');
            }
            if (req.files['image3']) {
                if (oldProduct.image_url_3) {
                    await storageService.deleteFile(oldProduct.image_url_3);
                }
                updateData.image_url_3 = await storageService.uploadFile(req.files['image3'][0], 'uploads');
            }
            if (req.files['detail_image']) {
                if (oldProduct.detail_image_url) {
                    await storageService.deleteFile(oldProduct.detail_image_url);
                }
                updateData.detail_image_url = await storageService.uploadFile(req.files['detail_image'][0], 'uploads');
            }
            if (req.files['condition_image']) {
                if (oldProduct.condition_image_url) {
                    await storageService.deleteFile(oldProduct.condition_image_url);
                }
                updateData.condition_image_url = await storageService.uploadFile(req.files['condition_image'][0], 'uploads');
            }
        }

        await productModel.update(req.params.id, updateData);
        res.json({ message: '제품 수정 성공' });
    } catch (err) {
        console.error('제품 수정 실패', err);
        res.status(500).json({ error: '제품 수정 실패' });
    }
});

// API: 제품 삭제 (관리자용)
router.delete('/products/:id', isAuthenticated, async (req, res) => {
    try {
        const product = await productModel.getById(req.params.id);
        if (product) {
            if (product.image_url && !product.image_url.includes('/img/')) {
                await storageService.deleteFile(product.image_url);
            }
            if (product.image_url_1) {
                await storageService.deleteFile(product.image_url_1);
            }
            if (product.image_url_2) {
                await storageService.deleteFile(product.image_url_2);
            }
            if (product.image_url_3) {
                await storageService.deleteFile(product.image_url_3);
            }
            if (product.detail_image_url) {
                await storageService.deleteFile(product.detail_image_url);
            }
            if (product.condition_image_url) {
                await storageService.deleteFile(product.condition_image_url);
            }
        }
        await productModel.delete(req.params.id);
        res.json({ message: '제품 삭제 성공' });
    } catch (err) {
        console.error('제품 삭제 실패', err);
        res.status(500).json({ error: '제품 삭제 실패' });
    }
});

module.exports = router;
