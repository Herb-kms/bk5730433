/**
 * @file routes/notices.js
 * @description 복사기마트 공지사항 조회 및 작성/수정/삭제(CRUD) API Express 라우터 모듈
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('./auth');
const noticeModel = require('../models/noticeModel');

const defaultNotices = [
    {
        id: 1,
        title: '2026년 하반기 신규 캐논·미놀타 무한복합기 라인업 출시 안내',
        content: '안녕하세요. 복사기마트입니다.\n\n고객 여러분께 더 높은 출력 품질과 안정적인 임대 서비스를 제공하기 위해 2026년 하반기 최신 A3 컬러/흑백 무한복합기 라인업이 신규 입고되었습니다.\n자세한 기종별 임대 비용과 혜택은 상단 카테고리 메뉴 및 고객센터 상담을 통해 확인하실 수 있습니다.\n\n감사합니다.',
        type: 'notice',
        is_pinned: 1,
        date: '2026.07.01'
    },
    {
        id: 2,
        title: '신규 렌탈 고객 대상 첫 달 임대료 50% 할인 및 정품 소모품 지원 이벤트',
        content: '신규 기업 및 사무실 오픈을 기념하여 신규 렌탈 계약 시 첫 달 임대료를 50% 지원해 드립니다.\n추가로 계약 기간 내 정품 토너 무제한 지급 및 무상 AS를 보장해 드립니다. 많은 관심 부탁드립니다!',
        type: 'event',
        is_pinned: 1,
        date: '2026.06.15'
    },
    {
        id: 3,
        title: '여름철 복합기 용지 걸림 및 습기 관리 예방법 안내',
        content: '여름철 장마 및 고온다습한 날씨로 인해 용지함 내부 복사지가 습기를 머금어 용지 걸림(Jam) 현상이 발생할 수 있습니다.\n용지는 습기가 닿지 않는 건조한 곳에 보관해 주시고, 퇴근 시 용지함을 닫아 두시기를 권장합니다. 문제가 발생하면 언제든 실시간 원격 지원을 요청해 주세요.',
        type: 'info',
        is_pinned: 0,
        date: '2026.06.02'
    },
    {
        id: 4,
        title: '복사기마트 정기 A/S 방문 점검 안내 (경기/서울/인천권)',
        content: '복사기마트는 렌탈 기기의 최상의 상태를 유지하기 위해 매월 정기 순회 점검 및 클리닝 작업을 실시하고 있습니다.\n담당 기사가 방문 일정 전 사전 연락을 드린 후 찾아뵐 예정이오니 참고 부탁드립니다.',
        type: 'info',
        is_pinned: 0,
        date: '2026.05.18'
    },
    {
        id: 5,
        title: '공식 홈페이지 리뉴얼 오픈 안내',
        content: '고객님들이 빠르고 편리하게 실시간 견적과 제품 라인업을 확인하실 수 있도록 복사기마트 공식 홈페이지가 전면 리뉴얼되었습니다.\n앞으로도 최고의 서비스로 보답하겠습니다. 감사합니다.',
        type: 'info',
        is_pinned: 0,
        date: '2026.05.01'
    }
];

// API: 공지사항 목록 조회
router.get('/notices', async (req, res) => {
    try {
        const rows = await noticeModel.getAll();
        if (Array.isArray(rows) && rows.length > 0) {
            res.json(rows);
        } else {
            res.json(defaultNotices);
        }
    } catch (err) {
        console.error('공지사항 DB 조회 예외 - 대체 데이터 전달', err);
        res.json(defaultNotices);
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
