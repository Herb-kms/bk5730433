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

const defaultFallbackNotices = [
    {
        id: 1,
        title: '2026년 하반기 신규 캐논·미놀타 무한복합기 라인업 출시 안내',
        content: '안녕하세요. 복사기마트입니다.\n\n고객 여러분께 더 높은 출력 품질과 안정적인 임대 서비스를 제공하기 위해 2026년 하반기 최신 A3 컬러/흑백 무한복합기 라인업이 신규 입고되었습니다.\n자세한 기종별 임대 비용과 혜택은 상단 카테고리 메뉴 및 고객센터 상담을 통해 확인하실 수 있습니다.\n\n감사합니다.',
        type: 'notice',
        is_pinned: 1,
        date: '2026.07.01'
    },
    {
        id: 2,
        title: '신규 렌탈 고객 대상 첫 달 임대료 50% 할인 및 정품 소모품 지원 이벤트',
        content: '신규 기업 및 사무실 오픈을 기념하여 신규 렌탈 계약 시 첫 달 임대료를 50% 지원해 드립니다.\n추가로 계약 기간 내 정품 토너 무제한 지급 및 무상 AS를 보장해 드립니다. 많은 관심 부탁드립니다!',
        type: 'event',
        is_pinned: 1,
        date: '2026.06.15'
    },
    {
        id: 3,
        title: '여름철 복합기 용지 걸림 및 습기 관리 예방법 안내',
        content: '여름철 장마 및 고온다습한 날씨로 인해 용지함 내부 복사지가 습기를 머금어 용지 걸림(Jam) 현상이 발생할 수 있습니다.\n용지는 습기가 닿지 않는 건조한 곳에 보관해 주시고, 퇴근 시 용지함을 닫아 두시기를 권장합니다. 문제가 발생하면 언제든 실시간 원격 지원을 요청해 주세요.',
        type: 'info',
        is_pinned: 0,
        date: '2026.06.02'
    },
    {
        id: 4,
        title: '복사기마트 정기 A/S 방문 점검 안내 (경기/서울/인천권)',
        content: '복사기마트는 렌탈 기기의 최상의 상태를 유지하기 위해 매월 정기 순회 점검 및 클리닝 작업을 실시하고 있습니다.\n담당 기사가 방문 일정 전 사전 연락을 드린 후 찾아뵐 예정이오니 참고 부탁드립니다.',
        type: 'info',
        is_pinned: 0,
        date: '2026.05.18'
    },
    {
        id: 5,
        title: '공식 홈페이지 리뉴얼 오픈 안내',
        content: '고객님들이 빠르고 편리하게 실시간 견적과 제품 라인업을 확인하실 수 있도록 복사기마트 공식 홈페이지가 전면 리뉴얼되었습니다.\n앞으로도 최고의 서비스로 보답하겠습니다. 감사합니다.',
        type: 'info',
        is_pinned: 0,
        date: '2026.05.01'
    }
];

export async function initNoticePage() {
    const noticeTbody = document.getElementById('noticeTbody');
    if (!noticeTbody) return;

    // 초기 상태 리셋
    currentPage = 1;
    allNotices = [];
    filteredNotices = [];

    // 1. 공지사항 데이터 API 로드 및 폴백 처리
    try {
        const res = await fetch('/api/notices');
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                allNotices = data;
            } else {
                allNotices = defaultFallbackNotices;
            }
        } else {
            allNotices = defaultFallbackNotices;
        }
    } catch (err) {
        console.warn('API 로드 장애 - 기본 공지사항 폴백 서빙:', err);
        allNotices = defaultFallbackNotices;
    }

    filteredNotices = [...allNotices];
    
    // 2. 검색창 이벤트 바인딩
    const searchInput = document.getElementById('noticeSearchInput');
    if (searchInput) {
        searchInput.removeEventListener('input', handleSearch);
        searchInput.addEventListener('input', handleSearch);
        searchInput.value = '';
    }

    // 3. 최초 렌더링
    renderNotices();
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
