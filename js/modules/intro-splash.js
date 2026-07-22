/**
 * @file js/modules/intro-splash.js
 * @description 브라우저 세션 최초 1회 방문 전용 신도리코 1:1 브랜드 인트로 모듈
 */

export function initIntroSplash() {
    const splash = document.getElementById('brandIntroSplash');
    const skipBtn = document.getElementById('introSkipBtn');
    const headerNode = document.querySelector('header.hero-nav-bar-fluid');

    // 세션 스토리지 기반 최초 1회 방문 제어 (최초 접속 시에만 인트로 재생)
    const hasSeenIntro = sessionStorage.getItem('copierMartIntroSeen');

    if (hasSeenIntro && splash) {
        // 이미 이번 브라우저 세션에서 인트로를 시청한 경우 즉시 제거 후 메인 화면 노출
        if (splash.parentNode) {
            splash.parentNode.removeChild(splash);
        }
        if (headerNode) {
            headerNode.classList.remove('intro-running');
        }
        triggerStaggeredEntrance();
        init3DTiltEffect();
        return;
    }

    // 최초 접속 시 세션 시청 완료 플래그 저장
    sessionStorage.setItem('copierMartIntroSeen', 'true');

    // 1. 헤더 바텀 높이 동적 동기화 및 인트로 시너지 클래스 활성화
    if (splash && headerNode) {
        headerNode.classList.add('intro-running');

        const syncSplashPosition = () => {
            const hHeight = headerNode.offsetHeight || 80;
            splash.style.top = `${hHeight}px`;
            splash.style.height = `calc(100% - ${hHeight}px)`;
        };
        syncSplashPosition();
        window.addEventListener('resize', syncSplashPosition, { passive: true });
    }

    // 2. 인트로 스플래시 종료 및 히어로 콘텐츠 노출
    let isDismissed = false;

    const dismissSplash = () => {
        if (isDismissed || !splash) return;
        isDismissed = true;

        splash.classList.add('fade-out');

        if (headerNode) {
            headerNode.classList.remove('intro-running');
        }

        // 히어로 주요 요소 순차 등장(Staggered Entrance Animation) 구동
        triggerStaggeredEntrance();

        setTimeout(() => {
            if (splash.parentNode) {
                splash.parentNode.removeChild(splash);
            }
        }, 850);
    };

    if (splash) {
        // 자동 2.0초 후 부드럽게 페이드아웃 되며 히어로 화면 노출
        const autoTimer = setTimeout(dismissSplash, 2000);

        // 스킵 버튼 또는 인트로 클릭 시 즉시 페이드아웃
        if (skipBtn) {
            skipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                clearTimeout(autoTimer);
                dismissSplash();
            });
        }

        splash.addEventListener('click', () => {
            clearTimeout(autoTimer);
            dismissSplash();
        });
    } else {
        triggerStaggeredEntrance();
    }

    // 3. 쇼케이스 카드 3D 패럴랙스 틸트 인터랙션
    init3DTiltEffect();
}

/**
 * 히어로 주요 요소 순차 등장(Staggered Entrance)
 */
function triggerStaggeredEntrance() {
    const staggerItems = document.querySelectorAll('.stagger-item');
    staggerItems.forEach((el, idx) => {
        setTimeout(() => {
            el.classList.add('animated');
        }, idx * 160 + 80);
    });
}

/**
 * 쇼케이스 카드 3D 커서 패럴랙스 틸트 효과
 */
function init3DTiltEffect() {
    const cards = document.querySelectorAll('.copier-showcase-item');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
        });
    });
}
