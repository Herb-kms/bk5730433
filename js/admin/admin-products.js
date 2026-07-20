/**
 * @file js/admin/admin-products.js
 * @description 복사기마트 관리자 모드 제품 CRUD 및 실시간 프리뷰 엔진 스크립트
 */

// 제품 fetch
const fetchAdminProducts = async () => {
    const loading = document.getElementById('loadingMsg');
    const noData = document.getElementById('noDataMsg');
    const table = document.getElementById('adminTable');

    loading.style.display = 'block';
    noData.style.display = 'none';
    table.style.display = 'none';

    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('불러오기 오류');

        const data = await response.json();
        currentProducts = data;

        document.getElementById('tabTitle').setAttribute('data-count', currentProducts.length);
        renderTable();
    } catch (err) {
        console.error(err);
        noData.innerText = '제품 목록을 불러오는데 실패했습니다.';
        noData.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
};

// 프리뷰 탭 스위칭 바인더
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

// 제품 등록/수정 모달 제어 (위저드 방식으로 전환 후 레거시 호환 유지)
const openProductModal = (mode, id = null) => {
    const modalEl = document.getElementById(mode === 'create' ? 'createProductModal' : 'editProductModal');
    if (!modalEl) {
        // 위저드 방식으로 전환되어 모달 DOM이 없는 경우 위저드로 대신 진입
        if (typeof enterProductEdit === 'function') enterProductEdit(id);
        return;
    }
    initPreviewTabs(modalEl);
    if (mode === 'create') {
        document.getElementById('createProductForm').reset();
        document.getElementById('createProductImagePreview').innerHTML = `<i class="fas fa-camera"></i><span>사진 파일 선택하기</span>`;
        document.getElementById('createProductModal').classList.add('active');
        if (window.drafts && window.drafts['createProductForm']) window.drafts['createProductForm'].check();
        
        // 등록 라이브 프리뷰 초기화 및 연동
        document.getElementById('createPreviewImg').src = '/img/standing_color_copier.PNG';
        const createMiniImg = document.getElementById('createMiniImg');
        if (createMiniImg) createMiniImg.src = '/img/standing_color_copier.PNG';
        
        const update = initProductLivePreview('createProductForm', 'create');
        update();
    } else {
        const product = currentProducts.find(p => p.id === id);
        if (!product) return;
        const form = document.getElementById('editProductForm');
        form.id.value = product.id;
        form.type.value = product.type;
        form.category.value = product.category;
        form.brand.value = product.brand;
        form.name.value = product.name;
        form.price.value = product.price;
        form.badge.value = product.badge || '';
        form.description.value = product.description || '';
        form.specs.value = product.specs || '';
        form.naver_talk.value = product.naver_talk || '';
        form.kakao_talk.value = product.kakao_talk || '';
        
        const preview = document.getElementById('editProductImagePreview');
        if (product.image_url) {
            preview.innerHTML = `<img src="${product.image_url}" alt="thumb">`;
        } else {
            preview.innerHTML = `<i class="fas fa-camera"></i><span>사진 변경할 경우 선택</span>`;
        }

        // 2번/3번 사진 미리보기 초기화
        const preview2 = document.getElementById('editProductImagePreview2');
        const preview3 = document.getElementById('editProductImagePreview3');
        if (preview2) {
            if (product.image_url_2) {
                preview2.innerHTML = `<img src="${product.image_url_2}" alt="thumb2">`;
            } else {
                preview2.innerHTML = `<i class="fas fa-camera"></i><span>2번 사진 변경하기</span>`;
            }
        }
        if (preview3) {
            if (product.image_url_3) {
                preview3.innerHTML = `<img src="${product.image_url_3}" alt="thumb3">`;
            } else {
                preview3.innerHTML = `<i class="fas fa-camera"></i><span>3번 사진 변경하기</span>`;
            }
        }
        
        // 수정 라이브 프리뷰 초기화 및 연동
        document.getElementById('editPreviewImg').src = product.image_url || '/img/standing_color_copier.PNG';
        const editMiniImg = document.getElementById('editMiniImg');
        if (editMiniImg) editMiniImg.src = product.image_url || '/img/standing_color_copier.PNG';
        // 2번/3번 사진도 프리뷰2에 반영
        const editMiniImg2 = document.getElementById('editMiniImg2');
        const editMiniImg3 = document.getElementById('editMiniImg3');
        if (editMiniImg2) editMiniImg2.src = product.image_url_2 || product.image_url || '/img/standing_color_copier.PNG';
        if (editMiniImg3) editMiniImg3.src = product.image_url_3 || product.image_url_2 || product.image_url || '/img/standing_color_copier.PNG';
        
        const update = initProductLivePreview('editProductForm', 'edit');
        update();

        document.getElementById('editProductModal').classList.add('active');
        if (window.drafts && window.drafts['editProductForm']) window.drafts['editProductForm'].check();
    }
};

