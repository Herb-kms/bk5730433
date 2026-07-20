/**
 * @file js/modules/auth.js
 * @description 로그인 상태에 따른 헤더 내비게이션 바 동적 전환 및 사용자 정보 연동 모듈
 */

export async function checkSessionAndRenderHeader() {
    const authSection = document.getElementById('authSection');
    if (!authSection) return;

    try {
        const response = await fetch('/api/session');
        const data = await response.json();

        if (data.loggedIn) {
            const user = data.user;
            const displayName = user.real_name || user.username;
            const displayCompany = user.company_name ? ` (${user.company_name})` : '';

            // 로그인 상태 UI
            if (user.user_type === 'admin') {
                authSection.innerHTML = `
                    <div class="user-profile-wrap">
                        <span class="user-greeting-badge"><i class="fas fa-crown" style="color:#fbbf24;"></i> ${displayName} 관리자님</span>
                        <a href="admin.html" class="my-info-link-btn" title="대시보드"><i class="fas fa-tachometer-alt"></i> 대시보드</a>
                        <a href="myinfo.html" class="my-info-link-btn" title="정보수정"><i class="fas fa-user-edit"></i> 정보수정</a>
                        <button id="logoutBtn" class="admin-logout-btn"><i class="fas fa-sign-out-alt"></i> 로그아웃</button>
                    </div>
                `;
            } else {
                authSection.innerHTML = `
                    <div class="user-profile-wrap">
                        <span class="user-greeting-badge"><i class="fas fa-user"></i> ${displayName}님${displayCompany}</span>
                        <a href="myinfo.html" class="my-info-link-btn" title="정보수정"><i class="fas fa-user-edit"></i> 정보수정</a>
                        <button id="logoutBtn" class="admin-logout-btn"><i class="fas fa-sign-out-alt"></i> 로그아웃</button>
                    </div>
                `;
            }

            // 로그아웃 이벤트 위임
            document.getElementById('logoutBtn').addEventListener('click', async () => {
                const logoutRes = await fetch('/api/logout', { method: 'POST' });
                if (logoutRes.ok) {
                    alert('로그아웃 되었습니다.');
                    window.location.reload();
                } else {
                    alert('로그아웃 처리 중 오류가 발생했습니다.');
                }
            });

        } else {
            // 비로그인 상태 UI
            authSection.innerHTML = `
                <a href="login.html" class="admin-login-btn">
                    <i class="fas fa-sign-in-alt"></i> 로그인 / 회원가입
                </a>
            `;
        }
    } catch (err) {
        console.error('세션 확인 중 오류 발생:', err);
    }
}
