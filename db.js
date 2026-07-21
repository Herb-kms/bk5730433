/**
 * @file db.js
 * @description 복사기마트 하이브리드 데이터베이스 연결 설정 및 초기 테이블 스키마 DDL 마이그레이션 관리 모듈.
 * DB_TYPE 환경 변수에 따라 SQLite3 또는 MySQL을 유연하게 선택 및 마이그레이션하며,
 * SQLite 사용 시 MySQL 표준 프로미스 API(query) 형식에 맞춰 동적 어댑팅 래핑을 지원합니다.
 */

require('dotenv').config();
const DB_TYPE = process.env.DB_TYPE || 'sqlite';
let bcrypt;
try {
    bcrypt = require('bcryptjs');
} catch (e1) {
    try {
        bcrypt = require('bcrypt');
    } catch (e2) {
        bcrypt = {
            async hash(p) { return p; },
            async compare(p, h) { return p === h; }
        };
    }
}

let dbExport;

// ========================================================
// 1. MySQL(MariaDB) 연결 정의
// ========================================================
async function initializeMySQL(pool) {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('[Database] MySQL 데이터베이스 초기 스키마 빌드를 시작합니다.');

        // 리뷰 테이블
        await connection.query(`CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            author VARCHAR(100) NOT NULL,
            date VARCHAR(20) NOT NULL,
            image_url VARCHAR(500)
        )`);

        // 공지사항 테이블
        await connection.query(`CREATE TABLE IF NOT EXISTS notices (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            type VARCHAR(50) NOT NULL,
            is_pinned INT DEFAULT 0,
            date VARCHAR(20) NOT NULL
        )`);

        // 공지사항 시드 데이터
        const [noticeRows] = await connection.query("SELECT COUNT(*) as count FROM notices");
        if (noticeRows[0].count === 0) {
            const notices = [
                ['2026년 하반기 신규 캐논·미놀타 무한복합기 라인업 출시 안내', '안녕하세요. 복사기마트입니다.\n\n고객 여러분께 더 높은 출력 품질과 안정적인 임대 서비스를 제공하기 위해 2026년 하반기 최신 A3 컬러/흑백 무한복합기 라인업이 신규 입고되었습니다.\n자세한 기종별 임대 비용과 혜택은 상단 카테고리 메뉴 및 고객센터 상담을 통해 확인하실 수 있습니다.\n\n감사합니다.', 'notice', 1, '2026.07.01'],
                ['신규 렌탈 고객 대상 첫 달 임대료 50% 할인 및 정품 소모품 지원 이벤트', '신규 기업 및 사무실 오픈을 기념하여 신규 렌탈 계약 시 첫 달 임대료를 50% 지원해 드립니다.\n추가로 계약 기간 내 정품 토너 무제한 지급 및 무상 AS를 보장해 드립니다. 많은 관심 부탁드립니다!', 'event', 1, '2026.06.15'],
                ['여름철 복합기 용지 걸림 및 습기 관리 예방법 안내', '여름철 장마 및 고온다습한 날씨로 인해 용지함 내부 복사지가 습기를 머금어 용지 걸림(Jam) 현상이 발생할 수 있습니다.\n용지는 습기가 닿지 않는 건조한 곳에 보관해 주시고, 퇴근 시 용지함을 닫아 두시기를 권장합니다. 문제가 발생하면 언제든 실시간 원격 지원을 요청해 주세요.', 'info', 0, '2026.06.02'],
                ['복사기마트 정기 A/S 방문 점검 안내 (경기/서울/인천권)', '복사기마트는 렌탈 기기의 최상의 상태를 유지하기 위해 매월 정기 순회 점검 및 클리닝 작업을 실시하고 있습니다.\n담당 기사가 방문 일정 전 사전 연락을 드린 후 찾아뵐 예정이오니 참고 부탁드립니다.', 'info', 0, '2026.05.18'],
                ['공식 홈페이지 리뉴얼 오픈 안내', '고객님들이 빠르고 편리하게 실시간 견적과 제품 라인업을 확인하실 수 있도록 복사기마트 공식 홈페이지가 전면 리뉴얼되었습니다.\n앞으로도 최고의 서비스로 보답하겠습니다. 감사합니다.', 'info', 0, '2026.05.01']
            ];
            for (const n of notices) {
                await connection.query('INSERT INTO notices (title, content, type, is_pinned, date) VALUES (?, ?, ?, ?, ?)', n);
            }
        }

        // 자료실 테이블
        await connection.query(`CREATE TABLE IF NOT EXISTS downloads (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            file_url VARCHAR(500) NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            date VARCHAR(20) NOT NULL
        )`);

        // 사용자 테이블
        await connection.query(`CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            real_name VARCHAR(100),
            company_name VARCHAR(100),
            user_type VARCHAR(50) DEFAULT 'personal',
            signup_date VARCHAR(20),
            last_name_update VARCHAR(50),
            last_company_update VARCHAR(50),
            last_info_update VARCHAR(50)
        )`);

        // 어드민 생성
        const [userRows] = await connection.query("SELECT id FROM users WHERE username = 'admin'");
        if (userRows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin1234', 10);
            const date = new Date().toISOString().split('T')[0];
            await connection.query('INSERT INTO users (username, password, real_name, user_type, signup_date) VALUES (?, ?, ?, ?, ?)',
                ['admin', hashedPassword, '관리자', 'admin', date]);
        }

        // 제품 테이블
        await connection.query(`CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            category VARCHAR(50) NOT NULL,
            brand VARCHAR(50) NOT NULL,
            name VARCHAR(255) NOT NULL,
            price INT NOT NULL,
            image_url VARCHAR(500),
            image_url_1 VARCHAR(500),
            image_url_2 VARCHAR(500),
            image_url_3 VARCHAR(500),
            badge VARCHAR(100),
            description TEXT,
            specs TEXT,
            naver_talk VARCHAR(500),
            kakao_talk VARCHAR(500),
            date VARCHAR(20) NOT NULL,
            image_zoom_card INT DEFAULT 130,
            image_padding_card INT DEFAULT 10,
            image_zoom_1 INT DEFAULT 130,
            image_padding_1 INT DEFAULT 10,
            image_zoom_2 INT DEFAULT 130,
            image_padding_2 INT DEFAULT 10,
            image_zoom_3 INT DEFAULT 130,
            image_padding_3 INT DEFAULT 10,
            detail_image_url VARCHAR(500),
            condition_image_url VARCHAR(500)
        )`);

        // MySQL 기존 테이블 마이그레이션 (동적 컬럼 추가)
        try {
            const [columns] = await connection.query("SHOW COLUMNS FROM products");
            const hasImageUrl1 = columns.some(c => c.Field === 'image_url_1');
            if (!hasImageUrl1) {
                await connection.query("ALTER TABLE products ADD COLUMN image_url_1 VARCHAR(500) DEFAULT NULL");
                console.log('[Database/Migration] MySQL products 테이블에 image_url_1 컬럼을 동적 추가하였습니다.');
            }
            const hasDetailImg = columns.some(c => c.Field === 'detail_image_url');
            if (!hasDetailImg) {
                await connection.query("ALTER TABLE products ADD COLUMN detail_image_url VARCHAR(500) DEFAULT NULL");
                console.log('[Database/Migration] MySQL products 테이블에 detail_image_url 컬럼을 동적 추가하였습니다.');
            }
            const hasConditionImg = columns.some(c => c.Field === 'condition_image_url');
            if (!hasConditionImg) {
                await connection.query("ALTER TABLE products ADD COLUMN condition_image_url VARCHAR(500) DEFAULT NULL");
                console.log('[Database/Migration] MySQL products 테이블에 condition_image_url 컬럼을 동적 추가하였습니다.');
            }
        } catch (mErr) {
            console.error('MySQL products 테이블 컬럼 동적 추가 실패:', mErr);
        }


        // 제품 시드 데이터 주입
        const [productRows] = await connection.query("SELECT COUNT(*) as count FROM products");
        if (productRows[0].count === 0) {
            console.log('[마이그레이션] 제품 테이블을 이미지 조절 사양으로 초기화 및 데이터를 입력합니다.');
            const defaultProducts = getSeedProducts();
            for (const p of defaultProducts) {
                await connection.query(
                    `INSERT INTO products (
                        type, category, brand, name, price, 
                        image_url, image_url_2, image_url_3, 
                        badge, description, specs, naver_talk, kakao_talk, date, 
                        image_zoom_card, image_padding_card, 
                        image_zoom_1, image_padding_1, 
                        image_zoom_2, image_padding_2, 
                        image_zoom_3, image_padding_3
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 130, 10, 130, 10, 130, 10, 130, 10)`, 
                    p
                );
            }
            console.log('[마이그레이션 성공] 제품 25종 데이터 입력 완료.');
        }

    } catch (err) {
        console.error('MySQL 데이터베이스 초기화 실패:', err);
    } finally {
        if (connection) connection.release();
    }
}

