/**
 * @file js/modules/product-detail.js
 * @description 단일 제품 상세정보 로드, 실시간 렌탈 견적 계산기 시뮬레이션, 이미지 썸네일 갤러리 및 간편 상담 신청 처리 모듈
 */

export async function initProductDetailPage() {
    const detailTitle = document.getElementById('detailTitle');
    if (!detailTitle) return;

    // 1. URL 파라미터에서 제품 ID 추출
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        showErrorPage('제품 ID가 올바르지 않습니다.');
        return;
    }

    try {
        // 2. 단일 제품 정보 API 호출
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
            if (response.status === 404) {
                showErrorPage('요청하신 제품을 찾을 수 없습니다.');
            } else {
                throw new Error('API 서버 조회 오류');
            }
            return;
        }

        const product = await response.json();
        renderProductDetails(product);

    } catch (err) {
        console.error('제품 상세 조회 실패:', err);
        showErrorPage('제품 정보를 불러오는 중 에러가 발생했습니다.');
    }
}

function renderProductDetails(p) {
    const originalImgSrc = p.image_url_1 || p.image_url || '/img/color-copier.png';

    // 1. 기본 UI 텍스트 및 속성 매핑
    document.title = `${p.name} | 복사기마트`;
    document.getElementById('detailTitle').textContent = p.name;
    const detailDesc = document.getElementById('detailDesc');
    if (detailDesc) detailDesc.innerHTML = p.description || '사무 효율성을 한 단계 더 끌어올리는 복사기마트 추천 기종입니다.';
    
    const subHeroTitle = document.getElementById('subHeroTitle');
    const subHeroDesc = document.getElementById('subHeroDesc');
    if (subHeroTitle) subHeroTitle.textContent = p.type === 'rental' ? '임대 제품 상세' : '판매 제품 상세';
    if (subHeroDesc) subHeroDesc.textContent = `${p.name} - 최고급 사양 및 실시간 견적 안내`;

    const mainImgNode = document.getElementById('detailMainImg') || document.getElementById('detailImg');
    if (mainImgNode) {
        mainImgNode.src = originalImgSrc;
        mainImgNode.style.transform = `scale(${(p.image_zoom_1 !== undefined && p.image_zoom_1 !== null) ? p.image_zoom_1 / 100 : 1.3})`;
        mainImgNode.style.padding = `${(p.image_padding_1 !== undefined && p.image_padding_1 !== null) ? p.image_padding_1 : 10}px`;
        mainImgNode.style.objectFit = 'contain';
        mainImgNode.onerror = function() {
            this.src = '/img/standing_color_copier.PNG';
        };
    }

    // 브레드크럼 동기화
    const breadcrumbType = document.getElementById('breadcrumbType');
    const breadcrumbName = document.getElementById('breadcrumbName');
    
    if (p.type === 'rental') {
        breadcrumbType.textContent = '임대제품';
        breadcrumbType.href = 'rental.html';
    } else {
        breadcrumbType.textContent = '판매제품';
        breadcrumbType.href = 'sales.html';
    }
    breadcrumbName.textContent = p.name;

    // 외부 상담 링크 연동
    const naverLink = document.getElementById('detailNaverLink');
    const kakaoLink = document.getElementById('detailKakaoLink');
    if (naverLink) naverLink.href = p.naver_talk || 'http://talk.naver.com/WCHMKR';
    if (kakaoLink) kakaoLink.href = p.kakao_talk || 'https://open.kakao.com/o/sSzFO2O';

    // 2. 실시간 견적서 계산기 초기 세팅
    setupQuotationSimulator(p);

    // 3. 기기 상세 사양 정보 테이블 및 핵심 특장점 배너 바인딩
    setupSpecifications(p);

    // 4. 좌측 이미지 썸네일 갤러리 연동
    setupThumbnailGallery(p);

    // 5. 상담 신청 폼 서브밋 핸들러 연동
    setupInquiryForm(p);

    // 6. 하단 개편된 탭 인터페이스 및 라이트박스 연동
    bindTabsAndImages(p);

    // 7. 관리자 세션 체크 및 수정 기능 바인딩
    checkAdminAccess(p);
}

