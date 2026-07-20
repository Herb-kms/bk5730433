/**
 * @file models/userModel.js
 * @description 사용자(users) 테이블에 접근하는 모델 레이어 모듈.
 * 모든 MySQL 관련 회원 쿼리를 캡슐화합니다.
 */

const db = require('../db');

module.exports = {
    /**
     * 특정 ID의 사용자 정보를 가져옵니다.
     * @param {number|string} id 
     * @returns {Promise<Object|null>} 회원 객체 또는 null
     */
    async getById(id) {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    },

    /**
     * 특정 사용자명(username)으로 회원 정보를 조회합니다.
     * @param {string} username 
     * @returns {Promise<Object|null>} 회원 객체 또는 null
     */
    async getByUsername(username) {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0] || null;
    },

    /**
     * 신규 사용자를 추가(회원 가입)합니다.
     * @param {Object} data { username, password, real_name, company_name, user_type, signup_date }
     * @returns {Promise<number>} 삽입된 행의 ID
     */
    async create(data) {
        const { username, password, real_name, company_name, user_type, signup_date } = data;
        const [result] = await db.query(
            'INSERT INTO users (username, password, real_name, company_name, user_type, signup_date) VALUES (?, ?, ?, ?, ?, ?)',
            [username, password, real_name, company_name || '', user_type || 'personal', signup_date]
        );
        return result.insertId;
    },

    /**
     * 전체 회원 목록을 가입일순으로 조회합니다. (비밀번호 표시는 제외)
     * @returns {Promise<Array>} 회원 객체 리스트
     */
    async getAll() {
        const [rows] = await db.query(
            'SELECT id, username, real_name, company_name, user_type, signup_date FROM users ORDER BY id DESC'
        );
        return rows;
    },

    /**
     * 특정 ID의 회원 정보를 업데이트합니다. (관리자용)
     * @param {number|string} id 
     * @param {Object} data 
     */
    async update(id, data) {
        const { username, password, real_name, company_name, user_type } = data;

        if (password) {
            await db.query(
                'UPDATE users SET username = ?, password = ?, real_name = ?, company_name = ?, user_type = ? WHERE id = ?',
                [username, password, real_name || '', company_name || '', user_type, id]
            );
        } else {
            await db.query(
                'UPDATE users SET username = ?, real_name = ?, company_name = ?, user_type = ? WHERE id = ?',
                [username, real_name || '', company_name || '', user_type, id]
            );
        }
    },

    /**
     * 특정 사용자의 이름을 업데이트합니다.
     * @param {number|string} id 
     * @param {string} realName 
     * @param {string} updateTime 
     */
    async updateName(id, realName, updateTime) {
        await db.query(
            'UPDATE users SET real_name = ?, last_name_update = ? WHERE id = ?',
            [realName, updateTime, id]
        );
    },

    /**
     * 특정 사용자의 거래처명을 업데이트합니다.
     * @param {number|string} id 
     * @param {string} companyName 
     * @param {string} updateTime 
     */
    async updateCompany(id, companyName, updateTime) {
        await db.query(
            'UPDATE users SET company_name = ?, last_company_update = ? WHERE id = ?',
            [companyName, updateTime, id]
        );
    },

    /**
     * 여러 필드를 동적으로 업데이트합니다. (내 정보 수정 시 다중 컬럼 대응)
     * @param {number|string} id 
     * @param {Array} updateFields SQL 컬럼 바인딩 리스트 (예: ["real_name = ?", "last_name_update = ?"])
     * @param {Array} params 바인딩할 파라미터 값들
     */
    async updateDynamic(id, updateFields, params) {
        const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        await db.query(sql, [...params, id]);
    },

    /**
     * 특정 사용자를 삭제합니다.
     * @param {number|string} id 
     */
    async delete(id) {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
    }
};
