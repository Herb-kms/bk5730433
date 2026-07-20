/**
 * @file js/admin/admin-reviews.js
 * @description 복사기마트 관리자 모드 설치후기 CRUD 비즈니스 로직 제어 스크립트
 */

// 후기 fetch
const fetchAdminReviews = async () => {
    const loading = document.getElementById('loadingMsg');
    const noData = document.getElementById('noDataMsg');
    const table = document.getElementById('adminTable');

    loading.style.display = 'block';
    noData.style.display = 'none';
    table.style.display = 'none';

    try {
        const response = await fetch('/api/reviews');
        if (!response.ok) throw new Error('불러오기 오류');

        const data = await response.json();
        currentReviews = data;

        document.getElementById('tabTitle').setAttribute('data-count', currentReviews.length);
        renderTable();
    } catch (err) {
        console.error(err);
        noData.innerText = '데이터를 불러오는데 실패했습니다.';
        noData.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
};

// 설치후기 등록 모달 제어
const openCreateModal = () => {
    document.getElementById('createForm').reset();
    document.getElementById('createImagePreview').innerHTML = `<i class="fas fa-camera"></i><span>사진 파일 선택하기</span>`;
    document.getElementById('createModal').classList.add('active');
    if (window.drafts && window.drafts['createForm']) window.drafts['createForm'].check();
};

const closeCreateModal = () => {
    document.getElementById('createModal').classList.remove('active');
};

// 설치후기 수정 모달 제어
const openEditModal = (id) => {
    const review = currentReviews.find(r => r.id === id);
    if (!review) return;

    const form = document.getElementById('editForm');
    form.id.value = review.id;
    form.category.value = review.category;
    form.title.value = review.title;
    form.author.value = review.author;
    form.content.value = review.content;

    const preview = document.getElementById('editImagePreview');
    if (review.image_url) {
        preview.innerHTML = `<img src="${review.image_url}" alt="current">`;
    } else {
        preview.innerHTML = `<i class="fas fa-camera"></i><span>사진 변경할 경우 선택</span>`;
    }

    document.getElementById('editModal').classList.add('active');
    if (window.drafts && window.drafts['editForm']) window.drafts['editForm'].check();
};

const closeEditModal = () => {
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('editImageInput').value = '';
};

// 이미지 파일 미리보기 설정
document.getElementById('createImageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('createImagePreview');
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => { preview.innerHTML = `<img src="${e.target.result}" alt="preview">`; };
        reader.readAsDataURL(file);
    }
});

document.getElementById('editImageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('editImagePreview');
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => { preview.innerHTML = `<img src="${e.target.result}" alt="preview">`; };
        reader.readAsDataURL(file);
    }
});

// 폼 전송 이벤트 바인딩 (설치 후기)
document.getElementById('createForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Accept': 'application/json' }, body: formData });
        if (res.ok) {
            closeCreateModal();
            fetchAdminReviews();
            alert('성공적으로 등록되었습니다.');
        } else {
            const err = await res.json();
            alert('등록 실패: ' + (err.error || '오류'));
        }
    } catch (err) { alert('서버 오류'); }
});

document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');
    try {
        const res = await fetch(`/api/reviews/${id}`, { method: 'PUT', headers: { 'Accept': 'application/json' }, body: formData });
        if (res.ok) {
            closeEditModal();
            fetchAdminReviews();
            alert('수정되었습니다.');
        } else {
            const err = await res.json();
            alert('수정 실패: ' + (err.error || '오류'));
        }
    } catch (err) { alert('서버 오류'); }
});

// 삭제 처리
const deleteData = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
        const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
        if (res.ok) fetchAdminReviews();
        else alert('삭제 실패');
    } catch (err) { console.error(err); }
};
