/**
 * @file js/modules/reviews.js
 * @description 복사기마트 설치 후기 게시판 동적 데이터 로딩, 탭 전환 필터링, 상세 모달 및 글작성 폼 비동기 전송 제어 모듈
 */

export async function initReviewsPage() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;

    const categoryTabs = document.querySelectorAll('.review-filter .filter-btn');
    const writeBtn = document.getElementById('openWriteModalBtn');
    const writeModal = document.getElementById('writeReviewModal');
    const closeWriteModalBtn = document.getElementById('closeWriteModalBtn');
    const writeForm = document.getElementById('writeReviewForm');

    let currentCategory = 'all';

    // 1. 카테고리 탭 전환 및 로드
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            currentCategory = tab.getAttribute('data-filter');
            loadAndRenderReviews(currentCategory);
        });
    });

    // 2. 글작성 모달 여닫기 제어
    if (writeBtn && writeModal) {
        writeBtn.addEventListener('click', async () => {
            // 로그인 상태 확인 후 권한 없으면 차단
            const sessionRes = await fetch('/api/session');
            const sessionData = await sessionRes.json();
            if (!sessionData.loggedIn) {
                alert('후기 작성은 회원 로그인이 필요합니다.');
                window.location.href = 'login.html';
                return;
            }

            // 작성자 자동 셋업
            const authorInput = document.getElementById('writeAuthor');
            if (authorInput) {
                authorInput.value = sessionData.user.real_name || sessionData.user.username;
            }

            writeModal.style.display = 'flex';
            setTimeout(() => writeModal.classList.add('show'), 10);
            document.body.style.overflow = 'hidden';
        });
    }

    const closeWrite = () => {
        if (writeModal) {
            writeModal.classList.remove('show');
            setTimeout(() => writeModal.style.display = 'none', 300);
            document.body.style.overflow = '';
        }
    };

    if (closeWriteModalBtn) closeWriteModalBtn.addEventListener('click', closeWrite);
    window.addEventListener('click', (e) => {
        if (e.target === writeModal) closeWrite();
    });

    // 3. 비동기 폼 전송
    if (writeForm) {
        writeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(writeForm);

            try {
                const res = await fetch('/api/reviews', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (res.ok) {
                    alert('성공적으로 등록되었습니다!');
                    writeForm.reset();
                    closeWrite();
                    loadAndRenderReviews(currentCategory);
                } else {
                    alert(data.error || '등록 중 오류가 발생했습니다.');
                }
            } catch (err) {
                console.error('글 전송 에러:', err);
                alert('네트워크 에러가 발생했습니다.');
            }
        });
    }

    // 초도 데이터 로드
    loadAndRenderReviews('all');
}