// 실시간 견적 계산기 엔진
function setupQuotationSimulator(p) {
    const rentalOptionsArea = document.getElementById('rentalOptionsArea');
    if (!rentalOptionsArea) return; // Exit early if simulator is not in the DOM
 
    const salesOptionsArea = document.getElementById('salesOptionsArea');
    const simTypeLabel = document.getElementById('simTypeLabel');
    const priceLabelText = document.getElementById('priceLabelText');
    const priceUnitText = document.getElementById('priceUnitText');
    const calculatedPrice = document.getElementById('calculatedPrice');

    const basePrice = p.price;

    if (p.type === 'rental') {
        rentalOptionsArea.style.display = 'block';
        salesOptionsArea.style.display = 'none';
        simTypeLabel.textContent = '임대 상품';
        priceLabelText.textContent = '예상 월 렌탈료';
        priceUnitText.textContent = '원 / 월';

        const contractSelect = document.getElementById('contractTerm');
        const planSelect = document.getElementById('printPlan');

        const calculateRental = () => {
            const term = parseInt(contractSelect.value, 10);
            const plan = planSelect.value;

            // 약정기간에 따른 할인/인상 계산 (기준: 36개월)
            let termDiff = 0;
            if (term === 24) termDiff = 10000;
            else if (term === 48) termDiff = -5000;

            // 출력 요금제 요금 추가
            let planDiff = 0;
            if (plan === 'standard') planDiff = 15000;
            else if (plan === 'premium') planDiff = 30000;

            const finalPrice = Math.max(10000, basePrice + termDiff + planDiff);
            calculatedPrice.textContent = finalPrice.toLocaleString();

            // 간편 상담창 템플릿 문의내용 실시간 갱신
            const termText = contractSelect.options[contractSelect.selectedIndex].text;
            const planText = planSelect.options[planSelect.selectedIndex].text;
            
            document.getElementById('inquiryContent').value = 
                `안녕하세요. [${p.name}] 복사기 임대 조건 문의 드립니다.\n` +
                `- 선택 약정: ${termText}\n` +
                `- 선택 요금제: ${planText}\n` +
                `- 예상 렌탈료: 월 ${finalPrice.toLocaleString()} 원\n` +
                `위 조건으로 상담을 요청합니다.`;
        };

        contractSelect.addEventListener('change', calculateRental);
        planSelect.addEventListener('change', calculateRental);
        calculateRental(); // 최초 기동

    } else {
        // 일시불 판매 상품인 경우
        rentalOptionsArea.style.display = 'none';
        salesOptionsArea.style.display = 'block';
        simTypeLabel.textContent = '판매 상품';
        simTypeLabel.style.background = '#10b981'; // 초록색 구매 배지
        priceLabelText.textContent = '최종 구매 가격';
        priceUnitText.textContent = '원(부가세 포함)';
        
        document.getElementById('salesPriceVal').textContent = `${basePrice.toLocaleString()} 원`;
        calculatedPrice.textContent = basePrice.toLocaleString();

        document.getElementById('inquiryContent').value = 
            `안녕하세요. [${p.name}] 제품 일시불 구매 견적 상담 신청합니다.\n` +
            `- 정가 금액: ${basePrice.toLocaleString()} 원\n` +
            `세부 견적서 및 경기 남양주 지역 무료 배송/정밀 설치 일정을 확인하고 싶습니다.`;
    }
}

// 스펙 상세 테이블 및 핵심 특장점 배너 빌더
function setupSpecifications(p) {
    let speed = '25ppm';
    let resolution = '1200 x 1200 dpi';
    let features = '프린트, 복사, 컬러 스캔 기본 지원';

    if (p.specs) {
        let parsedJson = null;
        if (typeof p.specs === 'string' && p.specs.trim().startsWith('{')) {
            try { parsedJson = JSON.parse(p.specs); } catch(e) {}
        }
        
        if (parsedJson) {
            speed = parsedJson.speed || speed;
            resolution = parsedJson.resolution || resolution;
            features = parsedJson.feature || parsedJson.features || features;
        } else if (typeof p.specs === 'string') {
            const specList = p.specs.split(',').map(s => s.trim()).filter(Boolean);
            specList.forEach(item => {
                if (/ppm|매/i.test(item)) speed = item;
                else if (/dpi|x|해상도/i.test(item)) resolution = item;
                else features = features ? `${features}, ${item}` : item;
            });
            if (specList.length > 0 && speed === '25ppm' && !/ppm/i.test(specList[0])) {
                speed = specList[0];
            }
        }
    }

    // 스펙 테이블 바인딩
    const speedEl = document.getElementById('detailSpecSpeed');
    const resEl = document.getElementById('detailSpecResolution');
    const featEl = document.getElementById('detailSpecFeature');

    if (speedEl) speedEl.textContent = speed;
    if (resEl) resEl.textContent = resolution;
    if (featEl) featEl.textContent = features;

    // 핵심 기능 3단 설명 카드는 HTML에 공통 고정되어 유지됩니다.
}

