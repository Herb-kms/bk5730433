/**
 * @file js/modules/products.js
 * @description 복사기 임대/판매 라인업 동적 데이터 로딩, 실시간 정렬 및 브랜드 필터링, 제품 상세정보 팝업 모달 관리 모듈
 */

export async function loadAndRenderProducts(type) {
    const cardGrid = document.getElementById('cardGrid');
    if (!cardGrid) return;

    // URL 파라미터에서 카테고리 추출하여 동적 설정 및 브랜드 필터 초기화
    const urlParams = new URLSearchParams(window.location.search);
    currentCategory = urlParams.get('category') || urlParams.get('cat') || 'all';
    activeBrands = new Set(['all']);

    cardGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.7);">
            <i class="fas fa-spinner fa-spin" style="font-size: 2.5rem; margin-bottom: 15px; color: #3b82f6;"></i>
            <p style="font-size: 1.1rem; font-weight: 600;">제품 라인업을 불러오는 중입니다...</p>
        </div>
    `;


    try {
        const response = await fetch(`/api/products?type=${type}`);
        if (!response.ok) throw new Error('API 로드 오류');
        const products = await response.json();

        if (products.length === 0) {
            cardGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.7);">
                    <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p style="font-size: 1.1rem; font-weight: 600;">등록된 제품이 존재하지 않습니다.</p>
                </div>
            `;
            return;
        }

        cardGrid.innerHTML = products.map(p => {
            const priceText = p.price.toLocaleString() + (type === 'rental' ? ' 원 / 월' : ' 원');
            const detailBtnText = '상세보기';
            
            let brandLogoHtml = '';
            if (p.brand === 'canon') {
                brandLogoHtml = `<img src="img/logo_canon.svg" alt="Canon" class="brand-logo-img brand-canon">`;
            } else if (p.brand === 'minolta') {
                brandLogoHtml = `<img src="img/logo_minolta.svg" alt="Minolta" class="brand-logo-img brand-minolta">`;
            } else if (p.brand === 'samsung') {
                brandLogoHtml = `<img src="img/logo_samsung.svg" alt="Samsung" class="brand-logo-img brand-samsung">`;
            } else {
                brandLogoHtml = `<span class="brand-text-logo" style="text-transform:uppercase;">${p.brand}</span>`;
            }

            return `
                <a href="product-detail.html?id=${p.id}" class="prod-card" data-id="${p.id}" data-category="${p.category}" data-brand="${p.brand}" data-price="${p.price}" data-date="${p.date || '20260101'}">
                    <div class="card-img-wrap">
                        <img src="${p.image_url || '/img/color-copier.png'}" alt="${p.name}" style="transform: scale(${(p.image_zoom_card !== undefined && p.image_zoom_card !== null) ? p.image_zoom_card / 100 : 1.3}); padding: ${(p.image_padding_card !== undefined && p.image_padding_card !== null) ? p.image_padding_card : 10}px; object-fit: contain;">
                    </div>
                    <div class="card-body">
                        <div class="card-brand-logo-area">
                            ${brandLogoHtml}
                        </div>
                        <div class="card-name">${p.name}</div>
                        <div class="card-price-row">
                            <div class="origin-price">
                                <i class="fas fa-shopping-cart"></i>
                                <span>${priceText}</span>
                            </div>
                            <div class="hover-text">
                                ${detailBtnText} <span class="highlight-click">클릭</span> <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </div>
                </a>
            `;
        }).join('');

        // 카드 로드 후 깨진 이미지에 대해서만 기본 복합기 이미지로 백업 처리 적용 (정상 이미지 가림 현상 해결)
        const cardImages = cardGrid.querySelectorAll('.card-img-wrap img');
        cardImages.forEach(img => {
            img.onerror = function() {
                this.src = '/img/standing_color_copier.PNG';
            };
        });

        // 렌더링 완료 후 이벤트 리스너(정렬, 필터, 상세 모달 등)를 즉시 다시 할당
        initProductPageEvents();

    } catch (err) {
        console.error('제품 로드 중 에러 발생:', err);
        console.error('에러 스택:', err.stack);
        cardGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #ef4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <p style="font-size: 1.1rem; font-weight: 600;">제품 목록을 불러오는 중 오류가 발생했습니다.</p>
                <p style="font-size: 0.85rem; color: #94a3b8; margin-top: 10px;">${err.message}</p>
            </div>
        `;
    }
}

// 필터 및 페이지네이션 상태 값을 모듈 파일 스코프 전역으로 유지하여 중복 바인딩 및 꼬임 차단
let currentCategory = 'all';
let activeBrands = new Set(['all']);
let productCurrentPage = 1;
const productItemsPerPage = 12; // 4열 3행 배치를 위해 한 페이지당 12개로 설정 (세로 1000px 규격에 최적화)

export function initProductPageEvents() {
    const cardGrid = document.getElementById('cardGrid');
    if (!cardGrid) return;

    const productPage = document.querySelector('.product-page');
    if (!productPage) return;

    const cardsArray = Array.from(cardGrid.querySelectorAll('.prod-card'));
    const categoryTabs = document.querySelectorAll('.category-tabs a');
    const brandChecks = document.querySelectorAll('.brand-check');
    const sortSelect = document.getElementById('sort-select');
    const paginationContainer = document.getElementById('productPagination');

    // 카테고리 탭 UI 상태 동기화 (URL 파라미터 또는 이전 페이지 상태 반영)
    categoryTabs.forEach(tab => {
        if (tab.getAttribute('data-cat') === currentCategory) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // 브랜드 체크박스 UI 상태 동기화
    brandChecks.forEach(check => {
        check.checked = activeBrands.has(check.value);
    });

    // 초도 카테고리에 맞춰 브랜드 필터 노출 상태 설정
    updateBrandFilterVisibility(currentCategory);

    // 1. 이벤트 1회 마운트 (동적 페이지 이동 대응을 위해 .product-page 컨테이너에 바인딩 플래그 부여)
    if (!productPage.dataset.eventsBound) {
        // 1) 카테고리 탭 전환 필터 (클릭 시 브랜드 필터 '전체'로 해제 및 초기화 포함)
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                categoryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                currentCategory = tab.getAttribute('data-cat');

                // 제조사 선택 상태를 '전체'로 강제 해제 및 UI 리셋
                activeBrands = new Set(['all']);
                brandChecks.forEach(c => {
                    c.checked = (c.value === 'all');
                });

                // 카테고리 전환 시 브랜드 필터 노출 상태 동적 업데이트
                updateBrandFilterVisibility(currentCategory);

                productCurrentPage = 1; // 필터 교체 시 첫 페이지로 리셋
                applyFilterAndSort();
            });
        });

        // 2) 브랜드 단일 선택 필터 (중복체크 차단 완료)
        brandChecks.forEach(check => {
            check.addEventListener('change', () => {
                const val = check.value;
                
                if (check.checked) {
                    brandChecks.forEach(c => {
                        if (c !== check) c.checked = false;
                    });
                    activeBrands = new Set([val]);
                } else {
                    brandChecks.forEach(c => {
                        c.checked = (c.value === 'all');
                    });
                    activeBrands = new Set(['all']);
                }
                productCurrentPage = 1; // 필터 교체 시 첫 페이지로 리셋
                applyFilterAndSort();
            });
        });

        // 3) 실시간 가격/최신 정렬 필터
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                productCurrentPage = 1; // 정렬 변경 시 첫 페이지로 리셋
                applyFilterAndSort();
            });
        }

        productPage.dataset.eventsBound = "true";
    }


    // 2. 리스트 필터 및 정렬 실행 엔진
    function applyFilterAndSort() {
        let filtered = cardsArray.filter(card => {
            // 카테고리
            const cat = card.getAttribute('data-category');
            const catMatch = (currentCategory === 'all' || cat === currentCategory);

            // 브랜드
            const brand = card.getAttribute('data-brand');
            const brandMatch = (activeBrands.has('all') || activeBrands.has(brand));

            return catMatch && brandMatch;
        });

        // 실시간 조회 가능한 기기 수량(X개) 동적 갱신
        const countSpan = document.getElementById('productsCount');
        if (countSpan) {
            countSpan.textContent = filtered.length;
        }

        // 정렬 규칙 적용
        const sortBy = sortSelect ? sortSelect.value : 'recent';
        filtered.sort((a, b) => {
            if (sortBy === 'price-low') {
                return parseInt(a.getAttribute('data-price')) - parseInt(b.getAttribute('data-price'));
            } else if (sortBy === 'price-high') {
                return parseInt(b.getAttribute('data-price')) - parseInt(a.getAttribute('data-price'));
            } else {
                // 기본 정렬: 캐논 -> 신도리코 -> 미놀타 -> 삼성 -> HP 순서로 우선 그룹 정렬 후, 동일 브랜드 내에서는 ID 순서 유지
                const brandA = a.getAttribute('data-brand') || 'etc';
                const brandB = b.getAttribute('data-brand') || 'etc';
                
                const priority = { canon: 1, sindoh: 2, minolta: 3, samsung: 4, hp: 5, etc: 6 };
                const weightA = priority[brandA] || 6;
                const weightB = priority[brandB] || 6;
                
                if (weightA !== weightB) {
                    return weightA - weightB;
                }
                
                return parseInt(a.getAttribute('data-id')) - parseInt(b.getAttribute('data-id'));
            }
        });

        // 렌더링 영역 재배치 (페이지네이션 슬라이스 적용)
        cardGrid.innerHTML = '';
        if (filtered.length === 0) {
            cardGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">
                    조건에 맞는 복합기 제품이 없습니다.
                </div>
            `;
            renderProductPagination(0);
        } else {
            const startIdx = (productCurrentPage - 1) * productItemsPerPage;
            const endIdx = startIdx + productItemsPerPage;
            const pageCards = filtered.slice(startIdx, endIdx);

            pageCards.forEach(card => cardGrid.appendChild(card));
            renderProductPagination(filtered.length);
        }
    }

    // 제품 페이지네이션 버튼 렌더러
    function renderProductPagination(totalItems) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(totalItems / productItemsPerPage);
        if (totalPages <= 1) return; // 1페이지 이하면 노출 차단

        // 이전 페이지 버튼
        const prevBtn = document.createElement('button');
        prevBtn.className = `page-btn prev-btn ${productCurrentPage === 1 ? 'disabled' : ''}`;
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = productCurrentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (productCurrentPage > 1) {
                productCurrentPage--;
                applyFilterAndSort();
                window.scrollTo({ top: 350, behavior: 'smooth' });
            }
        });
        paginationContainer.appendChild(prevBtn);

        // 페이지 번호
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${productCurrentPage === i ? 'active' : ''}`;
            pageBtn.innerText = i;
            pageBtn.addEventListener('click', () => {
                if (productCurrentPage !== i) {
                    productCurrentPage = i;
                    applyFilterAndSort();
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                }
            });
            paginationContainer.appendChild(pageBtn);
        }

        // 다음 페이지 버튼
        const nextBtn = document.createElement('button');
        nextBtn.className = `page-btn next-btn ${productCurrentPage === totalPages ? 'disabled' : ''}`;
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = productCurrentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (productCurrentPage < totalPages) {
                productCurrentPage++;
                applyFilterAndSort();
                window.scrollTo({ top: 350, behavior: 'smooth' });
            }
        });
        paginationContainer.appendChild(nextBtn);
    }

    // 카드 목록이 그려진 직후 필터 엔진 수평 실행
    applyFilterAndSort();
}



// 카테고리에 따른 제조사 필터링 (잉크젯: hp만, 레이저: canon, samsung, hp만 노출)
function updateBrandFilterVisibility(category) {
    const brandChecks = document.querySelectorAll('.brand-check');
    brandChecks.forEach(check => {
        const label = check.closest('.filter-checkbox-label');
        if (!label) return;

        const val = check.value;
        if (category === 'inkjet') {
            if (val === 'all' || val === 'hp') {
                label.style.display = '';
            } else {
                label.style.display = 'none';
            }
        } else if (category === 'laser') {
            if (val === 'all' || val === 'canon' || val === 'samsung' || val === 'hp') {
                label.style.display = '';
            } else {
                label.style.display = 'none';
            }
        } else {
            label.style.display = '';
        }
    });
}