const closeProductModal = (mode) => {
    const modalId = mode === 'create' ? 'createProductModal' : 'editProductModal';
    document.getElementById(modalId).classList.remove('active');
    if (mode === 'edit') {
        document.getElementById('editProductImageInput').value = '';
        document.getElementById('editProductImageInput2').value = '';
        document.getElementById('editProductImageInput3').value = '';
    } else {
        document.getElementById('createProductImageInput').value = '';
        document.getElementById('createProductImageInput2').value = '';
        document.getElementById('createProductImageInput3').value = '';
    }
};

// 제품 이미지 파일 미리보기 설정
document.getElementById('createProductImageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('createProductImagePreview');
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            preview.innerHTML = `<img src="${ev.target.result}" alt="preview">`;
            // 프리뷰1 이미지도 업데이트
            document.getElementById('createPreviewImg').src = ev.target.result;
            const mini = document.getElementById('createMiniImg');
            if (mini) mini.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('createProductImageInput2').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('createProductImagePreview2');
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            preview.innerHTML = `<img src="${ev.target.result}" alt="preview2">`;
            const mini2 = document.getElementById('createMiniImg2');
            if (mini2) mini2.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('createProductImageInput3').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('createProductImagePreview3');
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            preview.innerHTML = `<img src="${ev.target.result}" alt="preview3">`;
            const mini3 = document.getElementById('createMiniImg3');
            if (mini3) mini3.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('editProductImageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('editProductImagePreview');
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            preview.innerHTML = `<img src="${ev.target.result}" alt="preview">`;
            // 프리뷰1 이미지도 업데이트
            document.getElementById('editPreviewImg').src = ev.target.result;
            const mini = document.getElementById('editMiniImg');
            if (mini) mini.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('editProductImageInput2').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('editProductImagePreview2');
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            preview.innerHTML = `<img src="${ev.target.result}" alt="preview2">`;
            const mini2 = document.getElementById('editMiniImg2');
            if (mini2) mini2.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('editProductImageInput3').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('editProductImagePreview3');
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            preview.innerHTML = `<img src="${ev.target.result}" alt="preview3">`;
            const mini3 = document.getElementById('editMiniImg3');
            if (mini3) mini3.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// 제품 등록/수정 폼 제출
document.getElementById('createProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        const res = await fetch('/api/products', { method: 'POST', body: formData });
        if (res.ok) {
            closeProductModal('create');
            fetchAdminProducts();
            alert('제품이 등록되었습니다.');
        } else {
            const err = await res.json();
            alert('등록 실패: ' + (err.error || '오류'));
        }
    } catch (err) { alert('서버 오류'); }
});

document.getElementById('editProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');
    try {
        const res = await fetch(`/api/products/${id}`, { method: 'PUT', body: formData });
        if (res.ok) {
            closeProductModal('edit');
            fetchAdminProducts();
            alert('제품 정보가 수정되었습니다.');
        } else {
            const err = await res.json();
            alert('수정 실패: ' + (err.error || '오류'));
        }
    } catch (err) { alert('서버 오류'); }
});

// 제품 삭제
const deleteProduct = async (id) => {
    if (!confirm('정말 이 제품을 삭제하시겠습니까?')) return;
    try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchAdminProducts();
            alert('제품이 삭제되었습니다.');
        } else {
            alert('삭제 실패');
        }
    } catch (err) { console.error(err); }
};

