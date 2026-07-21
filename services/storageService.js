/**
 * @file services/storageService.js
 * @description 스토리지 인터페이스 추상화 모듈.
 * STORAGE_PROVIDER 환경 변수에 따라 로컬 파일 시스템 또는 외부 클라우드(S3) 등으로 저장을 분기하며,
 * 이미지 업로드 시 Sharp 라이브러리를 통한 WebP 변환 및 최적화를 수행합니다.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PROVIDER = process.env.STORAGE_PROVIDER || 'local';

// ========================================================
// 로컬 파일 시스템 스토리지 구현체
// ========================================================
const LocalStorage = {
    /**
     * 로컬 스토리지에 버퍼 데이터를 파일로 저장합니다.
     * @param {Buffer} buffer 
     * @param {string} folder 
     * @param {string} filename 
     * @returns {Promise<string>} 저장된 파일의 접근 URL
     */
    async save(buffer, folder, filename) {
        const targetDir = path.resolve(folder);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        const filePath = path.join(targetDir, filename);
        await fs.promises.writeFile(filePath, buffer);
        
        // 데이터베이스 저장 및 클라이언트 서빙용 상대 경로 반환
        return `/${folder}/${filename}`;
    },

    /**
     * 로컬 스토리지에서 파일을 삭제합니다.
     * @param {string} fileUrl 
     */
    async delete(fileUrl) {
        if (!fileUrl) return;
        // URL 경로 디코딩 및 상대 경로 조합 (예: /uploads/file.png -> ./uploads/file.png)
        const cleanPath = decodeURIComponent(fileUrl).replace(/^\/+/, '');
        const filePath = path.resolve(cleanPath);

        if (fs.existsSync(filePath)) {
            try {
                await fs.promises.unlink(filePath);
                console.log(`[LocalStorage] 파일 삭제 성공: ${filePath}`);
            } catch (err) {
                console.error(`[LocalStorage] 파일 삭제 실패: ${filePath}`, err);
            }
        }
    }
};

// ========================================================
// 외부 클라우드 스토리지(S3 등) 구현체 (중장기 연동 대비 껍데기 구조)
// ========================================================
const S3Storage = {
    async save(buffer, folder, filename) {
        // 추후 AWS SDK 라이브러리 연동 시 이곳에 구현
        // const s3 = new AWS.S3();
        // await s3.putObject({ Bucket: process.env.S3_BUCKET, Key: `${folder}/${filename}`, Body: buffer }).promise();
        // return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${folder}/${filename}`;
        
        console.warn('[S3Storage] S3 모듈이 아직 설정되지 않았습니다. 로컬 저장소로 임시 대체합니다.');
        return LocalStorage.save(buffer, folder, filename);
    },

    async delete(fileUrl) {
        // 추후 AWS SDK 라이브러리 연동 시 이곳에 구현
        // const key = fileUrl.split('.com/')[1];
        // await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: key }).promise();
        console.warn('[S3Storage] S3 모듈이 아직 설정되지 않았습니다. 로컬 삭제로 임시 대체합니다.');
        return LocalStorage.delete(fileUrl);
    }
};

// ========================================================
// 활성화된 스토리지 드라이버 결정
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
 * 이미지 최적화 및 리사이즈 처리 함수
 * @param {Buffer} buffer 
 * @returns {Promise<Buffer>} WebP로 최적화된 이미지 버퍼
 */
async function optimizeImage(buffer) {
    return sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true }) // 최대 가로 1200px, 정비율 유지
        .webp({ quality: 80 }) // WebP 변환 및 화질 80%
        .toBuffer();
}

module.exports = {
    /**
     * 파일을 스토리지에 저장하고 접근 가능한 상대/절대 URL을 반환합니다.
     * @param {Object} file multer memoryStorage의 file 객체
     * @param {string} folder 저장할 타겟 디렉토리 (예: 'uploads')
     * @param {Object} options 최적화 적용 옵션
     * @returns {Promise<string>} 파일 URL 경로
     */
    async uploadFile(file, folder = 'uploads', options = {}) {
        if (!file || !file.buffer) {
            throw new Error('올바르지 않은 파일 버퍼입니다.');
        }

        const isImage = file.mimetype.startsWith('image/');
        const shouldOptimize = isImage && options.optimizeImage !== false;

        let finalBuffer = file.buffer;
        let finalFilename = '';

        if (shouldOptimize) {
            // 이미지 최적화 진행 및 WebP 확장자 지정
            finalBuffer = await optimizeImage(file.buffer);
            finalFilename = `${Date.now()}_optimized.webp`;
        } else {
            // 일반 파일 또는 최적화 비활성화 시 원본 보존
            const ext = path.extname(file.originalname);
            finalFilename = `${Date.now()}${ext}`;
        }

        return activeDriver.save(finalBuffer, folder, finalFilename);
    },

    /**
     * 스토리지에서 지정된 URL의 파일을 제거합니다.
     * @param {string} fileUrl 
     */
    async deleteFile(fileUrl) {
        return activeDriver.delete(fileUrl);
    }
};
