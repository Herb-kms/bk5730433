/**
 * @file services/storageService.js
 * @description ?ㅽ由ъ? ?명고?댁?異?? 紐⑤. 
 * STORAGE_PROVIDER ?寃?蹂?? ?곕?濡而??????ㅽ ?? ?몃? ?대쇱곕(S3) ?깆쇰? ??μ 遺湲고硫?
 * ?대몄? ?濡? ? Sharp ?쇱대??щ━瑜??듯 WebP 蹂? 諛 理??瑜????⑸??
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PROVIDER = process.env.STORAGE_PROVIDER || 'local';

// ========================================================
// 濡而??????ㅽ ?ㅽ由ъ? 援ы泥?// ========================================================
const LocalStorage = {
    /**
     * 濡而??ㅽ由ъ?? 踰???곗댄곕? ??쇰? ??ν⑸??
     * @param {Buffer} buffer 
     * @param {string} folder 
     * @param {string} filename 
     * @returns {Promise<string>} ??λ ??쇱 ???洹?URL
     */
    async save(buffer, folder, filename) {
        const targetDir = path.resolve(folder);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        const filePath = path.join(targetDir, filename);
        await fs.promises.writeFile(filePath, buffer);
        
        // ?곗댄곕??댁????諛 ?대쇱댁명??鍮?????? 寃쎈? 諛?
        return `/${folder}/${filename}`;
    },

    /**
     * 濡而??ㅽ由ъ??? ??쇱 ???⑸??
     * @param {string} fileUrl 
     */
    async delete(fileUrl) {
        if (!fileUrl) return;
        // URL 寃쎈? ?肄??諛 ?? 寃쎈? 議고?(?: /uploads/file.png -> ./uploads/file.png)
        const cleanPath = decodeURIComponent(fileUrl).replace(/^\/+/, '');
        const filePath = path.resolve(cleanPath);

        if (fs.existsSync(filePath)) {
            try {
                await fs.promises.unlink(filePath);
                console.log(`[LocalStorage] ????? ?깃났: ${filePath}`);
            } catch (err) {
                console.error(`[LocalStorage] ????? ?ㅽ? ${filePath}`, err);
            }
        }
    }
};

// ========================================================
// ?몃? ?대쇱곕 ?ㅽ由ъ?(S3 ?? 援ы泥?(以?κ린 ?곕 ?鍮 堉? ???
// ========================================================
const S3Storage = {
    async save(buffer, folder, filename) {
        // 異? AWS SDK ?쇱대??щ━ ?곕 ? ?닿납? 援ы
        // const s3 = new AWS.S3();
        // await s3.putObject({ Bucket: process.env.S3_BUCKET, Key: `${folder}/${filename}`, Body: buffer }).promise();
        // return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${folder}/${filename}`;
        
        console.warn('[S3Storage] S3 紐⑤???吏 ?ㅼ?吏 ???듬?? 濡而???μ濡 ?? ?泥댄⑸??');
        return LocalStorage.save(buffer, folder, filename);
    },

    async delete(fileUrl) {
        // 異? AWS SDK ?쇱대??щ━ ?곕 ? ?닿납? 援ы
        // const key = fileUrl.split('.com/')[1];
        // await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: key }).promise();
        console.warn('[S3Storage] S3 紐⑤???吏 ?ㅼ?吏 ???듬?? 濡而???濡 ?? ?泥댄⑸??');
        return LocalStorage.delete(fileUrl);
    }
};

// ========================================================
// ??깊? ?ㅽ由ъ? ??쇱대? ??
// ========================================================
const getStorageDriver = () => {
    switch (PROVIDER.toLowerCase()) {
        case 's3':
            return S3Storage;
        case 'local':
        default:
            return LocalStorage;
    }
};

const activeDriver = getStorageDriver();

/**
 * ?대몄? 理?? 諛 由ъъ댁? 泥由??⑥
 * @param {Buffer} buffer 
 * @returns {Promise<Buffer>} WebP濡 理??? ?대몄? 踰?? */
async function optimizeImage(buffer) {
    return sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true }) // 理? 媛濡 1200px, ?? 鍮???        .webp({ quality: 80 }) // WebP 蹂? 諛 ?吏 80%
        .toBuffer();
}

module.exports = {
    /**
     * ??쇱 ?ㅽ由ъ?? ??ν怨 ?洹?媛?ν ??/?? URL? 諛??⑸??
     * @param {Object} file multer memoryStorage? file 媛泥?     * @param {string} folder ??ν ?寃 ???由?(?: 'uploads')
     * @param {Object} options 理?? ????듭
     * @returns {Promise<string>} ???URL 寃쎈?
     */
    async uploadFile(file, folder = 'uploads', options = {}) {
        if (!file || !file.buffer) {
            throw new Error('?щ?瑜댁? ?? ???踰?쇱???');
        }

        const isImage = file.mimetype.startsWith('image/');
        const shouldOptimize = isImage && options.optimizeImage !== false;

        let finalBuffer = file.buffer;
        let finalFilename = '';

        if (shouldOptimize) {
            // ?대몄? 理?? 吏? 諛 WebP ??????            finalBuffer = await optimizeImage(file.buffer);
            finalFilename = `${Date.now()}_optimized.webp`;
        } else {
            // ?쇰? ????? 理?? 鍮??깊 ? ?蹂?蹂댁〈
            const ext = path.extname(file.originalname);
            finalFilename = `${Date.now()}${ext}`;
        }

        return activeDriver.save(finalBuffer, folder, finalFilename);
    },

    /**
     * ?ㅽ由ъ??? 吏?? URL? ??쇱 ?嫄고⑸??
     * @param {string} fileUrl 
     */
    async deleteFile(fileUrl) {
        return activeDriver.delete(fileUrl);
    }
};
