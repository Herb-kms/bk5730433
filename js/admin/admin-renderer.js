/**
 * @file js/admin/admin-renderer.js
 * @description 복사기마트 관리자 모드 도메인별 데이터 테이블 동적 렌더러
 */

// 테이블 동적 렌더러
const renderTable = () => {
    const list = document.getElementById('adminReviewList');
    const header = document.getElementById('tableHeader');
    const noData = document.getElementById('noDataMsg');
    const table = document.getElementById('adminTable');

    let data = [];
    if (currentTab === 'reviews') data = currentReviews;
    else if (currentTab === 'notices') data = currentNotices;
    else if (currentTab === 'downloads') data = currentDownloads;
    else if (currentTab === 'products') data = currentProducts;
    else if (currentTab === 'users') data = currentUsers;

    if (!data || data.length === 0) {
        table.style.display = 'none';
        noData.style.display = 'block';
        return;
    }

    table.style.display = 'table';
    noData.style.display = 'none';

    if (currentTab === 'reviews') {
        header.innerHTML = `
            <th>이미지</th>
            <th>카테고리</th>
            <th>제목</th>
            <th>작성자</th>
            <th>날짜</th>
            <th>관리</th>
        `;
        list.innerHTML = data.map(r => {
            const brandNames = {
                canon: '캐논',
                minolta: '미놀타',
                samsung: '삼성',
                shindo: '신도'
            };
            const brandLabel = brandNames[r.category] || r.category;
            return `
                <tr>
                    <td><img src="${r.image_url || 'hero.png'}" alt="thumb"></td>
                    <td><span class="brand-badge ${r.category}">${brandLabel}</span></td>
                    <td style="font-weight: 700; color: #1e293b;">${r.title}</td>
                    <td style="color: #64748b;">${r.author}</td>
                    <td style="color: #64748b; font-size: 0.9rem;">${formatDate(r.date)}</td>
                    <td>
                        <button class="edit-btn" onclick="openEditModal(${r.id})"><i class="fas fa-edit"></i> 수정</button>
                        <button onclick="deleteData(${r.id})" class="delete-btn"><i class="fas fa-trash-alt"></i> 삭제</button>
                    </td>
                </tr>
            `;
        }).join('');
    } else if (currentTab === 'notices') {
        header.innerHTML = `
            <th>번호</th>
            <th>구분</th>
            <th>제목</th>
            <th>날짜</th>
            <th>관리</th>
        `;
        list.innerHTML = data.map((n, idx) => {
            const isPinned = n.is_pinned === 1;
            const numText = isPinned ? '<span class="brand-badge shindo">공지</span>' : (data.length - idx);
            
            const badgeClasses = {
                notice: 'brand-badge samsung',
                event: 'brand-badge minolta',
                info: 'brand-badge canon'
            };
            const badgeLabels = {
                notice: '중요',
                event: '이벤트',
                info: '안내'
            };
            const badgeClass = badgeClasses[n.type] || 'brand-badge canon';
            const badgeLabel = badgeLabels[n.type] || '안내';

            return `
                <tr>
                    <td style="font-weight: 700; color: #64748b; font-size: 0.95rem;">${numText}</td>
                    <td><span class="${badgeClass}">${badgeLabel}</span></td>
                    <td style="font-weight: 700; color: #1e293b;">${n.title}</td>
                    <td style="color: #64748b; font-size: 0.9rem;">${formatDate(n.date)}</td>
                    <td>
                        <button class="edit-btn" onclick="openNoticeModal('edit', ${n.id})"><i class="fas fa-edit"></i> 수정</button>
                        <button onclick="deleteNotice(${n.id})" class="delete-btn"><i class="fas fa-trash-alt"></i> 삭제</button>
                    </td>
                </tr>
            `;
        }).join('');
    } else if (currentTab === 'downloads') {
        header.innerHTML = `
            <th>번호</th>
            <th>자료 제목</th>
            <th>상세 설명</th>
            <th>파일명</th>
            <th>등록일</th>
            <th>관리</th>
        `;
        list.innerHTML = data.map((d, idx) => {
            return `
                <tr>
                    <td style="font-weight: 700; color: #64748b; font-size: 0.95rem;">${data.length - idx}</td>
                    <td style="font-weight: 700; color: #1e293b;">${d.title}</td>
                    <td style="color: #64748b; font-size: 0.9rem; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${d.description || '-'}</td>
                    <td style="color: #3b82f6; font-size: 0.9rem; font-weight: 600;"><i class="fas fa-paperclip"></i> ${d.file_name}</td>
                    <td style="color: #64748b; font-size: 0.9rem;">${formatDate(d.date)}</td>
                    <td>
                        <button class="edit-btn" onclick="openDownloadModal('edit', ${d.id})"><i class="fas fa-edit"></i> 수정</button>
                        <button onclick="deleteDownload(${d.id})" class="delete-btn"><i class="fas fa-trash-alt"></i> 삭제</button>
                    </td>
                </tr>
            `;
        }).join('');
    } else if (currentTab === 'products') {
        header.innerHTML = `
            <th>이미지</th>
            <th>구분</th>
            <th>카테고리</th>
            <th>브랜드</th>
            <th>제품명</th>
            <th>가격</th>
            <th>등록일</th>
            <th>관리</th>
        `;
        list.innerHTML = data.map(p => {
            const typeLabels = { rental: '임대', sales: '판매' };
            const catLabels = { color: '컬러', mono: '흑백', inkjet: '잉크젯', laser: '레이저' };
            const brandLabels = { samsung: '삼성', canon: '캐논', sindoh: '신도리코', minolta: '미놀타', hp: 'HP' };
            
            const typeLabel = typeLabels[p.type] || p.type;
            const catLabel = catLabels[p.category] || p.category;
            const brandLabel = brandLabels[p.brand] || p.brand;
            const priceText = p.price.toLocaleString() + (p.type === 'rental' ? ' 원/월' : ' 원');

            return `
                <tr>
                    <td><img src="${p.image_url || 'hero.png'}" alt="thumb" style="width: 50px; height: 50px; object-fit: contain;"></td>
                    <td><span class="brand-badge ${p.type === 'rental' ? 'samsung' : 'minolta'}">${typeLabel}</span></td>
                    <td><span class="brand-badge shindo">${catLabel}</span></td>
                    <td><span class="brand-badge canon">${brandLabel}</span></td>
                    <td style="font-weight: 700;"><a href="product-detail.html?id=${p.id}" target="_blank" style="color: #2563eb; text-decoration: none; border-bottom: 1px dashed #2563eb;">${p.name}</a></td>
                    <td style="color: #1e293b; font-weight: 600;">${priceText}</td>
                    <td style="color: #64748b; font-size: 0.9rem;">${formatDate(p.date)}</td>
                    <td>
                        <button class="edit-btn" onclick="enterProductEdit(${p.id})"><i class="fas fa-edit"></i> 수정</button>
                        <button onclick="deleteProduct(${p.id})" class="delete-btn"><i class="fas fa-trash-alt"></i> 삭제</button>
                    </td>
                </tr>
            `;
        }).join('');
    } else if (currentTab === 'users') {
        header.innerHTML = `
            <th>번호</th>
            <th>회원구분</th>
            <th>성명</th>
            <th>아이디</th>
            <th>거래처/업체명</th>
            <th>가입일</th>
            <th>관리</th>
        `;
        list.innerHTML = data.map((u, idx) => {
            const gradeLabels = { admin: '관리자', business: '업체 회원', personal: '개인 회원' };
            const gradeBadgeClasses = { admin: 'canon', business: 'samsung', personal: 'minolta' };
            const gradeLabel = gradeLabels[u.user_type] || u.user_type;
            const badgeClass = gradeBadgeClasses[u.user_type] || 'canon';

            return `
                <tr>
                    <td style="font-weight: 700; color: #64748b; font-size: 0.95rem;">${data.length - idx}</td>
                    <td><span class="brand-badge ${badgeClass}">${gradeLabel}</span></td>
                    <td style="font-weight: 700; color: #1e293b;">${u.real_name || '-'}</td>
                    <td style="color: #475569; font-weight: 600;">${u.username}</td>
                    <td style="color: #64748b;">${u.company_name || '-'}</td>
                    <td style="color: #64748b; font-size: 0.9rem;">${formatDate(u.signup_date)}</td>
                    <td>
                        ${u.username === 'admin' ? 
                            '<span style="color: #94a3b8; font-size: 0.85rem; font-weight: 600; padding: 4px 10px; background: #f1f5f9; border-radius: 6px;"><i class="fas fa-shield-alt"></i> 보호됨</span>' : 
                            '<button class="edit-btn" onclick="openUserEditModal(' + u.id + ')"><i class="fas fa-edit"></i> 수정</button>' +
                            '<button onclick="deleteUser(' + u.id + ')" class="delete-btn"><i class="fas fa-trash-alt"></i> 삭제</button>'
                        }
                    </td>
                </tr>
            `;
        }).join('');
    }
};
