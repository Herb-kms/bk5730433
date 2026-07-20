/**
 * @file js/modules/common.js
 * @description 홈페이지 내 모바일 토글 메뉴, 히어로 슬라이더, 스크롤 페이드 무브먼트 및 퀵 메뉴 인터랙션 공통 제어 모듈
 */

export function initCommonInteractions() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const slides = document.querySelectorAll('.hero-slider .slide');
    const revealElements = document.querySelectorAll('.reveal');

    // 1. 모바일 메뉴 토글
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });
    }

    // 외부 영역 클릭 시 모바일 메뉴 닫기
    document.addEventListener('click', (e) => {
        if (mainNav && mainNav.classList.contains('active') && !mainNav.contains(e.target) && menuToggle && !menuToggle.contains(e.target)) {
            mainNav.classList.remove('active');
            if (menuToggle.querySelector('i')) {
                menuToggle.querySelector('i').classList.add('fa-bars');
                menuToggle.querySelector('i').classList.remove('fa-times');
            }
        }
    });

    // 2. 히어로 슬라이더 (페이드 전환)
    let currentSlide = 0;
    const slideInterval = 5000; // 5초

    function nextSlide() {
        if (slides.length === 0) return;
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    if (slides.length > 0) {
        setInterval(nextSlide, slideInterval);
    }

    // 3. 스크롤 반응형 애니메이션
    function revealOnScroll() {
        revealElements.forEach(el => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            const elementVisible = 150; // 오프셋

            if (elementTop < windowHeight - elementVisible) {
                el.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // 초기 실행

    // 4. 스크롤 시 부드럽게 따라다니는 퀵 메뉴
    const quickBar = document.querySelector('.floating-quick-bar');
    if (quickBar) {
        const updateQuickBarPosition = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            let targetTop = scrollTop + (window.innerHeight / 2);

            // 배너 영역(320px) 및 헤더 가림을 차단하기 위한 하단 마진 포함 한계값 계산
            const barHeight = quickBar.offsetHeight || 260;
            const minTop = 340 + (barHeight / 2);

            if (targetTop < minTop) {
                targetTop = minTop;
            }
            quickBar.style.top = `${targetTop}px`;
        };
        
        window.addEventListener('scroll', updateQuickBarPosition, { passive: true });
        window.addEventListener('resize', updateQuickBarPosition, { passive: true });
        updateQuickBarPosition();
        setTimeout(updateQuickBarPosition, 100);
    }
}
