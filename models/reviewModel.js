/**
 * @file models/reviewModel.js
 * @description 설치후기(reviews) 테이블에 접근하는 모델 레이어 모듈.
 * 모든 MySQL 관련 설치후기 쿼리를 캡슐화합니다.
 */

const db = require('../db');

module.exports = {
    /**
     * 카테고리에 해당하는 모든 설치후기를 최신순으로 가져옵니다.
     * @param {string} category 
     * @returns {Promise<Array>} 후기 객체 리스트
     */
    async getByCategory(category) {
        let sql = 'SELECT * FROM reviews ORDER BY id DESC';
        let params = [];

        if (category && category !== 'all') {
            sql = 'SELECT * FROM reviews WHERE category = ? ORDER BY id DESC';
            params = [category];
        }

        const [rows] = await db.query(sql, params);
        return rows;
    },

    /**
     * 특정 ID의 설치후기를 가져옵니다.
     * @param {number|string} id 
     * @returns {Promise<Object|null>} 후기 객체 또는 null
     */
    async getById(id) {
        const [rows] = await db.query('SELECT * FROM reviews WHERE id = ?', [id]);
        return rows[0] || null;
    },

    /**
     * 신규 설치후기를 등록합니다.
     * @param {Object} data 후기 입력 데이터
     * @returns {Promise<number>} 삽입된 행의 ID
     */
    async create(data) {
        const { category, title, content, author, date, image_url } = data;
        const [result] = await db.query(
            'INSERT INTO reviews (category, title, content, author, date, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [category, title, content, author, date, image_url]
        );
        return result.insertId;
    },

    /**
     * 특정 ID의 설치후기를 수정합니다.
     * @param {number|string} id 
     * @param {Object} data 수정할 데이터
     */
    async update(id, data) {
        const { category, title, content, author, image_url } = data;

        let sql = 'UPDATE reviews SET category = ?, title = ?, content = ?, author = ?';
        let params = [category, title, content, author];

        if (image_url) {
            sql += ', image_url = ?';
            params.push(image_url);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        await db.query(sql, params);
    },

    /**
     * 특정 ID의 설치후기를 삭제합니다.
     * @param {number|string} id 
     */
    async delete(id) {
        await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    }
};