// 이미지 썸네일 갤러리 컨트롤러
function setupThumbnailGallery(p) {
    const thumbs = document.querySelectorAll('.thumbnail-selector .thumb-btn');
    const mainImg = document.getElementById('detailMainImg');
    if (!mainImg) return;

    // 사르륵 애니메이션을 위한 트랜지션 스타일 부여 (0.2초 페이드 효과)
    mainImg.style.transition = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out, padding 0.2s ease-in-out';

    // 각 data-type별 이미지 매핑 정보 정의 (DB 컬럼과 직결)
    const imageMap = {
        'front': p.image_url_1 || p.image_url,
        'side': p.image_url_2,
        'detail': p.image_url_3
    };

    // [고도화] 각 data-type별 줌 및 패딩 수치 맵 정보 정의
    const zoomMap = {
        'front': p.image_zoom_1 !== undefined ? p.image_zoom_1 : 130,
        'side': p.image_zoom_2 !== undefined ? p.image_zoom_2 : 130,
        'detail': p.image_zoom_3 !== undefined ? p.image_zoom_3 : 130
    };
    const paddingMap = {
        'front': p.image_padding_1 !== undefined ? p.image_padding_1 : 10,
        'side': p.image_padding_2 !== undefined ? p.image_padding_2 : 10,
        'detail': p.image_padding_3 !== undefined ? p.image_padding_3 : 10
    };

    // 각 썸네일(측면, 상세)에 대해 실제 이미지 리소스가 서버상에 존재하는지 비동기 검사
    thumbs.forEach(btn => {
        const type = btn.getAttribute('data-type');
        const imgSrc = imageMap[type];

        if (type === 'front') {
            // 정면(1번) 이미지는 항상 노출
            btn.style.display = 'inline-block';
            return;
        }

        // 경로 값이 아예 없으면 즉시 숨김
        if (!imgSrc) {
            btn.style.display = 'none';
            return;
        }

        // Image 비동기 로더 객체 활용한 존재 유무 검증
        const tempImg = new Image();
        tempImg.onload = function() {
            // 존재할 시 노출 보장
            btn.style.display = 'inline-block';
        };
        tempImg.onerror = function() {
            // 부재 시 깔끔하게 미노출
            btn.style.display = 'none';
        };
        tempImg.src = imgSrc;
    });

    // 메인 이미지 전환 처리 함수 (사르륵 트랜지션)
    const transitionImage = (btn) => {
        if (btn.classList.contains('active')) return;

        thumbs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');

        const type = btn.getAttribute('data-type');
        const newSrc = imageMap[type] || p.image_url;

        // 사르륵 효과: 페이드아웃 -> 소스 변경 -> 페이드인
        mainImg.style.opacity = '0';
        setTimeout(() => {
            mainImg.src = newSrc;

            // [고도화] 호버된 단추 타입에 맞추어 실시간 줌 및 여백 개별 적용
            const zoomVal = zoomMap[type] !== undefined ? zoomMap[type] : 130;
            const paddingVal = paddingMap[type] !== undefined ? paddingMap[type] : 10;
            mainImg.style.transform = `scale(${zoomVal / 100})`;
            mainImg.style.padding = `${paddingVal}px`;

            mainImg.style.opacity = '1';

            mainImg.onerror = function() {
                this.src = p.image_url;
                this.onerror = null;
            };
        }, 200);
    };

    thumbs.forEach(btn => {
        // 1. 마우스 진입(호버) 시 사르륵 스위칭
        btn.addEventListener('mouseenter', () => {
            transitionImage(btn);
        });

        // 2. 터치 기기나 호환성을 위해 클릭 시에도 작동 보장
        btn.addEventListener('click', () => {
            transitionImage(btn);
        });
    });
}

