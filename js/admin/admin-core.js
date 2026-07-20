/**
 * @file js/admin/admin-core.js
 * @description 복사기마트 관리자 모드 공통 상태 변수, 세션 체크, 탭 스위칭 및 자동저장 기능 제어
 */

// 전역 상태 변수 공유
let currentReviews = [];
let currentNotices = [];
let currentDownloads = [];
let currentProducts = [];
let currentUsers = [];
let currentTab = 'reviews';

// 전용 세션 체크 및 관리자 확인
const checkAdminSession = async () => {
    try {
        const res = await fetch('/api/session');
        const data = await res.json();
        if (!data.loggedIn || data.user.user_type !== 'admin') {
            alert('관리자 권한이 없습니다.');
            location.href = 'login.html';
        } else {
            document.getElementById('adminName').innerText = `${data.user.username}님`;
        }
    } catch (err) {
        console.error('세션 확인 실패:', err);
        location.href = 'login.html';
    }
};

// 탭 전환 기능
const switchTab = (tab) => {
    currentTab = tab;
    
    // 사이드바 활성 스타일 토글
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        if (item.getAttribute('data-tab') === tab) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 타이틀 및 추가 버튼 변경
    const tabTitle = document.getElementById('tabTitle');
    const addBtn = document.getElementById('addBtn');

    addBtn.style.display = 'inline-block';
    if (tab === 'reviews') {
        tabTitle.innerText = '설치후기 관리';
        addBtn.innerHTML = '<i class="fas fa-plus"></i> 새 후기 등록';
        addBtn.setAttribute('onclick', "openCreateModal()");
    } else if (tab === 'notices') {
        tabTitle.innerText = '공지사항 관리';
        addBtn.innerHTML = '<i class="fas fa-plus"></i> 새 공지사항 등록';
        addBtn.setAttribute('onclick', "openNoticeModal('create')");
    } else if (tab === 'downloads') {
        tabTitle.innerText = '자료실 관리';
        addBtn.innerHTML = '<i class="fas fa-plus"></i> 새 자료 등록';
        addBtn.setAttribute('onclick', "openDownloadModal('create')");
    } else if (tab === 'products') {
        tabTitle.innerText = '제품 관리';
        addBtn.innerHTML = '<i class="fas fa-plus"></i> 새 제품 등록';
        addBtn.setAttribute('onclick', "enterProductEdit()");
    } else if (tab === 'users') {
        tabTitle.innerText = '회원 정보 관리';
        addBtn.style.display = 'none';
    }

    fetchTabValues();
};

const fetchTabValues = () => {
    if (currentTab === 'reviews') {
        fetchAdminReviews();
    } else if (currentTab === 'notices') {
        fetchAdminNotices();
    } else if (currentTab === 'downloads') {
        fetchAdminDownloads();
    } else if (currentTab === 'products') {
        fetchAdminProducts();
    } else if (currentTab === 'users') {
        fetchAdminUsers();
    }
};

// 날짜 포맷 통일 헬퍼 함수 (YYYY-MM-DD)
const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const dateStrStr = dateStr.toString().trim();
    if (dateStrStr.includes('.') || dateStrStr.includes('-')) {
        return dateStrStr.replace(/\./g, '-');
    }
    const clean = dateStrStr.replace(/[^0-9]/g, '');
    if (clean.length === 8) {
        return `${clean.substring(0, 4)}-${clean.substring(4, 6)}-${clean.substring(6, 8)}`;
    }
    return dateStrStr;
};

// 로그아웃 처리
const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
        const res = await fetch('/api/logout', { method: 'POST' });
        if (res.ok) location.href = 'index.html';
    }
};

// 폼 작성 임시저장 (LocalStorage Auto-Save Engine)
const initFormAutoSave = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return;

    const storageKey = `admin_draft_${formId}`;

    // 1. 입력 감지하여 실시간 저장
    form.addEventListener('input', () => {
        const formData = new FormData(form);
        const data = {};
        for (let [key, val] of formData.entries()) {
            if (val instanceof File) continue; // 파일은 저장 제외
            data[key] = val;
        }
        localStorage.setItem(storageKey, JSON.stringify(data));
    });

    // 2. 임시저장 복원 안내 배너 생성 및 표출
    const checkAndShowRestoreBanner = () => {
        const saved = localStorage.getItem(storageKey);
        if (!saved) return;
        if (form.querySelector('.restore-banner')) return;

        const banner = document.createElement('div');
        banner.className = 'restore-banner';
        banner.style.cssText = `
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #166534;
            padding: 12px 16px;
            border-radius: 10px;
            margin-bottom: 18px;
            font-size: 0.9rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            box-shadow: 0 4px 10px rgba(34, 197, 94, 0.05);
        `;
        banner.innerHTML = `
            <span>📝 작성 중이던 임시 저장본이 있습니다.</span>
            <div style="display: flex; gap: 8px;">
                <button type="button" class="restore-load-btn" style="background:#22c55e; color:white; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; font-weight:700;">불러오기</button>
                <button type="button" class="restore-discard-btn" style="background:#f1f5f9; color:#475569; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; font-weight:700;">지우기</button>
            </div>
        `;

        form.insertBefore(banner, form.firstChild);

        banner.querySelector('.restore-load-btn').addEventListener('click', () => {
            try {
                const data = JSON.parse(saved);
                Object.keys(data).forEach(key => {
                    const field = form.elements[key];
                    if (field) field.value = data[key];
                });
                alert('임시 저장된 내용이 복원되었습니다.');
                banner.remove();
            } catch (e) {
                console.error('드래프트 복원 실패', e);
            }
        });

        banner.querySelector('.restore-discard-btn').addEventListener('click', () => {
            localStorage.removeItem(storageKey);
            banner.remove();
        });
    };

    // 폼 성공 제출 시 저장 내역 삭제
    form.addEventListener('submit', () => {
        localStorage.removeItem(storageKey);
        const banner = form.querySelector('.restore-banner');
        if (banner) banner.remove();
    });

    return {
        check: checkAndShowRestoreBanner,
        clear: () => {
            localStorage.removeItem(storageKey);
            const banner = form.querySelector('.restore-banner');
            if (banner) banner.remove();
        }
    };
};

// 각 폼별 임시저장 바인더 등록
window.drafts = {};
const formsToTrack = [
    'createForm', 'editForm', 'createNoticeForm', 'editNoticeForm', 
    'createDownloadForm', 'editDownloadForm', 'createProductForm', 'editProductForm'
];
formsToTrack.forEach(id => {
    window.drafts[id] = initFormAutoSave(id);
});

// 초기화 실행
window.addEventListener('DOMContentLoaded', () => {
    checkAdminSession();
    if (typeof fetchAdminReviews === 'function') {
        fetchAdminReviews();
    }
});
