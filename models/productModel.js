/**
 * @file models/productModel.js
 * @description 제품(products) 테이블에 접근하는 모델 레이어 모듈.
 * 모든 MySQL 관련 쿼리를 캡슐화합니다.
 */

const db = require('../db');

module.exports = {
    /**
     * 특정 조건에 맞는 모든 제품 리스트를 가져옵니다.
     * @param {Object} filters { type, category }
     * @returns {Promise<Array>} 제품 객체 리스트
     */
    async getAll(filters = {}) {
        const { type, category } = filters;
        let sql = 'SELECT * FROM products';
        let params = [];
        let conditions = [];

        if (type) {
            conditions.push('type = ?');
            params.push(type);
        }
        if (category) {
            conditions.push('category = ?');
            params.push(category);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY id ASC';

        const [rows] = await db.query(sql, params);
        return rows;
    },

    /**
     * 특정 ID의 제품 상세정보를 가져옵니다.
     * @param {number|string} id 
     * @returns {Promise<Object|null>} 제품 객체 또는 null
     */
    async getById(id) {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        return rows[0] || null;
    },

    /**
     * 신규 제품을 등록합니다.
     * @param {Object} data 제품 입력 데이터
     * @returns {Promise<number>} 삽입된 행의 ID
     */
    async create(data) {
        const {
            type, category, brand, name, price,
            image_url, image_url_1, image_url_2, image_url_3,
            badge, description, specs, naver_talk, kakao_talk,
            date, image_zoom_card, image_padding_card,
            image_zoom_1, image_padding_1,
            image_zoom_2, image_padding_2,
            image_zoom_3, image_padding_3,
            detail_image_url,
            condition_image_url
        } = data;

        const [result] = await db.query(
            `INSERT INTO products (
                type, category, brand, name, price, 
                image_url, image_url_1, image_url_2, image_url_3, 
                badge, description, specs, naver_talk, kakao_talk, date, 
                image_zoom_card, image_padding_card, 
                image_zoom_1, image_padding_1, 
                image_zoom_2, image_padding_2, 
                image_zoom_3, image_padding_3,
                detail_image_url,
                condition_image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                type, category, brand, name, parseInt(price, 10),
                image_url, image_url_1, image_url_2, image_url_3,
                badge || '', description || '', specs || '', naver_talk || '', kakao_talk || '', date,
                isNaN(parseInt(image_zoom_card, 10)) ? 130 : parseInt(image_zoom_card, 10),
                isNaN(parseInt(image_padding_card, 10)) ? 10 : parseInt(image_padding_card, 10),
                isNaN(parseInt(image_zoom_1, 10)) ? 130 : parseInt(image_zoom_1, 10),
                isNaN(parseInt(image_padding_1, 10)) ? 10 : parseInt(image_padding_1, 10),
                isNaN(parseInt(image_zoom_2, 10)) ? 130 : parseInt(image_zoom_2, 10),
                isNaN(parseInt(image_padding_2, 10)) ? 10 : parseInt(image_padding_2, 10),
                isNaN(parseInt(image_zoom_3, 10)) ? 130 : parseInt(image_zoom_3, 10),
                isNaN(parseInt(image_padding_3, 10)) ? 10 : parseInt(image_padding_3, 10),
                detail_image_url || null,
                condition_image_url || null
            ]
        );
        return result.insertId;
    },

    /**
     * 특정 ID의 제품 정보를 수정합니다.
     * @param {number|string} id 
     * @param {Object} data 수정할 데이터
     */
    async update(id, data) {
        const {
            type, category, brand, name, price,
            badge, description, specs, naver_talk, kakao_talk,
            image_zoom_card, image_padding_card,
            image_zoom_1, image_padding_1,
            image_zoom_2, image_padding_2,
            image_zoom_3, image_padding_3,
            image_url, image_url_1, image_url_2, image_url_3,
            detail_image_url,
            condition_image_url
        } = data;

        let sql = `UPDATE products SET 
            type = ?, category = ?, brand = ?, name = ?, price = ?, 
            badge = ?, description = ?, specs = ?, naver_talk = ?, kakao_talk = ?, 
            image_zoom_card = ?, image_padding_card = ?, 
            image_zoom_1 = ?, image_padding_1 = ?, 
            image_zoom_2 = ?, image_padding_2 = ?, 
            image_zoom_3 = ?, image_padding_3 = ?`;
        
        let params = [
            type, category, brand, name, parseInt(price, 10),
            badge || '', description || '', specs || '', naver_talk || '', kakao_talk || '',
            isNaN(parseInt(image_zoom_card, 10)) ? 130 : parseInt(image_zoom_card, 10),
            isNaN(parseInt(image_padding_card, 10)) ? 10 : parseInt(image_padding_card, 10),
            isNaN(parseInt(image_zoom_1, 10)) ? 130 : parseInt(image_zoom_1, 10),
            isNaN(parseInt(image_padding_1, 10)) ? 10 : parseInt(image_padding_1, 10),
            isNaN(parseInt(image_zoom_2, 10)) ? 130 : parseInt(image_zoom_2, 10),
            isNaN(parseInt(image_padding_2, 10)) ? 10 : parseInt(image_padding_2, 10),
            isNaN(parseInt(image_zoom_3, 10)) ? 130 : parseInt(image_zoom_3, 10),
            isNaN(parseInt(image_padding_3, 10)) ? 10 : parseInt(image_padding_3, 10)
        ];

        // 이미지 업로드 데이터가 존재할 경우 동적으로 UPDATE 대상에 포함
        if (image_url) {
            sql += ', image_url = ?';
            params.push(image_url);
        }
        if (image_url_1) {
            sql += ', image_url_1 = ?';
            params.push(image_url_1);
        }
        if (image_url_2) {
            sql += ', image_url_2 = ?';
            params.push(image_url_2);
        }
        if (image_url_3) {
            sql += ', image_url_3 = ?';
            params.push(image_url_3);
        }
        if (detail_image_url) {
            sql += ', detail_image_url = ?';
            params.push(detail_image_url);
        }
        if (condition_image_url) {
            sql += ', condition_image_url = ?';
            params.push(condition_image_url);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        await db.query(sql, params);
    },

    /**
     * 특정 ID의 제품을 삭제합니다.
     * @param {number|string} id 
     */
    async delete(id) {
        await db.query('DELETE FROM products WHERE id = ?', [id]);
    }
};
