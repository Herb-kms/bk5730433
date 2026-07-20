/**
 * @file models/downloadModel.js
 * @description 자료실(downloads) 테이블에 접근하는 모델 레이어 모듈.
 * 모든 MySQL 관련 자료실 쿼리를 캡슐화합니다.
 */

const db = require('../db');

module.exports = {
    /**
     * 전체 자료 리스트를 최신순으로 가져옵니다.
     * @returns {Promise<Array>} 자료 객체 리스트
     */
    async getAll() {
        const [rows] = await db.query('SELECT * FROM downloads ORDER BY id DESC');
        return rows;
    },

    /**
     * 특정 ID의 자료 상세정보를 가져옵니다.
     * @param {number|string} id 
     * @returns {Promise<Object|null>} 자료 객체 또는 null
     */
    async getById(id) {
        const [rows] = await db.query('SELECT * FROM downloads WHERE id = ?', [id]);
        return rows[0] || null;
    },

    /**
     * 신규 자료를 등록합니다.
     * @param {Object} data 자료 입력 데이터
     * @returns {Promise<number>} 삽입된 행의 ID
     */
    async create(data) {
        const { title, description, file_url, file_name, date } = data;
        const [result] = await db.query(
            'INSERT INTO downloads (title, description, file_url, file_name, date) VALUES (?, ?, ?, ?, ?)',
            [title, description || '', file_url, file_name, date]
        );
        return result.insertId;
    },

    /**
     * 특정 ID의 자료 정보를 수정합니다.
     * @param {number|string} id 
     * @param {Object} data 수정할 데이터
     */
    async update(id, data) {
        const { title, description, file_url, file_name } = data;

        let sql = 'UPDATE downloads SET title = ?, description = ?';
        let params = [title, description || ''];

        if (file_url && file_name) {
            sql += ', file_url = ?, file_name = ?';
            params.push(file_url, file_name);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        await db.query(sql, params);
    },

    /**
     * 특정 ID의 자료 정보를 삭제합니다.
     * @param {number|string} id 
     */
    async delete(id) {
        await db.query('DELETE FROM downloads WHERE id = ?', [id]);
    }
};
