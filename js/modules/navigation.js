/**
 * @file js/modules/navigation.js
 * @description 웹 앱의 빠른 페이지 전환을 위한 AJAX 동적 내비게이션(SPA 라우팅) 및 GNB/LNB 액티브 링크 갱신 제어, 반응형 모바일 햄버거 메뉴 핸들링 모듈
 */

import { loadAndRenderProducts } from './products.js';
import { initReviewsPage } from './reviews.js';
import { initNoticePage } from './notice.js';
import { initProductDetailPage } from './product-detail.js';

export function initAjaxNavigation() {
    // 1. 모바일 햄버거 메뉴 토글 바인딩 실행
    initMobileMenu();

    // 2. 로컬 링크 중 자료실, 어드민, 로그인, 전화 링크 등을 제외한 subpage 링크들 가로채기
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // 제외 대상 경로 필터
        if (
            href.startsWith('http') || 
            href.startsWith('tel:') || 
            href.startsWith('#') || 
            href.includes('admin') || 
            href.includes('login') || 
            href.includes('myinfo') || 
            href.includes('signup') ||
            link.getAttribute('target') === '_blank'
        ) {
            return;
        }

        // SPA 내비게이션 대상 파일들
        const spaPages = ['rental.html', 'sales.html', 'reviews.html', 'notice.html'];
        const isSpaTarget = spaPages.some(page => href.includes(page) || href === '/' || href === '');
        if (!isSpaTarget) return;

        e.preventDefault();
        navigateToPage(href);
    });

    // 뒤로가기 / 앞으로가기 감지
    window.addEventListener('popstate', (e) => {
        navigateToPage(window.location.pathname + window.location.search, false);
    });
}

export async function navigateToPage(url, pushState = true) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('페이지를 가져올 수 없습니다.');
        const html = await response.text();

        // 임시 DOM 파서
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // SPA 동적 리소스(CSS 스타일시트) 주입 보완 - 리소스 누수 방지 완료
        const nextLinks = doc.querySelectorAll('link[rel="stylesheet"]');
        const currentHead = document.head;
        nextLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                const exists = Array.from(currentHead.querySelectorAll('link[rel="stylesheet"]'))
                                    .some(cLink => cLink.getAttribute('href') === href);
                if (!exists) {
                    const newLink = document.createElement('link');
                    newLink.rel = 'stylesheet';
                    newLink.href = href;
                    currentHead.appendChild(newLink);
                }
            }
        });

        // 콘텐츠 영역 교체
        const currentHero = document.querySelector('.sub-hero');
        const nextHero = doc.querySelector('.sub-hero');
        if (currentHero && nextHero) {
            currentHero.innerHTML = nextHero.innerHTML;
        }

        const currentContent = document.querySelector('.product-page') || document.querySelector('.reviews') || document.querySelector('.notice-page') || document.querySelector('.myinfo-wrapper');
        const nextContent = doc.querySelector('.product-page') || doc.querySelector('.reviews') || doc.querySelector('.notice-page') || doc.querySelector('.myinfo-wrapper');

        if (currentContent && nextContent) {
            // 클래스 교체 및 내용 교체
            currentContent.className = nextContent.className;
            currentContent.innerHTML = nextContent.innerHTML;
            
            // 이전 페이지에서 설정된 dataset 상태 값 초기화 (이전 페이지의 바인딩 플래그 제거)
            for (const key in currentContent.dataset) {
                delete currentContent.dataset[key];
            }
            
            // SPA 이동 시 브라우저 타이틀 동기화 버그 패치
            document.title = doc.title || '복사기마트';
        } else {
            // 다른 템플릿일 경우 풀 리로드 폴백
            window.location.href = url;
            return;
        }

        // 브라우저 URL 갱신
        if (pushState) {
            history.pushState(null, '', url);
        }

        // 활성화 메뉴바 하이라이트
        updateActiveMenuLinks(url);

        // 스크롤 상단 이동
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 신규 콘텐츠 관련 렌더러 / 리스너 바인딩 트리거
        if (url.includes('rental.html')) {
            await loadAndRenderProducts('rental');
        } else if (url.includes('sales.html')) {
            await loadAndRenderProducts('sales');
        } else if (url.includes('reviews.html')) {
            await initReviewsPage();
        } else if (url.includes('notice.html')) {
            await initNoticePage();
        } else if (url.includes('product-detail.html')) {
            await initProductDetailPage();
        }

    } catch (err) {
        console.error('AJAX navigation 실패, 풀 리로드 수행:', err);
        window.location.href = url;
    }
}

export function updateActiveMenuLinks(url) {
    const cleanUrl = url.split('?')[0].split('/').pop() || 'index.html';

    const gnbLinks = document.querySelectorAll('.hero-nav a');
    gnbLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === cleanUrl) {
            link.classList.add('nav-active');
        } else {
            link.classList.remove('nav-active');
        }
    });
}

// ========================================================
// 4. 모바일 햄버거 메뉴 오버레이/드로어 핸들링 로직
// ========================================================
export function initMobileMenu() {
    // 이벤트 위임을 활용하여 SPA 전환 후에도 버튼 클릭 리스너가 유실되지 않도록 보장
    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('#mobileToggleBtn');
        if (toggleBtn) {
            const header = document.querySelector('header.hero-nav-bar-fluid');
            if (header) {
                const isActive = header.classList.toggle('mobile-menu-active');
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    if (isActive) {
                        icon.className = 'fas fa-times'; // X 아이콘으로 교체
                    } else {
                        icon.className = 'fas fa-bars'; // 삼선 아이콘으로 교체
                    }
                }
            }
            return;
        }

        // 메뉴 링크를 클릭해서 SPA 이동하거나 할 때 드로어가 열려있다면 자동으로 닫기
        const isMenuLink = e.target.closest('.hero-nav a');
        if (isMenuLink) {
            closeMobileMenu();
        }
        
        // 배경(암막) 영역을 클릭했을 때도 닫히도록 예외 처리
        const header = document.querySelector('header.hero-nav-bar-fluid');
        if (header && header.classList.contains('mobile-menu-active')) {
            // 클릭 대상이 드로어(.hero-nav) 내부나 토글버튼이 아니라면 닫기
            if (!e.target.closest('.hero-nav') && !e.target.closest('#mobileToggleBtn')) {
                closeMobileMenu();
            }
        }
    });
}

export function closeMobileMenu() {
    const header = document.querySelector('header.hero-nav-bar-fluid');
    if (header && header.classList.contains('mobile-menu-active')) {
        header.classList.remove('mobile-menu-active');
        const toggleBtn = document.getElementById('mobileToggleBtn');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        }
    }
}