// ========================================================
// 2. SQLite3 연결 및 어댑팅 정의
// ========================================================
function initializeSQLite(sqliteDb) {
    sqliteDb.serialize(async () => {
        console.log('[Database] SQLite 데이터베이스 초기 스키마 빌드를 시작합니다.');

        // 1. 리뷰 테이블
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            author TEXT NOT NULL,
            date TEXT NOT NULL,
            image_url TEXT
        )`);

        // 2. 공지사항 테이블
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS notices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            type TEXT NOT NULL,
            is_pinned INTEGER DEFAULT 0,
            date TEXT NOT NULL
        )`, () => {
            sqliteDb.get("SELECT COUNT(*) as count FROM notices", (err, row) => {
                if (row && row.count === 0) {
                    const notices = [
                        ['2026년 하반기 신규 캐논·미놀타 무한복합기 라인업 출시 안내', '안녕하세요. 복사기마트입니다.\n\n고객 여러분께 더 높은 출력 품질과 안정적인 임대 서비스를 제공하기 위해 2026년 하반기 최신 A3 컬러/흑백 무한복합기 라인업이 신규 입고되었습니다.\n자세한 기종별 임대 비용과 혜택은 상단 카테고리 메뉴 및 고객센터 상담을 통해 확인하실 수 있습니다.\n\n감사합니다.', 'notice', 1, '2026.07.01'],
                        ['신규 렌탈 고객 대상 첫 달 임대료 50% 할인 및 정품 소모품 지원 이벤트', '신규 기업 및 사무실 오픈을 기념하여 신규 렌탈 계약 시 첫 달 임대료를 50% 지원해 드립니다.\n추가로 계약 기간 내 정품 토너 무제한 지급 및 무상 AS를 보장해 드립니다. 많은 관심 부탁드립니다!', 'event', 1, '2026.06.15'],
                        ['여름철 복합기 용지 걸림 및 습기 관리 예방법 안내', '여름철 장마 및 고온다습한 날씨로 인해 용지함 내부 복사지가 습기를 머금어 용지 걸림(Jam) 현상이 발생할 수 있습니다.\n용지는 습기가 닿지 않는 건조한 곳에 보관해 주시고, 퇴근 시 용지함을 닫아 두시기를 권장합니다. 문제가 발생하면 언제든 실시간 원격 지원을 요청해 주세요.', 'info', 0, '2026.06.02'],
                        ['복사기마트 정기 A/S 방문 점검 안내 (경기/서울/인천권)', '복사기마트는 렌탈 기기의 최상의 상태를 유지하기 위해 매월 정기 순회 점검 및 클리닝 작업을 실시하고 있습니다.\n담당 기사가 방문 일정 전 사전 연락을 드린 후 찾아뵐 예정이오니 참고 부탁드립니다.', 'info', 0, '2026.05.18'],
                        ['공식 홈페이지 리뉴얼 오픈 안내', '고객님들이 빠르고 편리하게 실시간 견적과 제품 라인업을 확인하실 수 있도록 복사기마트 공식 홈페이지가 전면 리뉴얼되었습니다.\n앞으로도 최고의 서비스로 보답하겠습니다. 감사합니다.', 'info', 0, '2026.05.01']
                    ];
                    const stmt = sqliteDb.prepare('INSERT INTO notices (title, content, type, is_pinned, date) VALUES (?, ?, ?, ?, ?)');
                    notices.forEach(n => stmt.run(n));
                    stmt.finalize();
                }
            });
        });

        // 3. 자료실 테이블
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS downloads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            file_url TEXT NOT NULL,
            file_name TEXT NOT NULL,
            date TEXT NOT NULL
        )`);

        // 4. 사용자 테이블
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            real_name TEXT,
            company_name TEXT,
            user_type TEXT DEFAULT 'personal',
            signup_date TEXT,
            last_name_update TEXT,
            last_company_update TEXT,
            last_info_update TEXT
        )`, async () => {
            const hashedPassword = await bcrypt.hash('admin1234', 10);
            const date = new Date().toISOString().split('T')[0];
            sqliteDb.run('INSERT OR IGNORE INTO users (username, password, real_name, user_type, signup_date) VALUES (?, ?, ?, ?, ?)',
                ['admin', hashedPassword, '관리자', 'admin', date]);
        });

        // 5. 제품 테이블
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            category TEXT NOT NULL,
            brand TEXT NOT NULL,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            image_url TEXT,
            image_url_1 TEXT,
            image_url_2 TEXT,
            image_url_3 TEXT,
            badge TEXT,
            description TEXT,
            specs TEXT,
            naver_talk TEXT,
            kakao_talk TEXT,
            date TEXT NOT NULL,
            image_zoom_card INTEGER DEFAULT 130,
            image_padding_card INTEGER DEFAULT 10,
            image_zoom_1 INTEGER DEFAULT 130,
            image_padding_1 INTEGER DEFAULT 10,
            image_zoom_2 INTEGER DEFAULT 130,
            image_padding_2 INTEGER DEFAULT 10,
            image_zoom_3 INTEGER DEFAULT 130,
            image_padding_3 INTEGER DEFAULT 10,
            detail_image_url TEXT,
            condition_image_url TEXT
        )`, () => {
            // SQLite 기존 테이블 컬럼 마이그레이션 (동적 컬럼 추가)
            sqliteDb.all("PRAGMA table_info(products)", (err, columns) => {
                if (!err && columns) {
                    const hasImageUrl1 = columns.some(c => c.name === 'image_url_1');
                    if (!hasImageUrl1) {
                        sqliteDb.run("ALTER TABLE products ADD COLUMN image_url_1 TEXT", () => {
                            console.log('[Database/Migration] SQLite products 테이블에 image_url_1 컬럼을 동적 추가하였습니다.');
                        });
                    }
                    const hasDetailImg = columns.some(c => c.name === 'detail_image_url');
                    if (!hasDetailImg) {
                        sqliteDb.run("ALTER TABLE products ADD COLUMN detail_image_url TEXT", () => {
                            console.log('[Database/Migration] SQLite products 테이블에 detail_image_url 컬럼을 동적 추가하였습니다.');
                        });
                    }
                    const hasConditionImg = columns.some(c => c.name === 'condition_image_url');
                    if (!hasConditionImg) {
                        sqliteDb.run("ALTER TABLE products ADD COLUMN condition_image_url TEXT", () => {
                            console.log('[Database/Migration] SQLite products 테이블에 condition_image_url 컬럼을 동적 추가하였습니다.');
                        });
                    }
                }
            });
            sqliteDb.get("SELECT COUNT(*) as count FROM products", (err, row) => {
                if (row && row.count === 0) {
                    console.log('[마이그레이션] 제품 테이블을 초기화 및 데이터를 입력합니다.');
                    const defaultProducts = getSeedProducts();
                    const stmt = sqliteDb.prepare(
                        `INSERT INTO products (
                            type, category, brand, name, price, 
                            image_url, image_url_2, image_url_3, 
                            badge, description, specs, naver_talk, kakao_talk, date, 
                            image_zoom_card, image_padding_card, 
                            image_zoom_1, image_padding_1, 
                            image_zoom_2, image_padding_2, 
                            image_zoom_3, image_padding_3
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 130, 10, 130, 10, 130, 10, 130, 10)`
                    );
                    defaultProducts.forEach(p => stmt.run(p));
                    stmt.finalize();
                }
            });
        });
    });
}

// ========================================================
// 3. 동적 DB 드라이버 바인딩 및 어댑팅
// ========================================================
if (DB_TYPE.toLowerCase() === 'mysql') {
    console.log('[Database] 활성화된 DB 엔진: MySQL(MariaDB)');
    const mysqlPool = pool;
    initializeMySQL(mysqlPool);
    dbExport = mysqlPool;
} else {
    console.log('[Database] 활성화된 DB 엔진: SQLite3 (하이브리드 어댑터)');
    let sqliteDb = null;
    let isInMemoryFallback = false;

    try {
        const sqlite3 = require('sqlite3').verbose();
        const path = require('path');
        const fs = require('fs');

        let dbPath = path.join(__dirname, 'database.db');
        // Vercel 읽기 전용 환경 대비
        if (process.env.VERCEL) {
            dbPath = '/tmp/database.db';
            if (fs.existsSync(path.join(__dirname, 'database.db'))) {
                try {
                    fs.copyFileSync(path.join(__dirname, 'database.db'), dbPath);
                } catch (cErr) {
                    console.warn('[Database] Vercel /tmp 복사 실패, :memory: 모드로 전환합니다:', cErr.message);
                    dbPath = ':memory:';
                }
            } else {
                dbPath = ':memory:';
            }
        }

        sqliteDb = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.warn('[Database] 파일 DB 오픈 실패, :memory: 모드로 재시도합니다:', err.message);
                sqliteDb = new sqlite3.Database(':memory:');
            }
        });
        initializeSQLite(sqliteDb);
    } catch (e) {
        console.warn('[Database] SQLite3 네이티브 모듈 로드 실패, JS 인메모리 어댑터로 전환합니다:', e.message);
        isInMemoryFallback = true;
    }

    if (isInMemoryFallback) {
        const seedProductsRaw = getSeedProducts();
        const inMemoryProducts = seedProductsRaw.map((p, idx) => ({
            id: idx + 1,
            type: p[0], category: p[1], brand: p[2], name: p[3], price: p[4],
            image_url: p[5], image_url_2: p[6], image_url_3: p[7],
            badge: p[8], description: p[9], specs: p[10], naver_talk: p[11], kakao_talk: p[12], date: p[13],
            image_zoom_card: 130, image_padding_card: 10,
            image_zoom_1: 130, image_padding_1: 10,
            image_zoom_2: 130, image_padding_2: 10,
            image_zoom_3: 130, image_padding_3: 10
        }));

        dbExport = {
            async query(sql, params = []) {
                const upperSql = sql.trim().toUpperCase();
                if (upperSql.includes('FROM PRODUCTS')) {
                    if (upperSql.includes('WHERE ID =')) {
                        const id = Number(params[0]);
                        const item = inMemoryProducts.find(p => p.id === id);
                        return [[item || null].filter(Boolean), null];
                    }
                    return [inMemoryProducts, null];
                }
                return [[], null];
            },
            async getConnection() { return { query: this.query.bind(this), release() {} }; },
            async end() {}
        };
    } else {
        // MySQL2/Promise 풀의 query 인터페이스로 래핑
        dbExport = {
            /**
             * SQLite 실행부를 mysql의 [rows, fields] 규격으로 래핑합니다.
             */
            query(sql, params = []) {
                return new Promise((resolve, reject) => {
                    // SQLite 전용 파라미터 호환성 보정 (바인딩 횟수가 일치하지 않을 때 대비 방어 코드)
                    const cleanParams = params.map(val => val === undefined ? null : val);
                    const upperSql = sql.trim().toUpperCase();

                    if (upperSql.startsWith('SELECT') || upperSql.startsWith('PRAGMA')) {
                        sqliteDb.all(sql, cleanParams, (err, rows) => {
                            if (err) return reject(err);
                            resolve([rows, null]);
                        });
                    } else {
                        sqliteDb.run(sql, cleanParams, function (err) {
                            if (err) {
                                // SQLite UNIQUE 제약 실패 에러를 MySQL UNIQUE 제약 에러 문구로 살짝 래핑
                                if (err.message.includes('UNIQUE constraint failed')) {
                                    err.code = 'ER_DUP_ENTRY';
                                }
                                return reject(err);
                            }
                            // MySQL insertId/affectedRows 호환 리턴
                            resolve([{ insertId: this.lastID, affectedRows: this.changes }, null]);
                        });
                    }
                });
            },

            /**
             * 커넥션 획득 인터페이스 시뮬레이션
             */
            async getConnection() {
                return {
                    query: this.query.bind(this),
                    release() {}
                };
            },

            /**
             * SQLite 연결 풀 닫기 시뮬레이션
             */
            end() {
                return new Promise((resolve, reject) => {
                    if (!sqliteDb) return resolve();
                    sqliteDb.close((err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            }
        };
    }
}

// 제품 초기 적재용 데이터 공통 함수
function getSeedProducts() {
    return [
        // [임대제품 - 컬러 복합기 11개]
        ['rental', 'color', 'canon', 'C3822', 80000, '/img/products/canon/캐논_C3822_앞.png', '/img/products/canon/캐논_C3822_옆면.png', '/img/products/canon/캐논_C3822_상세.png', 'Canon · A3 컬러', '뛰어난 화질과 가성비를 고루 갖춘 사무용 컬러 복합기입니다.', '22ppm,1200dpi,A3 출력 지원', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'color', 'canon', 'C3826', 95000, '/img/products/canon/캐논_C3826_앞.png', '/img/products/canon/캐논_C3826_옆면.png', '/img/products/canon/캐논_C3826_상세.png', 'Canon · A3 컬러', 'Wi-Fi 내장 및 고속 양면 인쇄를 지원하는 오피스 표준 복합기입니다.', '26ppm,Wi-Fi 내장,터치패널 탑재', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'color', 'canon', 'C3322', 75000, '/img/products/canon/캐논_C3322_앞.png', '/img/products/canon/캐논_C3322_옆면.png', '/img/products/canon/캐논_C3322_상세.png', 'Canon · A3 컬러', '소형 오피스에 최적화된 안정적인 인쇄 품질의 보급형 컬러 복합기.', '22ppm,저소음 설계,친환경 절전', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'color', 'canon', 'C3926', 105000, '/img/products/canon/캐논_C3926_앞.png', '/img/products/canon/캐논_C3926_옆면.png', '/img/products/canon/캐논_C3926_상세.png', 'Canon · A3 컬러', '스마트한 터치스크린과 탁월한 업무 연속성을 보장하는 고성능 모델.', '26ppm,스마트 조작 패널,모바일 연동', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'color', 'samsung', 'X6250', 130000, '/img/products/samsung/삼성_X6250_앞.png', '/img/products/samsung/삼성_X6250_옆면.png', '/img/products/samsung/삼성_X6250_상세.png', 'Samsung · A3 컬러', '대규모 비즈니스 오피스를 위한 안드로이드 UI 기반 초대형 복합기.', '25ppm,안드로이드 UI,모바일 연동', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'color', 'samsung', 'X7400', 150000, '/img/products/samsung/삼성_X7400_앞.png', '/img/products/samsung/삼성_X7400_옆면.png', '/img/products/samsung/삼성_X7400_상세.png', 'Samsung · A3 컬러', '초고속 프로세서와 강력한 내구성으로 막힘 없는 출력을 자랑합니다.', '40ppm,초고속 스캔,스마트 보안', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'color', 'samsung', 'X4255', 120000, '/img/products/samsung/삼성_X4255_앞.png', '/img/products/samsung/삼성_X4255_옆면.png', '/img/products/samsung/삼성_X4255_상세.png', 'Samsung · A3 컬러', '직관적인 인터페이스와 고성능 출력 사양을 제공하는 인기 컬러 기종.', '25ppm,안드로이드 UI,NFC 기능지원', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'color', 'minolta', 'C225', 75000, '/img/products/minolta/미놀타_C225_앞.png', '/img/products/minolta/미놀타_C225_옆면.png', '/img/products/minolta/미놀타_C225_상세.png', 'Konica Minolta · A3 컬러', '친환경 설계와 경제성을 극대화한 컴팩트한 A3 컬러 복합기.', '22ppm,저소음 설계,에코 모드', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'color', 'minolta', 'C224', 70000, '/img/products/minolta/미놀타_C224_앞.png', '/img/products/minolta/미놀타_C224_옆면.png', '/img/products/minolta/미놀타_C224_상세.png', 'Konica Minolta · A3 컬러', '스테디셀러 모델로 잔고장 없는 탄탄한 하드웨어를 제공합니다.', '22ppm,터치스크린,고화질 인쇄', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'color', 'sindoh', 'D450', 85000, '/img/products/sindoh/신도_D450_앞.png', '/img/products/sindoh/신도_D450_옆면.png', '/img/products/sindoh/신도_D450_상세.png', 'Sindoh · A3 컬러', '강력한 출력 속도와 우수한 해상도를 제공하는 신도리코 대표 컬러 복합기.', '25ppm,1200dpi,대용량 급지', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'color', 'sindoh', 'D470', 95000, '/img/products/sindoh/신도_D470_앞.png', '/img/products/sindoh/신도_D470_옆면.png', '/img/products/sindoh/신도_D470_상세.png', 'Sindoh · A3 컬러', '고성능 프로세서 탑재로 비즈니스 생산성을 배가시켜 줍니다.', '30ppm,자동양면스캔,Wi-Fi 연동', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],

        // [임대제품 - 흑백 복사기 2개]
        ['rental', 'mono', 'samsung', 'K4300', 60000, '/img/products/samsung/삼성_K4300_앞.png', '/img/products/samsung/삼성_K4300_옆면.png', '/img/products/samsung/삼성_K4300_상세.png', 'Samsung · A3 흑백', '빠른 흑백 처리 속도와 스마트 태블릿 스크린의 조화.', '30ppm,안드로이드 UI,고속 스캔', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'mono', 'minolta', 'BZ-128', 50000, '/img/products/minolta/미놀타_BZ-128_앞.png', '/img/products/minolta/미놀타_BZ-128_옆면.png', '/img/products/minolta/미놀타_BZ-128_상세.png', 'Konica Minolta · A3 흑백', '기본 오피스 비즈니스 문서 처리에 강한 내구성을 가집니다.', '28ppm,대형 LCD 패널,안정적 기기 제어', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],

        // [임대제품 - 잉크젯 복합기 4개]
        ['rental', 'inkjet', 'hp', '8610', 25000, '/img/products/hp/hp_8610_앞.png', '/img/products/hp/hp_8610_옆면.png', '/img/products/hp/hp_8610_상세.png', 'HP · A4 잉크젯', '소형 소호 오피스에서 검증된 가성비 최고의 양면 무한잉크 복합기.', '20ppm,무한잉크 지원,무선 Wi-Fi', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'inkjet', 'hp', '8620', 28000, '/img/products/hp/hp_8620_앞.png', '/img/products/hp/hp_8620_옆면.png', '/img/products/hp/hp_8620_상세.png', 'HP · A4 잉크젯', '8610 대비 상위 성능으로 더 빠른 대량 연속 인쇄가 가능합니다.', '22ppm,대형 터치스크린,NFC 연동', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'inkjet', 'hp', '9010', 30000, '/img/products/hp/hp_9010_앞.png', '/img/products/hp/hp_9010_상세.png', 'HP · A4 잉크젯', '디자인이 세련된 HP 최신형 스마트 오피스 무한잉크 시스템 복합기.', '22ppm,스마트 인쇄 연동,양면 스캔', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'inkjet', 'hp', '7740', 35000, '/img/products/hp/hp_7740_앞.png', '/img/products/hp/hp_7740_옆면.png', '/img/products/hp/hp_7740_상세.png', 'HP · A3 잉크젯', '잉크젯 복합기 중에서 드물게 A3 용지 대형 출력을 지원합니다.', '22ppm,A3 대형인쇄 지원,이중 급지함', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],

        // [임대제품 - 레이저 복합기 4개]
        ['rental', 'laser', 'samsung', 'M4070', 28000, '/img/products/samsung/삼성_M4070_앞.png', '/img/products/samsung/삼성_M4070_옆면.png', '/img/products/samsung/삼성_M4070_상세.png', 'Samsung · A4 레이저', '고속 40ppm 출력을 자랑하는 고부하 기업용 팩스/레이저 복합기.', '40ppm,자동 양면 스캔,보안 인쇄', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'laser', 'samsung', 'M2680', 25000, '/img/products/samsung/삼성_M2680_앞.png', '/img/products/samsung/삼성_M2680_옆면.png', '/img/products/samsung/삼성_M2680_상세.png', 'Samsung · A4 레이저', '개인용 책상이나 좁은 공간에 쏙 들어가는 초미니 고성능 레이저.', '26ppm,컴팩트 디자인,원터치 에코', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'laser', 'canon', 'MF-274', 25000, '/img/products/canon/캐논_MF-274_앞.png', '/img/products/canon/캐논_MF-274_옆면.png', '/img/products/canon/캐논_MF-274_상세.png', 'Canon · A4 레이저', '캐논 특유의 깔끔한 텍스트 가독성을 지원하는 고속 복합기.', '28ppm,5행 LCD 조작부,에코 모드', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['rental', 'laser', 'canon', 'MF-462', 30000, '/img/products/canon/캐논_MF-462_앞.png', '/img/products/canon/캐논_MF-462_옆면.png', '/img/products/canon/캐논_MF-462_상세.png', 'Canon · A4 레이저', '고급 사무 업무에 걸맞은 초고속 원패스 양면 스캔 탑재 모델.', '36ppm,원패스 양면스캔,보안 잠금', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],

        // [임대제품 - 기타제품 문서세단기 1개]
        ['rental', 'etc', 'etc', 'KS-1230', 15000, '/img/products/etc/현대오피스_KS-1230_앞.png', '/img/products/etc/현대오피스_KS-1230_옆면.png', '/img/products/etc/현대오피스_KS-1230_상세.png', '현대오피스 · 기타제품', 'A4 1회 최대 15매 꽃가루형 보안세단기입니다.', '보안 1등급,자동 기기 멈춤,대용량 파지함', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],

        // [판매제품 - 3개 기종]
        ['sales', 'color', 'canon', 'C3322', 1200000, '/img/products/canon/캐논_C3322_앞.png', '/img/products/canon/캐논_C3322_옆면.png', '/img/products/canon/캐논_C3322_상세.png', 'Canon · A3 컬러', '탁월한 선명성과 생산성. 소형 오피스에 적합한 가성비 최고의 컬러 복합기 일시불 구매 상품입니다.', '22ppm,1200dpi,A3 출력 지원', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['sales', 'color', 'samsung', 'X6250', 2100000, '/img/products/samsung/삼성_X6250_앞.png', '/img/products/samsung/삼성_X6250_옆면.png', '/img/products/samsung/삼성_X6250_상세.png', 'Samsung · A3 컬러', '대형 오피스용 안드로이드 UI 탑재 최상위 컬러 복합기 일시불 완제품 판매.', '25ppm,안드로이드 UI,모바일 연동', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715'],
        ['sales', 'inkjet', 'hp', '9010', 250000, '/img/products/hp/hp_9010_앞.png', '/img/products/hp/hp_9010_옆면.png', '/img/products/hp/hp_9010_상세.png', 'HP · A4 잉크젯', '개인용 서재 및 소호 사무환경에 최고의 효율을 지원하는 최신 스마트 잉크젯.', '22ppm,Wi-Fi 내장,자동 양면인쇄', 'http://talk.naver.com/WCHMKR', 'https://open.kakao.com/o/sSzFO2O', '20260715']
    ];
}

module.exports = dbExport;
