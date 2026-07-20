/**
 * @file server.js
 * @description 복사기마트 메인 Express 백엔드 진입점. 미들웨어 설정, 세션 구성, 정적 자원 서빙 및 라우터 모듈 통합 기능 수행.
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
const compression = require('compression');

// 데이터베이스 로드 (db.js 실행으로 커넥션 생성 및 마이그레이션이 수행됨)
require('./db');

const app = express();
const PORT = process.env.PORT || 8000;

// 최적화 및 보안 미들웨어
app.use(helmet({
    contentSecurityPolicy: false, // 로컬 개발 및 리소스 임포트 편의성을 위해 CSP 비활성화
}));
app.use(compression());

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// [SECURITY] 접근 권한 제어: 민감한 파일 보호
app.use((req, res, next) => {
    const forbiddenFiles = ['.db', 'server.js', 'package.json', 'package-lock.json', '.bat'];
    if (forbiddenFiles.some(file => req.path.includes(file))) {
        return res.status(403).json({ error: '접근이 거부되었습니다.' });
    }
    next();
});

// [DEBUG] 요청 로깅
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    }
    next();
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'bogisagimart-default-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24시간
        httpOnly: true
    }
}));

// API 라우터 임포트
const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const reviewsRouter = require('./routes/reviews');
const noticesRouter = require('./routes/notices');
const downloadsRouter = require('./routes/downloads');

// API 라우트 연동 (프리픽스: /api)
app.use('/api', authRouter.router);
app.use('/api', productsRouter);
app.use('/api', reviewsRouter);
app.use('/api', noticesRouter);
app.use('/api', downloadsRouter);

// 정적 파일 서빙
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 페이지 파일 서빙
app.get('/admin', authRouter.isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});
app.get('/products', (req, res) => res.redirect('/rental.html'));
app.get('/reviews', (req, res) => res.sendFile(path.join(__dirname, 'reviews.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/signup', (req, res) => res.redirect('/login'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// 구형 경로 호환성 유지 (404 방지 리다이렉션 필터)
app.get('/color.html', (req, res) => res.redirect('/rental.html?category=color'));
app.get('/mono.html', (req, res) => res.redirect('/rental.html?category=mono'));
app.get('/unlimited.html', (req, res) => res.redirect('/sales.html'));
app.get('/canon', (req, res) => res.redirect('/rental.html'));
app.get('/minolta', (req, res) => res.redirect('/rental.html'));
app.get('/samsung', (req, res) => res.redirect('/rental.html'));
app.get('/products.html', (req, res) => res.redirect('/rental.html'));

// 404 에러 처리
app.use((req, res) => {
    res.status(404).send(`
        <div style="text-align:center; padding:100px 50px; font-family:sans-serif; background:#f8fafc; min-height:100vh;">
            <h1 style="color:#3b82f6; font-size:4rem;">404</h1>
            <h2>페이지를 찾을 수 없습니다</h2>
            <p>입력하신 주소가 정확한지 확인해 주세요.</p>
            <a href="/" style="background:#3b82f6; color:white; padding:15px 30px; border-radius:8px; text-decoration:none; font-weight:bold;">홈으로 돌아가기</a>
        </div>
    `);
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`🚀 서버 가동: http://localhost:${PORT}`);
    console.log(`🔐 관리자: admin / admin1234`);
    console.log(`================================================`);
});