/**
 * @file js/modules/megamenu.js
 * @description GNB "임대제품" 및 "판매제품" 메뉴 오버 시 화면에 나타나는 삼성 스타일 풀 와이드 메가메뉴 렌더링 및 모션 결합 모듈
 */

export function initMegaMenu() {
    const header = document.querySelector('.hero-nav-bar-fluid');
    const nav = document.querySelector('.hero-nav');
    if (!header || !nav) return;

    // 1. 메가메뉴 DOM 삽입 (한 번만)
    if (!document.getElementById('samsungMegaMenu')) {
        const megaMenu = document.createElement('div');
        megaMenu.id = 'samsungMegaMenu';
        megaMenu.className = 'samsung-mega-menu';
        megaMenu.innerHTML = `
            <div class="megamenu-container">
                <div class="megamenu-left">
                    <div class="product-grid">
                        <a href="rental.html?cat=color" class="product-item">
                            <div class="product-icon-wrap color-icon"><i class="fas fa-palette"></i></div>
                            <div class="product-meta">
                                <span class="prod-tag color-tag">컬러 복합기</span>
                                <span class="product-name">컬러 레이저 복합기</span>
                                <span class="product-desc">고해상도 디자인 솔루션</span>
                            </div>
                        </a>
                        <a href="rental.html?cat=mono" class="product-item">
                            <div class="product-icon-wrap mono-icon"><i class="fas fa-print"></i></div>
                            <div class="product-meta">
                                <span class="prod-tag mono-tag">흑백 복합기</span>
                                <span class="product-name">흑백 고속 복합기</span>
                                <span class="product-desc">오피스 대량 출력 최적</span>
                            </div>
                        </a>
                        <a href="rental.html?cat=inkjet" class="product-item">
                            <div class="product-icon-wrap inkjet-icon"><i class="fas fa-tint"></i></div>
                            <div class="product-meta">
                                <span class="prod-tag unlimited-tag">무한 잉크젯</span>
                                <span class="product-name">무한 잉크젯 복합기</span>
                                <span class="product-desc">학원/공부방 경제적 렌탈</span>
                            </div>
                        </a>
                    </div>
                </div>
                <div class="megamenu-divider"></div>
                <div class="megamenu-right">
                    <div class="megamenu-section-title">자주 찾는 서비스 / 문의</div>
                    <ul class="megamenu-links">
                        <li>
                            <a href="tel:010-6593-0477">
                                <div class="link-text-wrap">
                                    <span class="link-label">실시간 유선 상담</span>
                                    <span class="link-desc">010-6593-0477 | 신속 견적 안내</span>
                                </div>
                                <i class="fas fa-chevron-right"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        `;
        header.appendChild(megaMenu);
    }

    const megaMenu = document.getElementById('samsungMegaMenu');
    const targetLinks = Array.from(nav.querySelectorAll('a')).filter(link => {
        const txt = link.textContent.trim();
        return txt === '임대제품' || txt === '판매제품' || txt === '임대 제품' || txt === '판매 제품';
    });

    let activeTimeout = null;

    function showMegaMenu(e) {
        if (activeTimeout) clearTimeout(activeTimeout);

        // 마우스 호버한 GNB 항목에 맞춰 메가메뉴 링크(임대 vs 판매) 동적 갱신
        if (e && e.currentTarget) {
            const txt = e.currentTarget.textContent.trim();
            const targetPage = (txt === '판매제품' || txt === '판매 제품') ? 'sales.html' : 'rental.html';

            // 모든 GNB 링크에서 임시 활성화 클래스 제거 후, 현재 호버 대상에만 활성화 부여
            targetLinks.forEach(link => link.classList.remove('megamenu-parent-active'));
            e.currentTarget.classList.add('megamenu-parent-active');

            const colorLink = megaMenu.querySelector('a[href*="cat=color"]');
            const monoLink = megaMenu.querySelector('a[href*="cat=mono"]');
            const inkjetLink = megaMenu.querySelector('a[href*="cat=inkjet"]');

            if (colorLink) colorLink.setAttribute('href', `${targetPage}?cat=color`);
            if (monoLink) monoLink.setAttribute('href', `${targetPage}?cat=mono`);
            if (inkjetLink) inkjetLink.setAttribute('href', `${targetPage}?cat=inkjet`);
        }

        megaMenu.classList.add('show');
        header.classList.add('mega-active');
    }

    function hideMegaMenu() {
        activeTimeout = setTimeout(() => {
            megaMenu.classList.remove('show');
            header.classList.remove('mega-active');
            targetLinks.forEach(link => link.classList.remove('megamenu-parent-active'));
        }, 100); // 미세한 지연으로 부드러운 전환 효과
    }

    targetLinks.forEach(link => {
        link.addEventListener('mouseenter', showMegaMenu);
        link.addEventListener('mouseleave', hideMegaMenu);
    });

    // 메가메뉴 영역 안에서 마우스가 떠날 때도 숨김 처리 (안전장치)
    megaMenu.addEventListener('mouseenter', () => {
        if (activeTimeout) clearTimeout(activeTimeout);
    });
    megaMenu.addEventListener('mouseleave', hideMegaMenu);
}