// 견적 / 상담 신청 폼
function setupInquiryForm(p) {
    const form = document.getElementById('detailInquiryForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameVal = document.getElementById('inquiryName').value.trim();
        const phoneVal = document.getElementById('inquiryPhone').value.trim();
        const contentVal = document.getElementById('inquiryContent').value.trim();

        if (!nameVal || !phoneVal || !contentVal) {
            alert('상담 신청을 위해 모든 정보를 입력해 주세요.');
            return;
        }

        try {
            const res = await fetch('/api/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: nameVal,
                    phone: phoneVal,
                    brand: `${p.brand.toUpperCase()} - ${p.name}`,
                    content: contentVal
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert('상담 접수가 완료되었습니다! 담당자 확인 후 신속하게 상담 전화를 드리겠습니다.');
                form.reset();
                
                // 구매/임대 타입별 초기 템플릿 복구
                if (p.type === 'rental') {
                    const contractSelect = document.getElementById('contractTerm');
                    const planSelect = document.getElementById('printPlan');
                    contractSelect.value = "36";
                    planSelect.value = "eco";
                    contractSelect.dispatchEvent(new Event('change'));
                } else {
                    document.getElementById('inquiryContent').value = 
                        `안녕하세요. [${p.name}] 제품 일시불 구매 견적 상담 신청합니다.\n` +
                        `- 정가 금액: ${p.price.toLocaleString()} 원\n` +
                        `세부 견적서 및 경기 남양주 지역 무료 배송/정밀 설치 일정을 확인하고 싶습니다.`;
                }
            } else {
                alert(data.error || '상담 신청 중 오류가 발생했습니다.');
            }
        } catch (err) {
            console.error('상담 신청 에러:', err);
            alert('서버 전송 중 에러가 발생했습니다.');
        }
    });
}

const initPreviewTabs = (modalEl) => {
    const btns = modalEl.querySelectorAll('.preview-tab-btn');
    const panes = modalEl.querySelectorAll('.preview-pane');
    btns.forEach(btn => {
        btn.onclick = () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            panes.forEach(pane => {
                if (pane.id === target) {
                    pane.style.display = 'block';
                } else {
                    pane.style.display = 'none';
                }
            });
        };
    });
    
    // 탭 초기화 (첫 번째 탭 자동클릭)
    const firstTab = modalEl.querySelector('.preview-tab-btn');
    if (firstTab) firstTab.click();
};

