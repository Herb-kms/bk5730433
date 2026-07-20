/**
 * @file js/myinfo.js
 * @description 내 정보 조회 및 관리자 API를 통한 회원 정보 수정 처리 스크립트
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 회원 세션 조회 및 노출
    async function loadUserProfile() {
        try {
            const res = await fetch('/api/session');
            const session = await res.json();
            
            if (!session.loggedIn) {
                alert('로그인이 필요한 페이지입니다.');
                location.href = 'login.html';
                return;
            }
            
            const u = session.user;
            const grade = u.user_type === 'admin' ? '관리자 계정' : (u.user_type === 'business' ? '업체 회원' : '개인 회원');
            
            const displayUsername = document.getElementById('displayUsername');
            const displayUserType = document.getElementById('displayUserType');
            const infoUsername = document.getElementById('infoUsername');
            const infoRealName = document.getElementById('infoRealName');
            const infoCompanyName = document.getElementById('infoCompanyName');
            const infoUserType = document.getElementById('infoUserType');

            if (displayUsername) displayUsername.innerText = u.real_name || u.username;
            if (displayUserType) displayUserType.innerText = grade;
            
            if (infoUsername) infoUsername.innerText = u.username;
            if (infoRealName) infoRealName.innerText = u.real_name || '-';
            if (infoCompanyName) infoCompanyName.innerText = u.company_name || '-';
            if (infoUserType) infoUserType.innerText = grade;
        } catch (err) {
            console.error('프로필 로딩 오류:', err);
        }
    }

    await loadUserProfile();

    // 이름 수정
    const changeNameBtn = document.getElementById('changeNameBtn');
    if (changeNameBtn) {
        changeNameBtn.addEventListener('click', async () => {
            const infoRealName = document.getElementById('infoRealName');
            const currentName = infoRealName ? infoRealName.innerText : '';
            const newName = prompt('변경할 이름을 입력하세요:', currentName);
            if (newName === null) return;
            if (!newName.trim()) {
                alert('이름을 입력해야 합니다.');
                return;
            }

            try {
                const res = await fetch('/api/users/me', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ real_name: newName.trim() })
                });
                const data = await res.json();
                if (res.ok) {
                    alert(data.message);
                    location.reload();
                } else {
                    alert(data.error || '수정 중 오류가 발생했습니다.');
                }
            } catch (err) {
                alert('서버 연결 오류');
            }
        });
    }

    // 거래처명 수정
    const changeCompanyBtn = document.getElementById('changeCompanyBtn');
    if (changeCompanyBtn) {
        changeCompanyBtn.addEventListener('click', async () => {
            const infoCompanyName = document.getElementById('infoCompanyName');
            const currentCompany = infoCompanyName ? infoCompanyName.innerText : '';
            const newCompany = prompt('변경할 거래처/업체명을 입력하세요:', currentCompany === '-' ? '' : currentCompany);
            if (newCompany === null) return;

            try {
                const res = await fetch('/api/users/me', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ company_name: newCompany.trim() })
                });
                const data = await res.json();
                if (res.ok) {
                    alert(data.message);
                    location.reload();
                } else {
                    alert(data.error || '수정 중 오류가 발생했습니다.');
                }
            } catch (err) {
                alert('서버 연결 오류');
            }
        });