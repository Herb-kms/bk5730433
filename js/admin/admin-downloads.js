/**
 * @file js/admin/admin-downloads.js
 * @description 복사기마트 관리자 모드 자료실 CRUD 비즈니스 로직 제어 스크립트
 */

// 자료실 fetch
const fetchAdminDownloads = async () => {
    const loading = document.getElementById('loadingMsg');
    const noData = document.getElementById('noDataMsg');
    const table = document.getElementById('adminTable');

    loading.style.display = 'block';
    noData.style.display = 'none';
    table.style.display = 'none';

    try {
        const response = await fetch('/api/downloads');
        if (!response.ok) throw new Error('불러오기 오류');

        const data = await response.json();
        currentDownloads = data;

        document.getElementById('tabTitle').setAttribute('data-count', currentDownloads.length);
        renderTable();
    } catch (err) {
        console.error(err);
        noData.innerText = '자료실 목록을 불러오는데 실패했습니다.';
        noData.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
};

// 자료실 모달 제어
const openDownloadModal = (mode, id = null) => {
    if (mode === 'create') {
        document.getElementById('createDownloadForm').reset();
        document.getElementById('createDownloadModal').classList.add('active');
        if (window.drafts && window.drafts['createDownloadForm']) window.drafts['createDownloadForm'].check();
    } else {
        const download = currentDownloads.find(d => d.id === id);
        if (!download) return;
        const form = document.getElementById('editDownloadForm');
        form.id.value = download.id;
        form.title.value = download.title;
        form.description.value = download.description || '';
        document.getElementById('editDownloadModal').classList.add('active');
        if (window.drafts && window.drafts['editDownloadForm']) window.drafts['editDownloadForm'].check();
    }
};

const closeDownloadModal = (mode) => {
    const modalId = mode === 'create' ? 'createDownloadModal' : 'editDownloadModal';
    document.getElementById(modalId).classList.remove('active');
};

// 자료실 등록/수정 이벤트
document.getElementById('createDownloadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        const res = await fetch('/api/downloads', { method: 'POST', headers: { 'Accept': 'application/json' }, body: formData });
        if (res.ok) {
            closeDownloadModal('create');
            fetchAdminDownloads();
            alert('자료가 정상적으로 등록되었습니다.');
        } else {
            const err = await res.json();
            alert('등록 실패: ' + (err.error || '오류'));
        }
    } catch (err) { alert('서버 오류'); }
});

document.getElementById('editDownloadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');
    try {
        const res = await fetch(`/api/downloads/${id}`, { method: 'PUT', headers: { 'Accept': 'application/json' }, body: formData });
        if (res.ok) {
            closeDownloadModal('edit');
            fetchAdminDownloads();
            alert('자료 정보가 수정되었습니다.');
        } else {
            const err = await res.json();
            alert('수정 실패: ' + (err.error || '오류'));
        }
    } catch (err) { alert('서버 오류'); }
});

// 자료실 삭제
const deleteDownload = async (id) => {
    if (!confirm('자료실 항목을 삭제하시겠습니까? (서버에 업로드된 실제 파일도 영구적으로 삭제됩니다)')) return;
    try {
        const res = await fetch(`/api/downloads/${id}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
        if (res.ok) fetchAdminDownloads();
        else alert('삭제 실패');
    } catch (err) { console.error(err); }
};
