/**
 * @file js/modules/notice.js
 * @description 데이터베이스 기반 공지사항 동적 렌더링, 클라이언트 사이드 실시간 검색 및 페이지네이션 제어 모듈
 */

let allNotices = [];
let filteredNotices = [];
let currentPage = 1;
const itemsPerPage = 5;

// 전역 아코디언 핸들러 등록 (SPA 리소스 유실에 따른 ReferenceError 방어막 완료)
window.toggleNoticeDetail = function(id) {
    const detailRow = document.getElementById(`noticeDetail-${id}`);
    if (detailRow) {
        if (detailRow.style.display === 'none') {
            detailRow.style.display = 'table-row';
        } else {
            detailRow.style.display = 'none';
        }
    }
};

export async function initNoticePage() {
    const noticeTbody = document.getElementById('noticeTbody');
    if (!noticeTbody) return;

    // 초기 상태 리셋
    currentPage = 1;
    allNotices = [];
    filteredNotices = [];

    // 1. 공지사항 데이터 API 로드
    try {
        const res = await fetch('/api/notices');
        if (!res.ok) throw new Error('공지사항 로드 실패');
        allNotices = await res.json();
        filteredNotices = [...allNotices];
        
        // 2. 검색창 이벤트 바인딩
        const searchInput = document.getElementById('noticeSearchInput');
        if (searchInput) {
            // 리스너 중복 바인딩 방지
            searchInput.removeEventListener('input', handleSearch);
            searchInput.addEventListener('input', handleSearch);
            searchInput.value = ''; // 초기화
        }

        // 3. 최초 렌더링
        renderNotices();

    } catch (err) {
        console.error('공지사항 로드 중 오류:', err);
        noticeTbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 40px; color: #ef4444;">
                    공지사항을 불러오는 도중 오류가 발생했습니다.
                </td>
            </tr>
        `;
    }
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
        filteredNotices = [...allNotices];
    } else {
        filteredNotices = allNotices.filter(n => 
            n.title.toLowerCase().includes(query) || 
            n.content.toLowerCase().includes(query)
        );
    }
    currentPage = 1; // 검색 시 항상 첫 페이지로 복귀
    renderNotices();
}

function renderNotices() {
    const tbody = document.getElementById('noticeTbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // 1. 중요 공지(is_pinned === 1) 상단 최우선 고정 렌더링 (페이지네이션과 무관하게 상단에 항상 상주)
    const pinnedNotices = filteredNotices.filter(n => n.is_pinned === 1);
    const regularNotices = filteredNotices.filter(n => n.is_pinned !== 1);

    if (filteredNotices.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 50px; color: #6b7280; font-weight: 600;">
                    검색 조건에 일치하는 공지사항이 없습니다.
                </td>
            </tr>
        `;
        renderPagination(0);
        return;
    }

    // 중요 고정 공지사항 먼저 렌더링
    pinnedNotices.forEach(n => {
        tbody.appendChild(createNoticeRow(n, true));
        tbody.appendChild(createDetailRow(n));
    });

    // 2. 일반 공지만 현재 페이지 범위에 맞추어 페이징 슬라이스 실행
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRegulars = regularNotices.slice(startIndex, endIndex);

    paginatedRegulars.forEach(n => {
        tbody.appendChild(createNoticeRow(n, false));
        tbody.appendChild(createDetailRow(n));
    });

    // 3. 페이지네이션 컨트롤 그리기 (일반 공지사항 개수 기반 계산)
    renderPagination(regularNotices.length);
}

function createNoticeRow(n, isPinned) {
    const tr = document.createElement('tr');
    tr.setAttribute('onclick', `toggleNoticeDetail(${n.id})`);
    
    let badgeClass = 'badge-info';
    let badgeText = '안내';
    if (n.type === 'notice') {
        badgeClass = 'badge-notice';
        badgeText = '공지';
    } else if (n.type === 'event') {
        badgeClass = 'badge-event';
        badgeText = '이벤트';
    }

    tr.innerHTML = `
        <td class="notice-num ${isPinned ? 'pinned' : ''}">
            ${isPinned ? '<i class="fas fa-bullhorn"></i> 공지' : n.id}
        </td>
        <td class="notice-title">
            <span class="notice-badge ${badgeClass}">${badgeText}</span>
            ${n.title}
        </td>
        <td class="notice-date">${n.date || '2026.07.07'}</td>
    `;
    return tr;
}

function createDetailRow(n) {
    const tr = document.createElement('tr');
    tr.id = `noticeDetail-${n.id}`;
    tr.style.display = 'none';
    tr.style.background = '#f8fafc';
    
    // 개행 문자 처리
    const formattedContent = n.content.replace(/\n/g, '<br>');

    tr.innerHTML = `
        <td colspan="3">
            <div class="notice-detail-content">
                ${formattedContent}
            </div>
        </td>
    `;
    return tr;
}

function renderPagination(totalItems) {
    const container = document.getElementById('noticePagination');
    if (!container) return;

    container.innerHTML = '';
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return; // 1페이지 이하면 컨트롤러 숨김

    // 1) 이전 페이지 버튼
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pag-btn prev';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = (currentPage === 1);
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderNotices();
            window.scrollTo({ top: 300, behavior: 'smooth' });
        }
    });
    container.appendChild(prevBtn);

    // 2) 숫자 버튼들
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `pag-btn num ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.addEventListener('click', () => {
            currentPage = i;
            renderNotices();
            window.scrollTo({ top: 300, behavior: 'smooth' });
        });
        container.appendChild(btn);
    }

    // 3) 다음 페이지 버튼
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pag-btn next';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = (currentPage === totalPages);
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderNotices();
            window.scrollTo({ top: 300, behavior: 'smooth' });
        }
    });
    container.appendChild(nextBtn);
}
