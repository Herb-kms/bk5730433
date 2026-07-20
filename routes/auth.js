/**
 * @file routes/auth.js
 * @description 복사기마트 사용자 인증, 세션 검증, 회원가입/로그인 및 회원 정보 관리 API Express 라우터 모듈
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

// 권한 확인 미들웨어
const isAuthenticated = (req, res, next) => {
    if (req.session.user && req.session.user.user_type === 'admin') {
        next();
    } else {
        const isApiRequest = req.xhr ||
            (req.headers.accept && req.headers.accept.indexOf('json') > -1) ||
            req.path.startsWith('/api/');

        if (isApiRequest) {
            res.status(401).json({ error: '관리자 권한이 필요합니다.' });
        } else {
            res.redirect('/login.html');
        }
    }
};

// API: 아이디 중복 확인
router.get('/check-username', async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: '아이디를 입력해 주세요.' });

    try {
        const user = await userModel.getByUsername(username);
        res.json({ exists: !!user });
    } catch (err) {
        console.error('[CHECK_USERNAME_ERROR] error:', err);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// API: 회원 가입
router.post('/signup', async (req, res) => {
    const { username, password, real_name, company_name, user_type } = req.body;
    if (!username || !password || !real_name) {
        return res.status(400).json({ error: '필수 항목을 모두 입력해 주세요.' });
    }

    try {
        const existingUser = await userModel.getByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: '이미 사용 중인 아이디입니다.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const date = new Date().toISOString().split('T')[0];

        await userModel.create({
            username,
            password: hashedPassword,
            real_name,
            company_name: company_name || '',
            user_type: user_type || 'personal',
            signup_date: date
        });

        res.status(201).json({ message: '회원가입이 완료되었습니다.' });
    } catch (err) {
        console.error('[SIGNUP_ERROR] error:', err);
        res.status(500).json({ error: '가입 중 서버 오류가 발생했습니다.' });
    }
});

// API: 로그인
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await userModel.getByUsername(username);
        if (!user) {
            return res.status(401).json({ error: '존재하지 않는 아이디입니다.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.loggedIn = true;
            req.session.user = {
                id: user.id,
                username: user.username,
                real_name: user.real_name,
                company_name: user.company_name,
                user_type: user.user_type,
                last_info_update: user.last_info_update
            };

            req.session.save((err) => {
                if (err) {
                    console.error('[LOGIN_ERROR] Session save error:', err);
                    return res.status(500).json({ error: '세션 저장 중 오류가 발생했습니다.' });
                }
                res.json({
                    message: '로그인 성공',
                    user: { username: user.username, user_type: user.user_type }
                });
            });
        } else {
            res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
        }
    } catch (err) {
        console.error('[LOGIN_ERROR] error:', err);
        res.status(500).json({ error: '인증 과정에서 오류가 발생했습니다.' });
    }
});

// API: 세션 확인
router.get('/session', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// API: 로그아웃
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: '로그아웃 실패' });
        res.clearCookie('connect.sid');
        res.json({ message: '로그아웃 완료' });
    });
});

// API: 회원 전체 목록 조회 (관리자 전용)
router.get('/users', isAuthenticated, async (req, res) => {
    try {
        const rows = await userModel.getAll();
        res.json(rows);
    } catch (err) {
        console.error('[USERS_GET_ERROR] error:', err);
        res.status(500).json({ error: '회원 목록 조회 중 서버 오류가 발생했습니다.' });
    }
});

// API: 회원 정보 수정 (관리자용)
router.put('/users/:id', isAuthenticated, async (req, res) => {
    const { username, password, real_name, company_name, user_type } = req.body;
    const userId = req.params.id;

    if (!username) return res.status(400).json({ error: '아이디는 필수입니다.' });

    try {
        const existingUser = await userModel.getByUsername(username);
        if (existingUser && String(existingUser.id) !== String(userId)) {
            return res.status(400).json({ error: '이미 존재하는 아이디입니다.' });
        }

        let updateData = { username, real_name, company_name, user_type };

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        await userModel.update(userId, updateData);
        res.json({ message: '사용자 정보 수정 완료' });
    } catch (err) {
        console.error('[USERS_PUT_ERROR] error:', err);
        res.status(500).json({ error: '수정 중 오류가 발생했습니다.' });
    }
});

// API: 회원 삭제 (관리자용)
router.delete('/users/:id', isAuthenticated, async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await userModel.getById(userId);
        if (user && user.username === 'admin') {
            return res.status(403).json({ error: '기본 관리자 계정은 삭제할 수 없습니다.' });
        }
        await userModel.delete(userId);
        res.json({ message: '사용자 삭제 완료' });
    } catch (err) {
        console.error('[USERS_DELETE_ERROR] error:', err);
        res.status(500).json({ error: '삭제 중 오류가 발생했습니다.' });
    }
});

// API: 내 정보 수정 (특정 필드 24시간 제한)
router.put('/users/me', async (req, res) => {
    if (!req.session.user || !req.session.loggedIn) {
        return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const userId = req.session.user.id;
    const { real_name, company_name } = req.body;

    try {
        const user = await userModel.getById(userId);
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const now = new Date();
        let updateFields = [];
        let params = [];
        let errors = [];

        // 이름 수정 체크
        if (real_name !== undefined) {
            if (user.last_name_update) {
                const lastUpdate = new Date(user.last_name_update);
                const diffHours = (now - lastUpdate) / (1000 * 60 * 60);
                if (diffHours < 24) {
                    const remaining = Math.ceil(24 - diffHours);
                    errors.push(`이름은 ${remaining}시간 후에 다시 수정할 수 있습니다.`);
                } else {
                    updateFields.push('real_name = ?', 'last_name_update = ?');
                    params.push(real_name, now.toISOString());
                }
            } else {
                updateFields.push('real_name = ?', 'last_name_update = ?');
                params.push(real_name, now.toISOString());
            }
        }

        // 거래처명 수정 체크
        if (company_name !== undefined) {
            if (user.last_company_update) {
                const lastUpdate = new Date(user.last_company_update);
                const diffHours = (now - lastUpdate) / (1000 * 60 * 60);
                if (diffHours < 24) {
                    const remaining = Math.ceil(24 - diffHours);
                    errors.push(`거래처명은 ${remaining}시간 후에 다시 수정할 수 있습니다.`);
                } else {
                    updateFields.push('company_name = ?', 'last_company_update = ?');
                    params.push(company_name, now.toISOString());
                }
            } else {
                updateFields.push('company_name = ?', 'last_company_update = ?');
                params.push(company_name, now.toISOString());
            }
        }

        if (errors.length > 0 && updateFields.length === 0) {
            return res.status(403).json({ error: errors.join('\n') });
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: '수정할 정보가 없습니다.' });
        }

        await userModel.updateDynamic(userId, updateFields, params);

        // 세션 정보 업데이트
        if (real_name !== undefined) req.session.user.real_name = real_name;
        if (company_name !== undefined) req.session.user.company_name = company_name;

        req.session.save((err) => {
            if (err) {
                console.error('[USERS_ME_ERROR] Session save error:', err);
                return res.status(500).json({ error: '세션 저장 중 오류가 발생했습니다.' });
            }
            let message = '정보가 성공적으로 수정되었습니다.';
            if (errors.length > 0) message += `\n참고: ${errors.join(' ')}`;
            res.json({ message, user: req.session.user });
        });
    } catch (err) {
        console.error('[USERS_ME_ERROR] error:', err);
        res.status(500).json({ error: '수정 중 오류가 발생했습니다.' });
    }
});

module.exports = {
    router,
    isAuthenticated
};
