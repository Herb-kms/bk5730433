/**
 * @file js/admin/admin-notices.js
 * @description 복사기마트 관리자 모드 공지사항 CRUD 비즈니스 로직 제어 스크립트
 */

// 공지사항 fetch
const fetchAdminNotices = async () => {
    const loading = document.getElementById('loadingMsg');
    const noData = document.getElementById('noDataMsg');
    const table = document.getElementById('adminTable');

    loading.style.display = 'block';
    noData.style.display = 'none';
    table.style.display = 'none';

    try {
        const response = await fetch('/api/notices');
        if (!response.ok) throw new Error('불러오기 오류');

        const data = await response.json();
        currentNotices = data;

        document.getElementById('tabTitle').setAttribute('data-count', currentNotices.length);
        renderTable();
    } catch (err) {
        console.error(err);
        noData.innerText = '공지사항을 불러오는데 실패했습니다.';
        noData.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
};

// 공지사항 모달 제어
const openNoticeModal = (mode, id = null) => {
    if (mode === 'create') {
        document.getElementById('createNoticeForm').reset();
        document.getElementById('createNoticeModal').classList.add('active');
        if (window.drafts && window.drafts['createNoticeForm']) window.drafts['createNoticeForm'].check();
    } else {
        const notice = currentNotices.find(n => n.id === id);
        if (!notice) return;
        const form = document.getElementById('editNoticeForm');
        form.id.value = notice.id;
        form.type.value = notice.type;
        form.is_pinned.value = notice.is_pinned;
        form.title.value = notice.title;
        form.content.value = notice.content;
        document.getElementById('editNoticeModal').classList.add('active');
        if (window.drafts && window.drafts['editNoticeForm']) window.drafts['editNoticeForm'].check();
    }
};

const closeNoticeModal = (mode) => {
    const modalId = mode === 'create' ? 'createNoticeModal' : 'editNoticeModal';
    document.getElementById(modalId).classList.remove('active');
};

// 공지사항 등록/수정 이벤트
document.getElementById('createNoticeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        type: formData.get('type'),
        is_pinned: parseInt(formData.get('is_pinned')),
        title: formData.get('title'),
        content: formData.get('content')
    };
    try {
        const res = await fetch('/api/notices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeNoticeModal('create');
            fetchAdminNotices();
            alert('공지사항이 등록되었습니다.');
        } else {
            const err = await res.json();
            alert('등록 실패: ' + (err.error || '오류'));
        }
    } catch (err) { alert('서버 오류'); }
});

document.getElementById('editNoticeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');
    const data = {
        type: formData.get('type'),
        is_pinned: parseInt(formData.get('is_pinned')),
        title: formData.get('title'),
        content: formData.get('content')
    };
    try {
        const res = await fetch(`/api/notices/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeNoticeModal('edit');
            fetchAdminNotices();
            alert('공지사항이 수정되었습니다.');
        } else {
            const err = await res.json();
            alert('수정 실패: ' + (err.error || '오류'));
        }
    } catch (err) { alert('서버 오류'); }
});

// 공지사항 삭제
const deleteNotice = async (id) => {
    if (!confirm('공지사항을 삭제하시겠습니까?')) return;
    try {
        const res = await fetch(`/api/notices/${id}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
        if (res.ok) fetchAdminNotices();
        else alert('삭제 실패');
    } catch (err) { console.error(err); }
};