// 제품 정보 실시간 프리뷰 갱신 엔진
const initProductLivePreview = (formId, prefix) => {
    const form = document.getElementById(formId);
    if (!form) return () => {};

    const previewImg = document.getElementById(`${prefix}PreviewImg`);
    const previewLogo = document.getElementById(`${prefix}PreviewLogo`);
    const previewName = document.getElementById(`${prefix}PreviewName`);
    const previewPrice = document.getElementById(`${prefix}PreviewPrice`);

    const updatePreview = () => {
        const name = form.elements['name'].value || '제품명';
        const priceVal = parseInt(form.elements['price'].value, 10) || 0;
        const type = form.elements['type'].value;
        const brand = form.elements['brand'].value;
        const badge = form.elements['badge'].value || `${brand.toUpperCase()} 복합기`;
        const desc = form.elements['description'].value || '기기 상세 설명';
        const specs = form.elements['specs'].value || '25ppm,1200dpi,지원 기능';

        const specList = specs.split(',');
        const speed = specList[0] || '-';
        const resolution = specList[1] || '-';
        const features = specList[2] || '-';

        // 1. 카드 프리뷰 업데이트
        if (previewName) previewName.innerText = name;
        const formattedPrice = priceVal.toLocaleString() + (type === 'rental' ? ' 원 / 월' : ' 원');
        if (previewPrice) previewPrice.innerText = formattedPrice;

        if (previewLogo) {
            let logoHtml = '';
            if (brand === 'canon') {
                logoHtml = `<img src="img/logo_canon.svg" alt="Canon" class="brand-logo-img brand-canon">`;
            } else if (brand === 'minolta') {
                logoHtml = `<img src="img/logo_minolta.svg" alt="Minolta" class="brand-logo-img brand-minolta">`;
            } else if (brand === 'samsung') {
                logoHtml = `<img src="img/logo_samsung.svg" alt="Samsung" class="brand-logo-img brand-samsung">`;
            } else if (brand === 'sindoh') {
                logoHtml = `<img src="img/logo_sindoh.svg" alt="Sindoh" class="brand-logo-img brand-sindoh">`;
            } else if (brand === 'hp') {
                logoHtml = `<img src="img/logo_hp.svg" alt="HP" class="brand-logo-img brand-hp">`;
            } else {
                logoHtml = `<span class="brand-text-logo" style="text-transform:uppercase;">${brand}</span>`;
            }
            previewLogo.innerHTML = logoHtml;
        }

        // 2. 상세페이지 미니 프리뷰 업데이트
        const miniPrefix = prefix === 'create' ? 'createMini' : 'editMini';
        const mBreadcrumbType = document.getElementById(`${miniPrefix}BreadcrumbType`);
        const mBreadcrumbName = document.getElementById(`${miniPrefix}BreadcrumbName`);
        const mBadge = document.getElementById(`${miniPrefix}Badge`);
        const mName = document.getElementById(`${miniPrefix}Name`);
        const mDesc = document.getElementById(`${miniPrefix}Desc`);
        const mSimType = document.getElementById(`${miniPrefix}SimType`);
        const mPriceLabel = document.getElementById(`${miniPrefix}PriceLabel`);
        const mPrice = document.getElementById(`${miniPrefix}Price`);
        const mSpecSpeed = document.getElementById(`${miniPrefix}SpecSpeed`);
        const mSpecResolution = document.getElementById(`${miniPrefix}SpecResolution`);
        const mSpecFeature = document.getElementById(`${miniPrefix}SpecFeature`);

        if (mBreadcrumbType) mBreadcrumbType.innerText = type === 'rental' ? '임대제품' : '판매제품';
        if (mBreadcrumbName) mBreadcrumbName.innerText = name;
        if (mBadge) mBadge.innerText = badge;
        if (mName) mName.innerText = name;
        if (mDesc) mDesc.innerText = desc;
        if (mSimType) mSimType.innerText = type === 'rental' ? '임대 상품' : '판매 상품';
        if (mPriceLabel) mPriceLabel.innerText = type === 'rental' ? '예상 월 렌탈료' : '최종 구매 가격';
        if (mPrice) mPrice.innerText = priceVal.toLocaleString() + ' 원' + (type === 'rental' ? ' / 월' : '');
        if (mSpecSpeed) mSpecSpeed.innerText = speed;
        if (mSpecResolution) mSpecResolution.innerText = resolution;
        if (mSpecFeature) mSpecFeature.innerText = features;
    };

    form.addEventListener('input', updatePreview);
    form.addEventListener('change', updatePreview);

    const fileInput = form.querySelector('input[type="file"]');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (previewImg) previewImg.src = e.target.result;
                    const miniPrefix = prefix === 'create' ? 'createMini' : 'editMini';
                    const mImg = document.getElementById(`${miniPrefix}Img`);
                    if (mImg) mImg.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    return updatePreview;
};

// ── 프리뷰2 사진 전환 함수 (글로벌 스코프) ─────────────────
function switchCreateThumb(idx) {
    ['createMiniImg', 'createMiniImg2', 'createMiniImg3'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.style.display = (i + 1 === idx) ? 'block' : 'none';
    });
    document.querySelectorAll('.create-thumb-btn').forEach(btn => {
        const isActive = parseInt(btn.dataset.idx) === idx;
        btn.style.border = isActive ? '1px solid #3b82f6' : '1px solid #e2e8f0';
        btn.style.color = isActive ? '#3b82f6' : '#64748b';
        btn.style.background = isActive ? '#eff6ff' : '#ffffff';
    });
}

function switchEditThumb(idx) {
    ['editMiniImg', 'editMiniImg2', 'editMiniImg3'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.style.display = (i + 1 === idx) ? 'block' : 'none';
    });
    document.querySelectorAll('.edit-thumb-btn').forEach(btn => {
        const isActive = parseInt(btn.dataset.idx) === idx;
        btn.style.border = isActive ? '1px solid #3b82f6' : '1px solid #e2e8f0';
        btn.style.color = isActive ? '#3b82f6' : '#64748b';
        btn.style.background = isActive ? '#eff6ff' : '#ffffff';
    });
}