async function loadAndRenderReviews(category) {
    const grid = document.getElementById('reviewsGrid');
    if (!grid) return;

    grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.7);">
            <i class="fas fa-spinner fa-spin" style="font-size: 2.5rem; margin-bottom: 15px; color: #3b82f6;"></i>
            <p style="font-size: 1.1rem; font-weight: 600;">설치 후기 목록을 조회하는 중입니다...</p>
        </div>
    `;

    try {
        const response = await fetch(`/api/reviews?category=${category}`);
        if (!response.ok) throw new Error('API 오류');
        const list = await response.json();

        if (list.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:50px; color:rgba(255,255,255,0.5);">
                    등록된 후기가 존재하지 않습니다.
                </div>
            `;
            return;
        }

        grid.innerHTML = list.map(item => {
            const categoryBadge = getCategoryBadge(item.category);
            const imageHtml = item.image_url 
                ? `<div class="img-wrap"><img src="${item.image_url}" alt="설치이미지"></div>` 
                : `<div class="img-wrap no-img"><i class="fas fa-camera"></i><span>설치완료</span></div>`;

            return `
                <div class="review-card" data-id="${item.id}">
                    ${imageHtml}
                    <div class="review-card-body">
                        <div class="review-card-meta">
                            <span class="category-badge ${item.category}">${categoryBadge}</span>
                            <span class="review-date">${item.date}</span>
                        </div>
                        <h3 class="review-card-title">${item.title}</h3>
                        <p class="review-card-summary">${item.content.substring(0, 70)}${item.content.length > 70 ? '...' : ''}</p>
                        <div class="review-author-row">
                            <i class="fas fa-user-circle"></i>
                            <span>${item.author} 고객님</span>
                        </div>
                    </div>
                    <div class="hidden-full-content" style="display:none;" data-full-desc="${item.content}"></div>
                </div>
            `;
        }).join('');

        // 상세 모달 바인딩
        bindDetailModalEvents(grid);

    } catch (err) {
        console.error('후기 로드 실패:', err);
        grid.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:50px; color:#ef4444;">
                후기를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.
            </div>
        `;
    }
}

function bindDetailModalEvents(grid) {
    const cards = grid.querySelectorAll('.review-card');
    const modal = document.getElementById('reviewDetailModal');
    const closeBtn = document.getElementById('closeReviewDetailModalBtn');
    if (!modal) return;

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('.review-card-title').textContent;
            const imgElement = card.querySelector('.img-wrap img');
            const img = imgElement ? imgElement.src : '';
            const meta = card.querySelector('.review-card-meta').innerHTML;
            const author = card.querySelector('.review-author-row span').textContent;
            const fullContent = card.querySelector('.hidden-full-content').getAttribute('data-full-desc');

            document.getElementById('modalReviewTitle').textContent = title;
            document.getElementById('modalReviewMeta').innerHTML = meta;
            document.getElementById('modalReviewAuthor').textContent = author;
            document.getElementById('modalReviewContent').innerHTML = fullContent.replace(/\n/g, '<br>');

            const modalImg = document.getElementById('modalReviewImg');
            if (img) {
                modalImg.style.display = 'block';
                modalImg.src = img;
            } else {
                modalImg.style.display = 'none';
            }

            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('show'), 10);
            document.body.style.overflow = 'hidden';
        });
    });

    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

function getCategoryBadge(cat) {
    if (cat === 'color') return '컬러복합기';
    if (cat === 'mono') return '흑백복합기';
    if (cat === 'inkjet') return '잉크젯프린터';
    if (cat === 'laser') return '레이저복합기';
    if (cat === 'samsung') return '삼성';
    if (cat === 'canon') return '캐논';
    if (cat === 'minolta') return '미놀타';
    if (cat === 'hp') return 'HP';
    if (cat === 'sindoh') return '신도리코';
    return '기타';
}

// 메인 페이지 최신 후기 3개 노출
export async function loadMainPageReviews() {
    const listContainer = document.getElementById('mainReviewsList');
    if (!listContainer) return;

    try {
        const response = await fetch('/api/reviews?category=all');
        const reviews = await response.json();
        const latest = reviews.slice(0, 3); // 최신 3개

        if (latest.length === 0) {
            listContainer.innerHTML = `<div class="no-reviews-placeholder">아직 등록된 후기가 없습니다.</div>`;
            return;
        }

        listContainer.innerHTML = latest.map(item => {
            const categoryBadge = getCategoryBadge(item.category);
            const imageHtml = item.image_url 
                ? `<div class="review-main-thumb"><img src="${item.image_url}" alt="설치후기"></div>` 
                : `<div class="review-main-thumb no-img"><i class="fas fa-camera"></i></div>`;

            return `
                <div class="review-item-mini" onclick="location.href='reviews.html'">
                    ${imageHtml}
                    <div class="review-item-mini-body">
                        <div class="meta-row">
                            <span class="cat-badge">${categoryBadge}</span>
                            <span class="date">${item.date}</span>
                        </div>
                        <h4 class="title">${item.title}</h4>
                        <p class="summary">${item.content.substring(0, 45)}${item.content.length > 45 ? '...' : ''}</p>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('메인화면 후기 로드 오류:', err);
    }
}