// 수정 모달 제어 및 서브밋 연동
function openAdminEditModal(p) {
    const modal = document.getElementById('editProductModal');
    const form = document.getElementById('editProductForm');
    if (!modal || !form) return;

    // 1. 탭 전환 바인딩
    initPreviewTabs(modal);

    // 2. 모달 필드 채우기 (요소가 존재하는 경우에만 안전하게 대입)
    const setVal = (name, val) => {
        const el = form.querySelector(`[name="${name}"]`);
        if (el) el.value = val;
    };
    setVal('id', p.id);
    setVal('type', p.type);
    setVal('category', p.category);
    setVal('brand', p.brand);
    setVal('name', p.name);
    setVal('price', p.price);
    setVal('badge', p.badge || '');
    setVal('description', p.description || '');
    setVal('specs', p.specs || '');
    setVal('naver_talk', p.naver_talk || '');
    setVal('kakao_talk', p.kakao_talk || '');
    setVal('image_zoom_card', p.image_zoom_card !== undefined ? p.image_zoom_card : 130);
    setVal('image_padding_card', p.image_padding_card !== undefined ? p.image_padding_card : 10);
    setVal('image_zoom_1', p.image_zoom_1 !== undefined ? p.image_zoom_1 : 130);
    setVal('image_padding_1', p.image_padding_1 !== undefined ? p.image_padding_1 : 10);
    setVal('image_zoom_2', p.image_zoom_2 !== undefined ? p.image_zoom_2 : 130);
    setVal('image_padding_2', p.image_padding_2 !== undefined ? p.image_padding_2 : 10);
    setVal('image_zoom_3', p.image_zoom_3 !== undefined ? p.image_zoom_3 : 130);
    setVal('image_padding_3', p.image_padding_3 !== undefined ? p.image_padding_3 : 10);

    // 3. 실시간 프리뷰 초기화 및 동기화
    const updatePreview = () => {
        const nameVal = form.querySelector('[name="name"]').value || '제품명';
        const priceVal = parseInt(form.querySelector('[name="price"]').value, 10) || 0;
        const typeVal = form.querySelector('[name="type"]').value;
        const brandVal = form.querySelector('[name="brand"]').value;
        const badgeVal = form.querySelector('[name="badge"]').value || `${brandVal.toUpperCase()} 복합기`;
        const descVal = form.querySelector('[name="description"]').value || '기기 상세 설명';
        const specsVal = form.querySelector('[name="specs"]').value || '25ppm,1200dpi,지원 기능';

        const specList = specsVal.split(',');
        const speed = specList[0] || '-';
        const resolution = specList[1] || '-';
        const features = specList[2] || '-';

        // 1) 카드 프리뷰 업데이트
        const previewName = document.getElementById('editPreviewName');
        const previewPrice = document.getElementById('editPreviewPrice');
        const previewLogo = document.getElementById('editPreviewLogo');

        if (previewName) previewName.innerText = nameVal;
        const formattedPrice = priceVal.toLocaleString() + (typeVal === 'rental' ? ' 원 / 월' : ' 원');
        if (previewPrice) previewPrice.innerText = formattedPrice;

        if (previewLogo) {
            let logoHtml = '';
            if (brandVal === 'canon') {
                logoHtml = `<img src="img/logo_canon.svg" alt="Canon" class="brand-logo-img brand-canon">`;
            } else if (brandVal === 'minolta') {
                logoHtml = `<img src="img/logo_minolta.svg" alt="Minolta" class="brand-logo-img brand-minolta">`;
            } else if (brandVal === 'samsung') {
                logoHtml = `<img src="img/logo_samsung.svg" alt="Samsung" class="brand-logo-img brand-samsung">`;
            } else if (brandVal === 'sindoh') {
                logoHtml = `<img src="img/logo_sindoh.svg" alt="Sindoh" class="brand-logo-img brand-sindoh">`;
            } else if (brandVal === 'hp') {
                logoHtml = `<img src="img/logo_hp.svg" alt="HP" class="brand-logo-img brand-hp">`;
            } else {
                logoHtml = `<span class="brand-text-logo" style="text-transform:uppercase;">${brandVal}</span>`;
            }
            previewLogo.innerHTML = logoHtml;
        }

        // 2) 상세페이지 미니 프리뷰 업데이트
        const mBreadcrumbType = document.getElementById('editMiniBreadcrumbType');
        const mBreadcrumbName = document.getElementById('editMiniBreadcrumbName');
        const mBadge = document.getElementById('editMiniBadge');
        const mName = document.getElementById('editMiniName');
        const mDesc = document.getElementById('editMiniDesc');
        const mSimType = document.getElementById('editMiniSimType');
        const mPriceLabel = document.getElementById('editMiniPriceLabel');
        const mPrice = document.getElementById('editMiniPrice');
        const mSpecSpeed = document.getElementById('editMiniSpecSpeed');
        const mSpecResolution = document.getElementById('editMiniSpecResolution');
        const mSpecFeature = document.getElementById('editMiniSpecFeature');

        if (mBreadcrumbType) mBreadcrumbType.innerText = typeVal === 'rental' ? '임대제품' : '판매제품';
        if (mBreadcrumbName) mBreadcrumbName.innerText = nameVal;
        if (mBadge) mBadge.innerText = badgeVal;
        if (mName) mName.innerText = nameVal;
        if (mDesc) mDesc.innerText = descVal;
        if (mSimType) mSimType.innerText = typeVal === 'rental' ? '임대 상품' : '판매 상품';
        if (mPriceLabel) mPriceLabel.innerText = typeVal === 'rental' ? '예상 월 렌탈료' : '최종 구매 가격';
        if (mPrice) mPrice.innerText = priceVal.toLocaleString() + ' 원' + (typeVal === 'rental' ? ' / 월' : '');
        if (mSpecSpeed) mSpecSpeed.innerText = speed;
        if (mSpecResolution) mSpecResolution.innerText = resolution;
        if (mSpecFeature) mSpecFeature.innerText = features;
    };

    form.addEventListener('input', updatePreview);
    form.addEventListener('change', updatePreview);
    updatePreview(); // 최초 1회 실행

    // 초기 이미지 세팅 및 프리뷰 프리필
    document.getElementById('editPreviewImg').src = p.image_url || '/img/standing_color_copier.PNG';
    const editMiniImg = document.getElementById('editMiniImg');
    if (editMiniImg) editMiniImg.src = p.image_url_1 || p.image_url || '/img/standing_color_copier.PNG';

    const initPreviewElement = (inputId, previewId, url, placeholder) => {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        if (input && preview) {
            input.value = '';
            if (url) {
                preview.innerHTML = `<img src="${url}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
            } else {
                preview.innerHTML = `<i class="fas fa-camera" style="font-size:1.2rem;margin-bottom:4px;"></i><span style="font-size:0.75rem;">${placeholder}</span>`;
            }
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        preview.innerHTML = `<img src="${event.target.result}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
                        if (inputId === 'editProductImageInput') {
                            document.getElementById('editPreviewImg').src = event.target.result;
                        }
                        if (inputId === 'editProductImageDetailInput') {
                            if (editMiniImg) editMiniImg.src = event.target.result;
                        }
                    };
                    reader.readAsDataURL(file);
                }
            };
        }
    };

    initPreviewElement('editProductImageInput', 'editProductImagePreview', p.image_url, '카드 이미지 등록');
    initPreviewElement('editProductImageDetailInput', 'editProductImageDetailPreview', p.image_url_1, '상세 정면 이미지 등록');
    initPreviewElement('editProductImageInput2', 'editProductImagePreview2', p.image_url_2, '상세 측면 이미지 등록');
    initPreviewElement('editProductImageInput3', 'editProductImagePreview3', p.image_url_3, '상세 추가 이미지 등록');
    initPreviewElement('editProductImageInputDetail', 'editProductImagePreviewDetail', p.detail_image_url, '제품 설명 등록');
    initPreviewElement('editProductImageInputCondition', 'editProductImagePreviewCondition', p.condition_image_url, '조건표 이미지 등록');

    // 모달 활성화
    modal.classList.add('active');

    // 모달 닫기 바인딩
    const closeBtn = document.getElementById('closeEditModalBtn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.classList.remove('active');
        };
    }
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    };

    // 폼 서브밋 핸들러
    form.onsubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        try {
            const res = await fetch(`/api/products/${p.id}`, {
                method: 'PUT',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                alert('제품 정보가 성공적으로 수정되었습니다.');
                modal.classList.remove('active');
                window.location.reload();
            } else {
                alert(data.error || '수정 중 오류가 발생했습니다.');
            }
        } catch (err) {
            console.error('제품 수정 에러:', err);
            alert('서버 전송 중 에러가 발생했습니다.');
        }
    };
}

