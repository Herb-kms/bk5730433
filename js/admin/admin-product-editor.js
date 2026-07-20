/**
 * @file js/admin/admin-product-editor.js
 * @description 복사기마트 관리자 모드 통합 위저드(스텝형) 제품 편집/등록 모듈
 */

let quill = null;
let currentEditMode = 'create'; // 'create' or 'edit'

// Document Ready: Quill 에디터 초기 기동
document.addEventListener('DOMContentLoaded', () => {
    initQuillEditor();
});

// 1. Quill WYSIWYG 에디터 초기화
function initQuillEditor() {
    const container = document.getElementById('quillEditorContainer');
    if (!container) return;

    // Quill 에디터 기동 (Snow 테마, 풍부한 편집 도구 활성화)
    quill = new Quill('#quillEditorContainer', {
        theme: 'snow',
        placeholder: '제품의 상세 특징, 장점, 소개 이미지를 다양하게 배치하여 예쁘게 꾸며보세요!',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
}

// 2. 파일 입력 시 즉시 미리보기 구현
function previewSelectedImage(input, previewId) {
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const imgHtml = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: contain;">`;
        if (input.id === 'editProductImageInput') {
            const prevCard = document.getElementById('editProductImagePreviewCard');
            if (prevCard) prevCard.innerHTML = imgHtml;
            const prevDetail = document.getElementById('editProductImagePreview');
            if (prevDetail) prevDetail.innerHTML = imgHtml;
        } else {
            const previewEl = document.getElementById(previewId);
            if (previewEl) previewEl.innerHTML = imgHtml;
        }
    };
    reader.readAsDataURL(file);
}

// 3. 위저드 스텝 전환 제어 (Validation 포함)
function goToStep(stepNum) {
    const form = document.getElementById('integratedProductForm');
    
    // 1단계에서 2단계로 넘어갈 때 필수 필드 검증
    if (stepNum === 2) {
        const type = form.type.value;
        const brand = form.brand.value;
        const category = form.category.value;
        const name = form.name.value.trim();
        const price = form.price.value;
        
        if (!type || !brand || !category || !name || !price) {
            alert('1단계의 제품 유형, 브랜드, 카테고리, 제품명, 가격 정보를 모두 기입하셔야 다음 단계로 진입할 수 있습니다.');
            return;
        }
    }

    // 패널 가시성 스위칭
    const panels = document.querySelectorAll('.step-panel');
    panels.forEach((p, idx) => {
        if (idx + 1 === stepNum) {
            p.style.display = 'block';
        } else {
            p.style.display = 'none';
        }
    });

    // 상단 인디케이터 헤더 동기화
    const headers = document.querySelectorAll('.stepper-wrapper .step-header');
    headers.forEach((h, idx) => {
        const stepIndex = idx + 1;
        if (stepIndex === stepNum) {
            h.classList.add('active');
            h.style.color = '#2563eb';
            h.style.fontWeight = '700';
            const numSpan = h.querySelector('span');
            if (numSpan) numSpan.style.background = '#2563eb';
        } else {
            h.classList.remove('active');
            h.style.color = '#94a3b8';
            h.style.fontWeight = '500';
            const numSpan = h.querySelector('span');
            if (numSpan) numSpan.style.background = '#cbd5e1';
        }
    });
}

// 4. 제품 편집/등록 전용 SPA 화면 진입
function enterProductEdit(id = null) {
    // 기존 테이블 컨테이너 및 탭 관리 숨김
    const mainCard = document.querySelector('.admin-card:not(#adminProductEditContainer)');
    if (mainCard) mainCard.style.display = 'none';

    // 위저드 폼 컨테이너 활성화
    const editorContainer = document.getElementById('adminProductEditContainer');
    editorContainer.style.display = 'block';

    const form = document.getElementById('integratedProductForm');
    form.reset();
    if (quill) quill.root.innerHTML = '';

    // 이미지 미리보기 초기화
    resetImagePreviews();

    if (id) {
        // [수정 모드]
        currentEditMode = 'edit';
        document.getElementById('editSectionTitle').innerHTML = `<i class="fas fa-edit" style="color:#2563eb;"></i> 제품 상세 사양 수정`;
        
        const product = currentProducts.find(p => p.id === id);
        if (!product) return;

        // 1단계 값 로드
        form.id.value = product.id;
        form.type.value = product.type;
        form.brand.value = product.brand;
        form.category.value = product.category;
        form.name.value = product.name;
        form.price.value = product.price;
        form.badge.value = product.badge || '';
        form.image_zoom_card.value = product.image_zoom_card !== undefined ? product.image_zoom_card : 130;
        form.image_padding_card.value = product.image_padding_card !== undefined ? product.image_padding_card : 10;

        // 1번 대표 이미지 미리보기 (Step 1 카드 + Step 2 상세 1번 공용)
        if (product.image_url) {
            const imgHtml = `<img src="${product.image_url}" style="width: 100%; height: 100%; object-fit: contain;">`;
            const prevCard = document.getElementById('editProductImagePreviewCard');
            if (prevCard) prevCard.innerHTML = imgHtml;
            const prevDetail = document.getElementById('editProductImagePreview');
            if (prevDetail) prevDetail.innerHTML = imgHtml;
        }

        // 2단계 값 로드
        form.specs.value = product.specs || '';
        form.naver_talk.value = product.naver_talk || '';
        form.kakao_talk.value = product.kakao_talk || '';
        form.image_zoom_1.value = product.image_zoom_1 !== undefined ? product.image_zoom_1 : 130;
        form.image_padding_1.value = product.image_padding_1 !== undefined ? product.image_padding_1 : 10;
        form.image_zoom_2.value = product.image_zoom_2 !== undefined ? product.image_zoom_2 : 130;
        form.image_padding_2.value = product.image_padding_2 !== undefined ? product.image_padding_2 : 10;
        form.image_zoom_3.value = product.image_zoom_3 !== undefined ? product.image_zoom_3 : 130;
        form.image_padding_3.value = product.image_padding_3 !== undefined ? product.image_padding_3 : 10;
        if (quill) {
            quill.root.innerHTML = product.description || '';
        }


        // 2번 이미지 미리보기
        if (product.image_url_2) {
            document.getElementById('editProductImagePreview2').innerHTML = `<img src="${product.image_url_2}" style="width: 100%; height: 100%; object-fit: contain;">`;
        }
        // 3번 이미지 미리보기
        if (product.image_url_3) {
            const prev3 = document.getElementById('editProductImagePreview3');
            if (prev3) prev3.innerHTML = `<img src="${product.image_url_3}" style="width: 100%; height: 100%; object-fit: contain;">`;
        }
        // 제품설명 이미지 미리보기
        if (product.detail_image_url) {
            const prevDetail = document.getElementById('editProductImagePreviewDetail');
            if (prevDetail) prevDetail.innerHTML = `<img src="${product.detail_image_url}" style="width: 100%; height: 100%; object-fit: contain;">`;
        }
        // 조건표 이미지 미리보기
        if (product.condition_image_url) {
            const prevCond = document.getElementById('editProductImagePreviewCondition');
            if (prevCond) prevCond.innerHTML = `<img src="${product.condition_image_url}" style="width: 100%; height: 100%; object-fit: contain;">`;
        }
    } else {
        // [새로 등록 모드]
        currentEditMode = 'create';
        document.getElementById('editSectionTitle').innerHTML = `<i class="fas fa-plus" style="color:#10b981;"></i> 새 제품 위저드 등록`;
        form.id.value = '';

        // 기본 줌/패딩 설정 수치 기입
        form.image_zoom_card.value = 130;
        form.image_padding_card.value = 10;
        form.image_zoom_1.value = 130;
        form.image_padding_1.value = 10;
        form.image_zoom_2.value = 130;
        form.image_padding_2.value = 10;
        form.image_zoom_3.value = 130;
        form.image_padding_3.value = 10;
    }

    // 1단계 활성화 상태로 시작
    goToStep(1);
}

// 5. 제품 이미지 프리뷰 컨테이너 리셋
function resetImagePreviews() {
    // Step 1 카드 이미지
    const prevCard = document.getElementById('editProductImagePreviewCard');
    if (prevCard) prevCard.innerHTML = `
        <i class="fas fa-camera" style="font-size: 2.5rem; color: #2563eb; display:block; margin-bottom: 8px; opacity:0.4;"></i>
        <span style="color: #2563eb; font-size: 0.9rem;">클릭하여 카드 이미지 등록</span>
    `;
    // Step 2 상세페이지 1번 이미지
    const prevDetail = document.getElementById('editProductImagePreview');
    if (prevDetail) prevDetail.innerHTML = `
        <i class="fas fa-camera" style="font-size: 1.6rem; color: #2563eb; display:block; margin-bottom: 5px; opacity:0.5;"></i>
        <span style="color: #2563eb; font-size: 0.8rem;">클릭하여 이미지 변경</span>
    `;
    document.getElementById('editProductImagePreview2').innerHTML = `
        <i class="fas fa-camera" style="font-size: 1.6rem; color: #cbd5e1; display:block; margin-bottom: 5px;"></i>
        <span style="color: #64748b; font-size: 0.8rem;">클릭하여 측면 이미지 등록</span>
    `;
    const prev3 = document.getElementById('editProductImagePreview3');
    if (prev3) prev3.innerHTML = `
        <i class="fas fa-camera" style="font-size: 1.6rem; color: #cbd5e1; display:block; margin-bottom: 5px;"></i>
        <span style="color: #64748b; font-size: 0.8rem;">클릭하여 상세 이미지 등록</span>
    `;
    const prevDescDetail = document.getElementById('editProductImagePreviewDetail');
    if (prevDescDetail) prevDescDetail.innerHTML = `
        <i class="fas fa-camera" style="font-size: 1.6rem; color: #cbd5e1; display:block; margin-bottom: 5px;"></i>
        <span style="color: #64748b; font-size: 0.8rem;">클릭하여 제품 설명 이미지 등록</span>
    `;
    const prevCond = document.getElementById('editProductImagePreviewCondition');
    if (prevCond) prevCond.innerHTML = `
        <i class="fas fa-camera" style="font-size: 1.6rem; color: #cbd5e1; display:block; margin-bottom: 5px;"></i>
        <span style="color: #64748b; font-size: 0.8rem;">클릭하여 조건표 이미지 등록</span>
    `;

    // input file 초기화
    const inpCard = document.getElementById('editProductImageInput');
    if (inpCard) inpCard.value = '';
    document.getElementById('editProductImageInput2').value = '';
    const inp3 = document.getElementById('editProductImageInput3');
    if (inp3) inp3.value = '';
    const inpDetail = document.getElementById('editProductImageInputDetail');
    if (inpDetail) inpDetail.value = '';
    const inpCond = document.getElementById('editProductImageInputCondition');
    if (inpCond) inpCond.value = '';
}


// 6. 편집 모드 이탈 및 복원
function exitProductEdit() {
    document.getElementById('adminProductEditContainer').style.display = 'none';
    const mainCard = document.querySelector('.admin-card:not(#adminProductEditContainer)');
    if (mainCard) mainCard.style.display = 'block';

    const form = document.getElementById('integratedProductForm');
    form.reset();
    if (quill) quill.root.innerHTML = '';
}

// 7. 통합 FormData 비동기 제출 핸들러 (수정 및 추가)
async function handleIntegratedProductSubmit(event) {
    event.preventDefault();

    const form = document.getElementById('integratedProductForm');
    const id = form.id.value;
    const formData = new FormData(form);

    // Quill 에디터의 HTML 본문 데이터를 설명글 필드로 강제 동기화 바인딩
    if (quill) {
        formData.set('description', quill.root.innerHTML);
    }

    const url = currentEditMode === 'edit' ? `/api/products/${id}` : '/api/products';
    const method = currentEditMode === 'edit' ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            body: formData // multipart/form-data 자동 감지
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || '저장 오류');
        }

        alert('제품 정보가 성공적으로 반영되었습니다.');
        exitProductEdit();
        
        // 목록 다시 고침
        if (typeof fetchAdminProducts === 'function') {
            fetchAdminProducts();
        }
    } catch (err) {
        console.error(err);
        alert(`반영 실패: ${err.message}`);
    }
}
