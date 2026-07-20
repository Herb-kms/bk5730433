/**
 * @file models/noticeModel.js
 * @description 공지사항(notices) 테이블에 접근하는 모델 레이어 모듈.
 * 모든 MySQL 관련 공지사항 쿼리를 캡슐화합니다.
 */

const db = require('../db');

module.exports = {
    /**
     * 전체 공지사항 리스트를 중요공지 우선 및 최신순으로 가져옵니다.
     * @returns {Promise<Array>} 공지사항 객체 리스트
     */
    async getAll() {
        const [rows] = await db.query('SELECT * FROM notices ORDER BY is_pinned DESC, id DESC');
        return rows;
    },

    /**
     * 신규 공지사항을 등록합니다.
     * @param {Object} data { title, content, type, is_pinned, date }
     * @returns {Promise<number>} 삽입된 행의 ID
     */
    async create(data) {
        const { title, content, type, is_pinned, date } = data;
        const [result] = await db.query(
            'INSERT INTO notices (title, content, type, is_pinned, date) VALUES (?, ?, ?, ?, ?)',
            [title, content, type, is_pinned ? 1 : 0, date]
        );
        return result.insertId;
    },

    /**
     * 특정 ID의 공지사항 정보를 수정합니다.
     * @param {number|string} id 
     * @param {Object} data { title, content, type, is_pinned }
     */
    async update(id, data) {
        const { title, content, type, is_pinned } = data;
        await db.query(
            'UPDATE notices SET title = ?, content = ?, type = ?, is_pinned = ? WHERE id = ?',
            [title, content, type, is_pinned ? 1 : 0, id]
        );
    },

    /**
     * 특정 ID의 공지사항을 삭제합니다.
     * @param {number|string} id 
     */
    async delete(id) {
        await db.query('DELETE FROM notices WHERE id = ?', [id]);
    }
};
