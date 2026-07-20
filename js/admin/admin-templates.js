/**
 * @file js/admin/admin-templates.js
 * @description admin.html 본문을 가볍게 만들기 위해 모달 마크업들을 완전히 추출해 보관하는 템플릿 파일
 */

window.ADMIN_MODAL_TEMPLATES = `
    <!-- 등록 모달 -->
    <div id="createModal" class="admin-modal">
        <div class="admin-modal-content">
            <h2>새 설치후기 등록</h2>
            <form id="createForm">
                <div class="form-group">
                    <label>카테고리</label>
                    <select name="category" required>
                        <option value="samsung">삼성</option>
                        <option value="canon">캐논</option>
                        <option value="shindo">신도</option>
                        <option value="minolta">미놀타</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>제목</label>
                    <input type="text" name="title" required placeholder="예: [설치완료] 강남구 사무실 삼성 복사기 대여 후기">
                </div>
                <div class="form-group">
                    <label>작성자</label>
                    <input type="text" name="author" required placeholder="예: 복사기마트">
                </div>
                <div class="form-group">
                    <label>내용</label>
                    <textarea name="content" rows="5" required placeholder="설치 기종 및 상세한 후기 내용을 입력하세요."></textarea>
                </div>
                <div class="form-group">
                    <label>사진 등록</label>
                    <input type="file" name="image" id="createImageInput" accept="image/*" style="display: none;">
                    <div class="image-upload-wrapper" onclick="document.getElementById('createImageInput').click()">
                        <div id="createImagePreview" class="image-preview-box">
                            <i class="fas fa-camera"></i>
                            <span>사진 파일 선택하기</span>
                        </div>
                    </div>
                </div>
                <div class="modal-btns">
                    <button type="submit" class="save-btn">등록 완료</button>
                    <button type="button" class="cancel-btn" onclick="closeCreateModal()">취소</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 수정 모달 -->
    <div id="editModal" class="admin-modal">
        <div class="admin-modal-content">
            <h2>후기 수정</h2>
            <form id="editForm">
                <input type="hidden" name="id">
                <div class="form-group">
                    <label>카테고리</label>
                    <select name="category" required>
                        <option value="canon">캐논</option>
                        <option value="minolta">미놀타</option>
                        <option value="samsung">삼성</option>
                        <option value="shindo">신도</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>제목</label>
                    <input type="text" name="title" required>
                </div>
                <div class="form-group">
                    <label>작성자</label>
                    <input type="text" name="author" required>
                </div>
                <div class="form-group">
                    <label>내용</label>
                    <textarea name="content" rows="5" required
                        style="width: 100%; border-radius: 4px; padding: 10px; border: 1px solid #ddd;"></textarea>
                </div>
                <div class="form-group">
                    <label>사진 변경</label>
                    <input type="file" name="image" id="editImageInput" accept="image/*" style="display: none;">
                    <div class="image-upload-wrapper" onclick="document.getElementById('editImageInput').click()">
                        <div id="editImagePreview" class="image-preview-box">
                            <i class="fas fa-camera"></i>
                            <span>사진 변경하기</span>
                        </div>
                    </div>
                </div>
                <div class="modal-btns">
                    <button type="submit" class="save-btn">저장</button>
                    <button type="button" class="cancel-btn" onclick="closeEditModal()">취소</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 공지사항 등록 모달 -->
    <div id="createNoticeModal" class="admin-modal">
        <div class="admin-modal-content">
            <h2>새 공지사항 등록</h2>
            <form id="createNoticeForm">
                <div class="form-group">
                    <label>구분</label>
                    <select name="type" required>
                        <option value="info">안내</option>
                        <option value="notice">중요</option>
                        <option value="event">이벤트</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>상단 고정 여부</label>
                    <select name="is_pinned" required>
                        <option value="0">일반 공지</option>
                        <option value="1">상단 고정 공지</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>제목</label>
                    <input type="text" name="title" required placeholder="공지사항 제목을 입력하세요.">
                </div>
                <div class="form-group">
                    <label>내용</label>
                    <textarea name="content" rows="6" required placeholder="공지사항 세부 내용을 입력하세요."></textarea>
                </div>
                <div class="modal-btns">
                    <button type="submit" class="save-btn">등록 완료</button>
                    <button type="button" class="cancel-btn" onclick="closeNoticeModal('create')">취소</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 공지사항 수정 모달 -->
    <div id="editNoticeModal" class="admin-modal">
        <div class="admin-modal-content">
            <h2>공지사항 수정</h2>
            <form id="editNoticeForm">
                <input type="hidden" name="id">
                <div class="form-group">
                    <label>구분</label>
                    <select name="type" required>
                        <option value="info">안내</option>
                        <option value="notice">중요</option>
                        <option value="event">이벤트</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>상단 고정 여부</label>
                    <select name="is_pinned" required>
                        <option value="0">일반 공지</option>
                        <option value="1">상단 고정 공지</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>제목</label>
                    <input type="text" name="title" required>
                </div>
                <div class="form-group">
                    <label>내용</label>
                    <textarea name="content" rows="6" required></textarea>
                </div>
                <div class="modal-btns">
                    <button type="submit" class="save-btn">수정 완료</button>
                    <button type="button" class="cancel-btn" onclick="closeNoticeModal('edit')">취소</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 자료실 등록 모달 -->
    <div id="createDownloadModal" class="admin-modal">
        <div class="admin-modal-content">
            <h2>새 자료 등록</h2>
            <form id="createDownloadForm">
                <div class="form-group">
                    <label>제목</label>
                    <input type="text" name="title" required placeholder="예: [드라이버] 캐논 C3520 통합 프린터 드라이버">
                </div>
                <div class="form-group">
                    <label>상세 설명</label>
                    <textarea name="description" rows="3" placeholder="자료 설명 또는 지원 기종 등을 입력하세요."></textarea>
                </div>
                <div class="form-group">
                    <label>파일 첨부</label>
                    <input type="file" name="file" required>
                </div>
                <div class="modal-btns">
                    <button type="submit" class="save-btn">등록 완료</button>
                    <button type="button" class="cancel-btn" onclick="closeDownloadModal('create')">취소</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 자료실 수정 모달 -->
    <div id="editDownloadModal" class="admin-modal">
        <div class="admin-modal-content">
            <h2>자료 정보 수정</h2>
            <form id="editDownloadForm">
                <input type="hidden" name="id">
                <div class="form-group">
                    <label>제목</label>
                    <input type="text" name="title" required>
                </div>
                <div class="form-group">
                    <label>상세 설명</label>
                    <textarea name="description" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>파일 변경 (변경 시에만 선택)</label>
                    <input type="file" name="file">
                </div>
                <div class="modal-btns">
                    <button type="submit" class="save-btn">수정 완료</button>
                    <button type="button" class="cancel-btn" onclick="closeDownloadModal('edit')">취소</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 제품 등록 모달 -->
    <div id="createProductModal" class="admin-modal visual-modal">
        <div class="admin-modal-content visual-modal-content">
            <h2>새 제품 등록</h2>
            <div class="visual-editor-layout">
                <!-- 왼쪽: 입력 폼 -->
                <form id="createProductForm" class="visual-form">
                    <div class="form-group">
                        <label>구분</label>
                        <select name="type" required>
                            <option value="rental">임대 제품</option>
                            <option value="sales">판매 제품</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>카테고리</label>
                        <select name="category" required>
                            <option value="color">컬러복합기</option>
                            <option value="mono">흑백복합기</option>
                            <option value="inkjet">잉크젯복합기</option>
                            <option value="laser">레이저복합기</option>
                            <option value="etc">기타제품</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>브랜드</label>
                        <select name="brand" required>
                            <option value="canon">캐논</option>
                            <option value="minolta">미놀타</option>
                            <option value="samsung">삼성</option>
                            <option value="sindoh">신도리코</option>
                            <option value="hp">HP</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>제품명</label>
                        <input type="text" name="name" required placeholder="예: imageRUNNER C3222">
                    </div>
                    <div class="form-group">
                        <label>가격 (원)</label>
                        <input type="number" name="price" required placeholder="예: 80000">
                    </div>
                    <div class="form-group">
                        <label>뱃지 텍스트</label>
                        <input type="text" name="badge" placeholder="예: Canon · A3 컬러">
                    </div>
                    <div class="form-group">
                        <label>상세 설명</label>
                        <textarea name="description" rows="3" placeholder="제품의 상세 설명을 입력하세요."></textarea>
                    </div>
                    <div class="form-group">
                        <label>스펙 (쉼표로 구분)</label>
                        <input type="text" name="specs" placeholder="예: 22ppm,1200dpi,A3 출력 지원">
                    </div>
                    <div class="form-group">
                        <label>네이버 톡톡 링크</label>
                        <input type="text" name="naver_talk" placeholder="예: http://talk.naver.com/WCHMKR">
                    </div>
                    <div class="form-group">
                        <label>카카오톡 링크</label>
                        <input type="text" name="kakao_talk" placeholder="예: https://open.kakao.com/o/sSzFO2O">
                    </div>
                    <div class="form-group">
                        <label>제품 사진 <span style="color:#64748b; font-weight:400; font-size:0.8rem;">(상세페이지 1번 사진 / 목록 카드에도 노출)</span></label>
                        <input type="file" name="image" id="createProductImageInput" accept="image/*" style="display: none;">
                        <div class="image-upload-wrapper" onclick="document.getElementById('createProductImageInput').click()">
                            <div id="createProductImagePreview" class="image-preview-box">
                                <i class="fas fa-camera"></i>
                                <span>사진 파일 선택하기</span>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>상세페이지 2번 사진 <span style="color:#64748b; font-weight:400; font-size:0.8rem;">(선택사항)</span></label>
                        <input type="file" name="image2" id="createProductImageInput2" accept="image/*" style="display: none;">
                        <div class="image-upload-wrapper" onclick="document.getElementById('createProductImageInput2').click()">
                            <div id="createProductImagePreview2" class="image-preview-box">
                                <i class="fas fa-camera"></i>
                                <span>2번 사진 선택하기</span>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>상세페이지 3번 사진 <span style="color:#64748b; font-weight:400; font-size:0.8rem;">(선택사항)</span></label>
                        <input type="file" name="image3" id="createProductImageInput3" accept="image/*" style="display: none;">
                        <div class="image-upload-wrapper" onclick="document.getElementById('createProductImageInput3').click()">
                            <div id="createProductImagePreview3" class="image-preview-box">
                                <i class="fas fa-camera"></i>
                                <span>3번 사진 선택하기</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-btns">
                        <button type="submit" class="save-btn">등록 완료</button>
                        <button type="button" class="cancel-btn" onclick="closeProductModal('create')">취소</button>
                    </div>
                </form>

                <!-- 오른쪽: 홈페이지 노출 프리뷰 -->
                <div class="visual-preview-area">
                    <div class="preview-tabs">
                        <button type="button" class="preview-tab-btn active" data-target="createProductCardPreviewPane">노출 프리뷰 1 (목록 카드)</button>
                        <button type="button" class="preview-tab-btn" data-target="createProductDetailPreviewPane">노출 프리뷰 2 (상세페이지)</button>
                    </div>
                    <div class="preview-field-legend" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; padding:10px 14px; background:#f8fafc; border-radius:10px; border:1px solid #e2e8f0;">
                        <span style="font-size:0.75rem; font-weight:700; color:#475569;"><i class="fas fa-eye" style="margin-right:4px;"></i>입력값이 반영되는 위치:</span>
                        <span class="field-tag" style="background:#dbeafe;color:#1d4ed8;">🖼️ 제품 사진</span>
                        <span class="field-tag" style="background:#fef9c3;color:#92400e;">🏷️ 브랜드</span>
                        <span class="field-tag" style="background:#dcfce7;color:#166534;">📝 제품명</span>
                        <span class="field-tag" style="background:#ffe4e6;color:#9f1239;">💰 가격</span>
                        <span class="field-tag" style="background:#f3e8ff;color:#7e22ce;">🔖 뱃지</span>
                        <span class="field-tag" style="background:#ffedd5;color:#9a3412;">📄 상세설명 (프리뷰2)</span>
                    </div>
                    <div class="preview-content-container">
                        <!-- 프리뷰 1: 카드형 -->
                        <div class="preview-pane" id="createProductCardPreviewPane" style="display: block;">
                            <div class="preview-card-container">
                                <div class="prod-card" id="createProductCardPreview">
                                    <div class="card-img-wrap">
                                        <img src="/img/standing_color_copier.PNG" alt="preview" id="createPreviewImg">
                                    </div>
                                    <div class="card-body">
                                        <div class="card-brand-logo-area" id="createPreviewLogo">
                                            <img src="img/logo_canon.svg" alt="Canon" class="brand-logo-img brand-canon">
                                        </div>
                                        <div class="card-name" id="createPreviewName">제품명</div>
                                        <div class="card-price-row">
                                            <div class="origin-price">
                                                <i class="fas fa-shopping-cart"></i>
                                                <span id="createPreviewPrice">0 원 / 월</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- 프리뷰1 필드 주석 표 -->
                            <div class="preview-annotation-table">
                                <div class="anno-row"><span class="anno-tag" style="background:#dbeafe;color:#1d4ed8;">🖼️ 제품 사진</span><span class="anno-arrow">←</span><span class="anno-label">좌측 입력폼 ‘제품 사진’ 필드에 반영</span></div>
                                <div class="anno-row"><span class="anno-tag" style="background:#fef9c3;color:#92400e;">🏷️ 브랜드 로고</span><span class="anno-arrow">←</span><span class="anno-label">‘브랜드’ 선택 시 자동 로고 표시</span></div>
                                <div class="anno-row"><span class="anno-tag" style="background:#dcfce7;color:#166534;">📝 제품명</span><span class="anno-arrow">←</span><span class="anno-label">‘제품명’ 입력 시 실시간 반영</span></div>
                                <div class="anno-row"><span class="anno-tag" style="background:#ffe4e6;color:#9f1239;">💰 가격</span><span class="anno-arrow">←</span><span class="anno-label">'가격 (원)' 입력 시 실시간 반영</span></div>
                            </div>
                        </div>
                        <!-- 프리뷰 2: 상세페이지형 -->
                        <div class="preview-pane detail-preview-card-pane" id="createProductDetailPreviewPane" style="display: none; background: #f8fafc; padding: 25px; border-radius: 16px; width: 100%; border: 1px solid #e2e8f0; text-align: left;">
                            <div class="product-detail-page notice-page" style="padding: 0; min-height: auto; background: transparent;">
                                <div class="container" style="max-width: 100%; padding: 0;">
                                    
                                    <!-- 상단 브레드크럼 (Breadcrumb) -->
                                    <div class="detail-breadcrumb" style="margin-bottom: 20px; font-size: 0.85rem;">
                                        <a><i class="fas fa-home"></i> 홈</a>
                                        <i class="fas fa-chevron-right"></i>
                                        <a id="createMiniBreadcrumbType" style="color: #475569;">임대제품</a>
                                        <i class="fas fa-chevron-right"></i>
                                        <span id="createMiniBreadcrumbName" class="active" style="font-weight: 700; color: #0f172a;">제품명</span>
                                    </div>

                                    <!-- 제품 메인 정보 섹션 -->
                                    <div class="detail-main-layout" style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 30px; align-items: start;">
                                        
                                        <!-- 좌측: 이미지 및 주석 라벨 -->
                                        <div class="detail-visual-column" style="padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; background: #ffffff; display: flex; flex-direction: column; align-items: center; gap: 15px;">
                                            <div class="main-image-box" style="width: 100%; height: 220px; display: flex; justify-content: center; align-items: center; overflow: hidden; background: #ffffff; border-radius: 8px; position:relative;">
                                                <img id="createMiniImg" src="/img/standing_color_copier.PNG" alt="제품 이미지" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                                                <img id="createMiniImg2" src="/img/standing_color_copier.PNG" alt="2번 사진" style="max-width: 100%; max-height: 100%; object-fit: contain; display:none; position:absolute;">
                                                <img id="createMiniImg3" src="/img/standing_color_copier.PNG" alt="3번 사진" style="max-width: 100%; max-height: 100%; object-fit: contain; display:none; position:absolute;">
                                            </div>
                                            <div class="thumbnail-selector" style="display: flex; gap: 8px;">
                                                <span class="create-thumb-btn thumb-btn-active" data-idx="1" onclick="switchCreateThumb(1)" style="font-size: 0.75rem; padding: 4px 10px; border: 1px solid #3b82f6; color: #3b82f6; border-radius: 6px; background: #eff6ff; font-weight: 700; cursor: pointer;">1번 사진</span>
                                                <span class="create-thumb-btn" data-idx="2" onclick="switchCreateThumb(2)" style="font-size: 0.75rem; padding: 4px 10px; border: 1px solid #e2e8f0; color: #64748b; border-radius: 6px; background: #ffffff; font-weight: 700; cursor: pointer;">2번 사진</span>
                                                <span class="create-thumb-btn" data-idx="3" onclick="switchCreateThumb(3)" style="font-size: 0.75rem; padding: 4px 10px; border: 1px solid #e2e8f0; color: #64748b; border-radius: 6px; background: #ffffff; font-weight: 700; cursor: pointer;">3번 사진</span>
                                            </div>
                                            <!-- 프리뷰2 주석 표 -->
                                            <div class="preview-annotation-table" style="max-width:100%; width:100%;">
                                                <div class="anno-row"><span class="anno-tag" style="background:#dbeafe;color:#1d4ed8;">1번</span><span class="anno-arrow">←</span><span class="anno-label">'제품 사진' 필드 (목록카드에도 노출)</span></div>
                                                <div class="anno-row"><span class="anno-tag" style="background:#dbeafe;color:#1d4ed8;">2번</span><span class="anno-arrow">←</span><span class="anno-label">'2번 사진' 필드</span></div>
                                                <div class="anno-row"><span class="anno-tag" style="background:#dbeafe;color:#1d4ed8;">3번</span><span class="anno-arrow">←</span><span class="anno-label">'3번 사진' 필드</span></div>
                                            </div>
                                        </div>

                                        <!-- 우측: 기본 정보 & 견적/상담 보드 -->
                                        <div class="detail-info-column" style="display: flex; flex-direction: column; gap: 15px;">
                                            <div class="info-header" style="display: flex; flex-direction: column; gap: 8px;">
                                                <div style="position:relative; display:inline-block;">
                                                    <span id="createMiniBadge" class="info-badge" style="background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; border: 1px solid #dbeafe;">로딩 중</span>
                                                </div>
                                                <h2 id="createMiniName" class="info-title" style="font-size: 1.6rem; font-weight: 800; color: #0f172a; line-height: 1.3; margin: 5px 0;">제품명</h2>
                                                <p id="createMiniDesc" class="info-desc" style="color: #64748b; font-size: 0.9rem; line-height: 1.5;">제품 상세 설명</p>
                                                <!-- 프리뷰2 주석 표 - 우측 영역 -->
                                                <div class="preview-annotation-table" style="max-width:100%; width:100%; margin-top:8px;">
                                                    <div class="anno-row"><span class="anno-tag" style="background:#f3e8ff;color:#7e22ce;">🔖 뱃지</span><span class="anno-arrow">←</span><span class="anno-label">'뱃지 텍스트' 필드</span></div>
                                                    <div class="anno-row"><span class="anno-tag" style="background:#dcfce7;color:#166534;">📝 제품명</span><span class="anno-arrow">←</span><span class="anno-label">'제품명' 필드</span></div>
                                                    <div class="anno-row"><span class="anno-tag" style="background:#ffedd5;color:#9a3412;">📄 설명</span><span class="anno-arrow">←</span><span class="anno-label">'상세 설명' 필드</span></div>
                                                    <div class="anno-row"><span class="anno-tag" style="background:#ffe4e6;color:#9f1239;">💰 가격</span><span class="anno-arrow">←</span><span class="anno-label">'가격 (원)' 필드</span></div>
                                                </div>
                                            </div>

                                            <!-- 실시간 렌탈/구매 견적서 보드 -->
                                            <div class="quotation-simulator-card" style="background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.03); overflow: hidden;">
                                                <div class="sim-header" style="background: #f8fafc; padding: 15px 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
                                                    <span class="sim-title-label" style="font-weight: 700; color: #1e293b; font-size: 0.85rem;"><i class="fas fa-calculator" style="color: #3b82f6; margin-right: 6px;"></i> 실시간 맞춤 견적기</span>
                                                    <span class="sim-type-badge" id="createMiniSimType" style="background: #2563eb; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 700;">임대</span>
                                                </div>
                                                
                                                <div class="sim-options-body" style="padding: 20px; display: flex; flex-direction: column; gap: 15px;">
                                                    <div class="sim-option-row" style="display: flex; flex-direction: column; gap: 6px;">
                                                        <label style="font-size: 0.8rem; font-weight: 700; color: #475569;"><i class="fas fa-history" style="margin-right: 4px;"></i> 약정 기간</label>
                                                        <select class="sim-select" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.8rem; background: #ffffff; color: #0f172a;" disabled>
                                                            <option selected>36개월 (표준 약정, 기본금)</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <!-- 최종 금액 표시 -->
                                                <div class="sim-total-price-row" style="background: #f8fafc; padding: 15px 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
                                                    <span id="createMiniPriceLabel" style="font-weight: 700; color: #475569; font-size: 0.85rem;">예상 월 렌탈료</span>
                                                    <div class="price-value-box" style="display: flex; align-items: baseline; gap: 2px;">
                                                        <strong id="createMiniPrice" style="font-size: 1.5rem; font-weight: 900; color: #2563eb;">0</strong>
                                                        <span style="font-size: 0.85rem; font-weight: 700; color: #2563eb;">원</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- 하단: 상세 기기 성능 & 스펙 시트 -->
                                    <div class="detail-specs-section" style="margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 25px;">
                                        <h3 class="specs-section-title" style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;"><i class="fas fa-sliders-h" style="color: #3b82f6;"></i> 기기 세부 사양 정보</h3>
                                        <div class="spec-table-container" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
                                            <table class="spec-table dynamic-spec-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
                                                <thead>
                                                    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                                                        <th style="padding: 12px 16px; font-weight: 700; color: #475569; width: 30%;">구분 항목</th>
                                                        <th style="padding: 12px 16px; font-weight: 700; color: #475569;">제품 사양 세부 정보</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr style="border-bottom: 1px solid #f1f5f9;">
                                                        <td style="padding: 12px 16px; font-weight: 600; color: #475569;">기본 분류</td>
                                                        <td style="padding: 12px 16px; color: #0f172a;">A3/A4 다기능 오피스 복합기 라인업</td>
                                                    </tr>
                                                    <tr style="border-bottom: 1px solid #f1f5f9;">
                                                        <td style="padding: 12px 16px; font-weight: 600; color: #475569;">인쇄 속도</td>
                                                        <td id="createMiniSpecSpeed" style="padding: 12px 16px; color: #2563eb; font-weight: 700;">-</td>
                                                    </tr>
                                                    <tr style="border-bottom: 1px solid #f1f5f9;">
                                                        <td style="padding: 12px 16px; font-weight: 600; color: #475569;">인쇄 해상도</td>
                                                        <td id="createMiniSpecResolution" style="padding: 12px 16px; color: #0f172a;">-</td>
                                                    </tr>
                                                    <tr style="border-bottom: 1px solid #f1f5f9;">
                                                        <td style="padding: 12px 16px; font-weight: 600; color: #475569;">주요 지원 기능</td>
                                                        <td id="createMiniSpecFeature" style="padding: 12px 16px; color: #0f172a;">-</td>
                                                    </tr>
                                                    <tr style="border-bottom: 1px solid #f1f5f9;">
                                                        <td style="padding: 12px 16px; font-weight: 600; color: #475569;">지원 용지 규격</td>
                                                        <td style="padding: 12px 16px; color: #0f172a;">최대 A3 (A4, B4, A5 등 자동 급지 지원)</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 12px 16px; font-weight: 600; color: #475569;">유무선 네트워크</td>
                                                        <td style="padding: 12px 16px; color: #0f172a;">기본 탑재 (모바일 프린팅 및 LAN 연동 지원)</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 제품 수정 모달 -->
    <div id="editProductModal" class="admin-modal visual-modal">
        <div class="admin-modal-content visual-modal-content">
            <h2>제품 정보 수정</h2>
            <div class="visual-editor-layout">
                <!-- 왼쪽: 입력 폼 -->
                <form id="editProductForm" class="visual-form">
                    <input type="hidden" name="id">
                    <div class="form-group">
                        <label>구분</label>
                        <select name="type" required>
                            <option value="rental">임대 제품</option>
                            <option value="sales">판매 제품</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>카테고리</label>
                        <select name="category" required>
                            <option value="color">컬러복합기</option>
                            <option value="mono">흑백복합기</option>
                            <option value="inkjet">잉크젯복합기</option>
                            <option value="laser">레이저복합기</option>
                            <option value="etc">기타제품</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>브랜드</label>
                        <select name="brand" required>
                            <option value="canon">캐논</option>
                            <option value="minolta">미놀타</option>
                            <option value="samsung">삼성</option>
                            <option value="sindoh">신도리코</option>
                            <option value="hp">HP</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>제품명</label>
                        <input type="text" name="name" required placeholder="예: imageRUNNER C3222">
                    </div>
                    <div class="form-group">
                        <label>가격 (원)</label>
                        <input type="number" name="price" required placeholder="예: 80000">
                    </div>
                    <div class="form-group">
                        <label>뱃지 텍스트</label>
                        <input type="text" name="badge" placeholder="예: Canon · A3 컬러">
                    </div>
                    <div class="form-group">
                        <label>상세 설명</label>
                        <textarea name="description" rows="3" placeholder="제품의 상세 설명을 입력하세요."></textarea>
                    </div>
                    <div class="form-group">
                        <label>스펙 (쉼표로 구분)</label>
                        <input type="text" name="specs" placeholder="예: 22ppm,1200dpi,A3 출력 지원">
                    </div>
                    <div class="form-group">
                        <label>네이버 톡톡 링크</label>
                        <input type="text" name="naver_talk" placeholder="예: http://talk.naver.com/WCHMKR">
                    </div>
                    <div class="form-group">
                        <label>카카오톡 링크</label>
                        <input type="text" name="kakao_talk" placeholder="예: https://open.kakao.com/o/sSzFO2O">
                    </div>
                    <div class="form-group">
                        <label>제품 사진 <span style="color:#64748b; font-weight:400; font-size:0.8rem;">(상세페이지 1번 사진 / 목록 카드에도 노출)</span></label>
                        <input type="file" name="image" id="editProductImageInput" accept="image/*" style="display: none;">
                        <div class="image-upload-wrapper" onclick="document.getElementById('editProductImageInput').click()">
                            <div id="editProductImagePreview" class="image-preview-box">
                                <i class="fas fa-camera"></i>
                                <span>사진 파일 선택하기</span>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>상세페이지 2번 사진 <span style="color:#64748b; font-weight:400; font-size:0.8rem;">(선택사항)</span></label>
                        <input type="file" name="image2" id="editProductImageInput2" accept="image/*" style="display: none;">
                        <div class="image-upload-wrapper" onclick="document.getElementById('editProductImageInput2').click()">
                            <div id="editProductImagePreview2" class="image-preview-box">
                                <i class="fas fa-camera"></i>
                                <span>2번 사진 선택하기</span>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>상세페이지 3번 사진 <span style="color:#64748b; font-weight:400; font-size:0.8rem;">(선택사항)</span></label>
                        <input type="file" name="image3" id="editProductImageInput3" accept="image/*" style="display: none;">
                        <div class="image-upload-wrapper" onclick="document.getElementById('editProductImageInput3').click()">
                            <div id="editProductImagePreview3" class="image-preview-box">
                                <i class="fas fa-camera"></i>
                                <span>3번 사진 선택하기</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-btns">
                        <button type="submit" class="save-btn">수정 완료</button>
                        <button type="button" class="cancel-btn" onclick="closeProductModal('edit')">취소</button>
                    </div>
                </form>

                <!-- 오른쪽: 홈페이지 노출 프리뷰 -->
                <div class="visual-preview-area">
                    <div class="preview-tabs">
                        <button type="button" class="preview-tab-btn active" data-target="editProductCardPreviewPane">노출 프리뷰 1 (목록 카드)</button>
                        <button type="button" class="preview-tab-btn" data-target="editProductDetailPreviewPane">노출 프리뷰 2 (상세페이지)</button>
                    </div>
                    <div class="preview-content-container">
                        <!-- 프리뷰 1: 카드형 -->
                        <div class="preview-pane" id="editProductCardPreviewPane" style="display: block;">
                            <div class="preview-card-container">
                                <div class="prod-card" id="editProductCardPreview" style="pointer-events: none;">
                                    <div class="card-img-wrap">
                                        <img src="/img/standing_color_copier.PNG" alt="preview" id="editPreviewImg">
                                    </div>
                                    <div class="card-body">
                                        <div class="brand-logo-area" id="editPreviewLogo">
                                            <span class="brand-text-logo">CANON</span>
                                        </div>
                                        <h3 class="prod-title" id="editPreviewName">C3822</h3>
                                        <div class="prod-price" id="editPreviewPrice">80,000 원/월</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- 프리뷰 2: 상세페이지형 -->
                        <div class="preview-pane detail-preview-card-pane" id="editProductDetailPreviewPane" style="display: none; background: #f8fafc; padding: 25px; border-radius: 16px; width: 100%; border: 1px solid #e2e8f0; text-align: left;">
                            <div class="product-detail-page notice-page" style="padding: 0; min-height: auto; background: transparent;">
                                <div class="detail-container" style="max-width: 100%; padding: 0; grid-template-columns: 1fr; gap: 30px;">
                                    <div class="detail-left" style="display: flex; flex-direction: column; align-items: center;">
                                        <div class="detail-img-box" style="width: 100%; height: 260px; border-radius: 12px; padding: 15px; background: #ffffff; border: 1px solid #e2e8f0;">
                                            <img src="/img/standing_color_copier.PNG" alt="detail-main" id="editMiniImg" style="width: 100%; height: 100%; object-fit: contain; transform: scale(1.3); padding: 10px;">
                                        </div>
                                        <div class="thumbnail-gallery" style="margin-top: 15px; display: flex; gap: 8px;">
                                            <div class="thumb-btn edit-thumb-btn active" onclick="switchEditThumb(0)" style="width: 50px; height: 50px; border: 1.5px solid #2563eb; border-radius: 8px; overflow: hidden; background: #fff; cursor: pointer; padding: 2px;"><img src="/img/standing_color_copier.PNG" alt="thumb1" id="editMiniImg1" style="width: 100%; height: 100%; object-fit: contain;"></div>
                                            <div class="thumb-btn edit-thumb-btn" onclick="switchEditThumb(1)" style="width: 50px; height: 50px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #fff; cursor: pointer; padding: 2px;"><img src="/img/standing_color_copier.PNG" alt="thumb2" id="editMiniImg2" style="width: 100%; height: 100%; object-fit: contain;"></div>
                                            <div class="thumb-btn edit-thumb-btn" onclick="switchEditThumb(2)" style="width: 50px; height: 50px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #fff; cursor: pointer; padding: 2px;"><img src="/img/standing_color_copier.PNG" alt="thumb3" id="editMiniImg3" style="width: 100%; height: 100%; object-fit: contain;"></div>
                                        </div>
                                    </div>
                                    <div class="detail-right" style="width: 100%;">
                                        <span class="detail-badge" id="editMiniBadge" style="display: inline-block; padding: 4px 10px; background: #eff6ff; color: #2563eb; border-radius: 6px; font-weight: 700; font-size: 0.78rem; margin-bottom: 10px;">Canon · A3 컬러</span>
                                        <h1 class="detail-title" id="editMiniName" style="font-size: 1.6rem; color: #0f172a; margin-bottom: 12px; font-weight: 800; line-height: 1.2;">C3822</h1>
                                        <p class="detail-desc" id="editMiniDesc" style="font-size: 0.85rem; color: #64748b; line-height: 1.6; margin-bottom: 20px;">기기 설명 내용입니다.</p>
                                        <div class="spec-table-container" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                                            <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; background: #ffffff;">
                                                <tbody>
                                                    <tr style="border-bottom: 1px solid #e2e8f0;">
                                                        <td style="padding: 8px 12px; background: #f8fafc; font-weight: 700; color: #475569; width: 35%;">출력 속도</td>
                                                        <td id="editMiniSpecSpeed" style="padding: 8px 12px; color: #0f172a;">-</td>
                                                    </tr>
                                                    <tr style="border-bottom: 1px solid #e2e8f0;">
                                                        <td style="padding: 8px 12px; background: #f8fafc; font-weight: 700; color: #475569;">인쇄 해상도</td>
                                                        <td id="editMiniSpecResolution" style="padding: 8px 12px; color: #0f172a;">-</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 8px 12px; background: #f8fafc; font-weight: 700; color: #475569;">주요 사양</td>
                                                        <td id="editMiniSpecFeature" style="padding: 8px 12px; color: #0f172a;">-</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 회원 정보 수정 모달 (관리자용) -->
    <div id="editUserModal" class="admin-modal visual-modal" style="display: none; align-items: center; justify-content: center; z-index: 1000; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);">
        <div class="admin-modal-content visual-modal-content" style="max-width: 600px !important; max-height: 80vh; background: #ffffff; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; overflow: hidden; padding: 35px 40px !important;">
            <h2 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin-bottom: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;"><i class="fas fa-user-cog" style="color: #2563eb; margin-right: 8px;"></i> 회원 정보 수정</h2>
            <form id="editUserForm" style="display: flex; flex-direction: column; gap: 18px; overflow-y: auto; max-height: 60vh; padding-right: 5px;">
                <input type="hidden" name="id">
                <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 0.85rem; font-weight: 700; color: #475569;">아이디</label>
                    <input type="text" name="username" readonly style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.95rem; background: #e2e8f0; cursor: not-allowed; outline: none; color: #475569;" autocomplete="off">
                </div>
                <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 0.85rem; font-weight: 700; color: #475569;">비밀번호 (변경시에만 입력)</label>
                    <input type="password" name="password" placeholder="비밀번호 변경 시에만 새 비밀번호를 입력하세요" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.95rem; outline: none;">
                </div>
                <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 0.85rem; font-weight: 700; color: #475569;">회원 실명 <span style="color:#ef4444;">*</span></label>
                    <input type="text" name="real_name" required style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.95rem; outline: none;">
                </div>
                <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 0.85rem; font-weight: 700; color: #475569;">거래처 / 업체명</label>
                    <input type="text" name="company_name" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.95rem; outline: none;">
                </div>
                <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 0.85rem; font-weight: 700; color: #475569;">회원 구분 <span style="color:#ef4444;">*</span></label>
                    <select name="user_type" required style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.95rem; outline: none; background: #ffffff;">
                        <option value="personal">일반 사용자 (개인)</option>
                        <option value="business">업체 사용자 (사업자)</option>
                        <option value="admin">관리자</option>
                    </select>
                </div>
                <div class="modal-btns" style="display: flex; gap: 12px; margin-top: 20px;">
                    <button type="submit" class="save-btn" style="flex: 1; padding: 14px; background: #2563eb; color: #ffffff; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 0.95rem; transition: background 0.2s;">수정 완료</button>
                    <button type="button" class="cancel-btn" onclick="closeUserModal()" style="flex: 1; padding: 14px; background: #f1f5f9; color: #475569; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 0.95rem; transition: background 0.2s;">취소</button>
                </div>
            </form>
        </div>
    </div>
`;

document.body.insertAdjacentHTML('beforeend', window.ADMIN_MODAL_TEMPLATES);