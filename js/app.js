/**
 * @file js/app.js
 * @description 복사기마트 프론트엔드 ES6 모듈 시스템 통합 진입점(Entry Point). DOMContentLoaded 이벤트에 맞춰 각 하위 모듈들을 실행 및 바인딩.
 */

import { initCommonInteractions } from './modules/common.js';
import { checkSessionAndRenderHeader } from './modules/auth.js';
import { loadAndRenderProducts } from './modules/products.js';
import { initReviewsPage, loadMainPageReviews } from './modules/reviews.js';
import { initNoticePage } from './modules/notice.js';
import { initAjaxNavigation, updateActiveMenuLinks } from './modules/navigation.js';
import { initProductDetailPage } from './modules/product-detail.js';
import { initIntroSplash } from './modules/intro-splash.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 공통 모션 & 헤더 상태 초기화
    initCommonInteractions();
    await checkSessionAndRenderHeader();

    // 2. SPA 라우팅 네비게이션 엔진 구동
    initAjaxNavigation();

    // 3. 현재 페이지에 맞는 동적 데이터 로딩 수행
    const path = window.location.pathname;

    if (path.includes('rental.html')) {
        await loadAndRenderProducts('rental');
    } else if (path.includes('sales.html')) {
        await loadAndRenderProducts('sales');
    } else if (path.includes('reviews.html')) {
        await initReviewsPage();
    } else if (path.includes('notice.html')) {
        await initNoticePage();
    } else if (path.includes('product-detail.html')) {
        await initProductDetailPage();
    } else if (path.endsWith('/') || path.includes('index.html')) {
        // 메인 페이지 인트로 스플래시 구동 & 최신 후기 노출
        initIntroSplash();
        await loadMainPageReviews();
    }

    // 초도 페이지에 맞춘 GNB 하이라이트 반영
    updateActiveMenuLinks(window.location.pathname + window.location.search);
});
