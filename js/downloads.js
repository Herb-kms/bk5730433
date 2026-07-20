/**
 * @file js/downloads.js
 * @description 자료실 데이터 동적 로드, 클라이언트 사이드 페이지네이션 제어 스크립트
 */

document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('loadingMsg');
    const noData = document.getElementById('noDataMsg');
    const wrap = document.getElementById('downloadsWrap');
    const paginationContainer = document.getElementById('downloadPagination');

    let allDownloads = [];
    let currentPage = 1;
    const itemsPerPage = 5; // 한 페이지당 5개로 노출 제한하여 세로 800px 내로 최적화

    const renderDownloads = () => {
        if (!wrap) return;
        wrap.innerHTML = '';

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageItems = allDownloads.slice(startIndex, endIndex);

        wrap.innerHTML = pageItems.map(d => `
            <div class="download-card">
                <div class="download-info">
                    <div class="download-title">${d.title}</div>
                    <div class="download-desc">${d.description || '상세 설명이 없습니다.'}</div>
                    <div class="download-meta">
                        <span><i class="fas fa-file-alt"></i> ${d.file_name}</span>
                        <span><i class="far fa-calendar-alt"></i> ${d.date}</span>
                    </div>
                </div>
                <a href="${d.file_url}" class="btn-download-action" download="${d.file_name}">
                    <i class="fas fa-download"></i> 다운로드
                </a>
            </div>
        `).join('');

        renderPagination();
    };

    const renderPagination = () => {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(allDownloads.length / itemsPerPage);
        if (totalPages <= 1) return; // 1페이지 이하면 표시 안 함

        // 이전 페이지 버튼
        const prevBtn = document.createElement('button');
        prevBtn.className = `page-btn prev-btn ${currentPage === 1 ? 'disabled' : ''}`;
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderDownloads();
                window.scrollTo({ top: 300, behavior: 'smooth' });
            }
        });
        paginationContainer.appendChild(prevBtn);

        // 페이지 번호 버튼들
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${currentPage === i ? 'active' : ''}`;
            pageBtn.innerText = i;
            pageBtn.addEventListener('click', () => {
                if (currentPage !== i) {
                    currentPage = i;
                    renderDownloads();
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                }
            });
            paginationContainer.appendChild(pageBtn);
        }

        // 다음 페이지 버튼
        const nextBtn = document.createElement('button');
        nextBtn.className = `page-btn next-btn ${currentPage === totalPages ? 'disabled' : ''}`;
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderDownloads();
                window.scrollTo({ top: 300, behavior: 'smooth' });
            }
        });
        paginationContainer.appendChild(nextBtn);
    };

    try {
        const res = await fetch('/api/downloads');
        if (!res.ok) throw new Error('API 오류');
        
        allDownloads = await res.json();
        if (loading) loading.style.display = 'none';

        if (!allDownloads || allDownloads.length === 0) {
            if (noData) noData.style.display = 'block';
            return;
        }

        if (wrap) {
            wrap.style.display = 'block';
            renderDownloads();
        }

    } catch (err) {
        console.error(err);
        if (loading) loading.style.display = 'none';
        if (noData) {
            noData.innerText = '자료를 불러오는데 실패했습니다.';
            noData.style.display = 'block';
        }
    }
});