async function checkAdminAccess(p) {
    try {
        const res = await fetch('/api/session');
        const data = await res.json();
        if (data.loggedIn && data.user.user_type === 'admin') {
            const editBtn = document.getElementById('adminEditProductBtn');
            if (editBtn) {
                editBtn.style.display = 'inline-block';
                editBtn.addEventListener('click', () => {
                    openAdminEditModal(p);
                });
            }
        }
    } catch (err) {
        console.error('관리자 세션 체크 실패:', err);
    }
}

function showErrorPage(message) {
    const detailTitle = document.getElementById('detailTitle');
    if (detailTitle) {
        detailTitle.textContent = '오류 발생';
    }
    const detailDesc = document.getElementById('detailDesc');
    if (detailDesc) {
        detailDesc.textContent = message;
    }
    const container = document.querySelector('.detail-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align:center; padding:100px 50px; font-family:sans-serif; background:#f8fafc; min-height:50vh; border-radius:12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                <h1 style="color:#ef4444; font-size:3rem; margin-bottom: 20px;">오류</h1>
                <p style="font-size:1.2rem; color:#64748b; margin-bottom: 30px;">${message}</p>
                <a href="/rental.html" style="display:inline-block; background:#3b82f6; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold; transition: background 0.2s;">목록으로 돌아가기</a>
            </div>
        `;
    }
}

function bindTabsAndImages(p) {
    // 1. 상세 소개 리치 텍스트 데이터 노출
    const richTextContainer = document.getElementById('detailDescRichText');
    if (richTextContainer) {
        richTextContainer.innerHTML = p.description || '<p style="color: #64748b; text-align: center; padding: 40px; font-weight: 600;">등록된 상세 소개글이 없습니다.</p>';
    }

    const modelName = (p.name || '').toLowerCase().trim();

    // 2. 대형 상세 설명 이미지 매핑 (제품설명이미지 폴더 자동 감지 + 폴백 지원)
    const descImgContainer = document.getElementById('detailDescImgContainer');
    const descImg = document.getElementById('detailDescImg');
    
    // 사용자가 '제품설명이미지/' 폴더에 추가할 수 있는 자동 파이프라인 후보 생성
    const detailCandidates = [
        p.detail_image_url,
        `제품설명이미지/${modelName}(제품설명).jpg`,
        `제품설명이미지/${modelName}(제품설명).png`,
        `제품설명이미지/${modelName}.jpg`,
        `제품설명이미지/${modelName}.png`,
        '제품설명이미지/c3322(제품설명).jpg'
    ].filter(Boolean);

    if (descImg && descImgContainer) {
        let candidateIndex = 0;
        const loadNextDetailImage = () => {
            if (candidateIndex < detailCandidates.length) {
                const srcUrl = detailCandidates[candidateIndex++];
                descImg.src = srcUrl.includes('?') ? srcUrl : `${srcUrl}?t=${Date.now()}`;
            } else {
                descImgContainer.style.display = 'none';
            }
        };

        descImg.onerror = function() {
            loadNextDetailImage();
        };

        descImgContainer.style.display = 'block';
        loadNextDetailImage();
    }

    // 3. 임대/구매 조건표 이미지 매핑 (제품설명이미지 폴더 내 제품별 조건표 자동 감지)
    const alwaysVisibleConditionCard = document.getElementById('alwaysVisibleConditionCard');
    const condImg = document.getElementById('detailCondImg');
    const conditionShortcutWrap = document.getElementById('conditionShortcutWrap');
    const condTitleEl = document.getElementById('conditionCardTitle');
    if (condTitleEl) condTitleEl.textContent = p.type === 'sales' ? '구매 조건표' : '임대 조건표';

    const modelLower = modelName.toLowerCase();
    const modelUpper = modelName.toUpperCase();

    const conditionCandidates = [
        p.condition_image_url,
        `제품설명이미지/${modelName}(조건표).png`,
        `제품설명이미지/${modelName}(조건표).jpg`,
        `제품설명이미지/${modelLower}(조건표).png`,
        `제품설명이미지/${modelLower}(조건표).jpg`,
        `제품설명이미지/${modelUpper}(조건표).png`,
        `제품설명이미지/${modelUpper}(조건표).jpg`,
        `제품설명이미지/${modelName}.png`,
        `제품설명이미지/${modelName}.jpg`,
        `제품설명이미지/${modelLower}.png`,
        `제품설명이미지/${modelLower}.jpg`,
        `제품설명이미지/${modelUpper}.png`,
        `제품설명이미지/${modelUpper}.jpg`,
        '/uploads/c3322_condition.png',
        '제품설명이미지/c3322(조건표).png'
    ].filter(Boolean);

    if (condImg && alwaysVisibleConditionCard) {
        let condIndex = 0;
        const loadNextConditionImage = () => {
            if (condIndex < conditionCandidates.length) {
                const srcUrl = conditionCandidates[condIndex++];
                condImg.src = srcUrl.includes('?') ? srcUrl : `${srcUrl}?t=${Date.now()}`;
            } else {
                alwaysVisibleConditionCard.style.display = 'none';
            }
        };

        condImg.onerror = function() {
            loadNextConditionImage();
        };

        alwaysVisibleConditionCard.style.display = 'block';
        if (conditionShortcutWrap) conditionShortcutWrap.style.display = 'block';
        loadNextConditionImage();
    }

    // 4. 2단 탭 클릭 및 화면 전환 이벤트 바인딩
    const tabButtons = document.querySelectorAll('.detail-tab-btn');
    const tabPanels = document.querySelectorAll('.detail-tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-target') || btn.getAttribute('data-tab');

            tabButtons.forEach(t => t.classList.remove('active'));
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                panel.style.display = 'none';
            });

            btn.classList.add('active');
            const activePanel = document.getElementById(targetTab);
            if (activePanel) {
                activePanel.classList.add('active');
                activePanel.style.display = 'block';
            }
        });
    });

    const goToConditionBtn = document.getElementById('goToConditionBtn');
    if (goToConditionBtn) {
        goToConditionBtn.addEventListener('click', () => {
            if (alwaysVisibleConditionCard) {
                alwaysVisibleConditionCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
}