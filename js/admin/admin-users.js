/**
 * @file js/admin/admin-users.js
 * @description 복사기마트 관리자 모드 회원정보 CRUD 비즈니스 로직 제어 스크립트
 */

// 회원 목록 fetch
const fetchAdminUsers = async () => {
    const loading = document.getElementById('loadingMsg');
    const noData = document.getElementById('noDataMsg');
    const table = document.getElementById('adminTable');

    loading.style.display = 'block';
    noData.style.display = 'none';
    table.style.display = 'none';

    try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('불러오기 오류');

        const data = await response.json();
        currentUsers = data;

        document.getElementById('tabTitle').setAttribute('data-count', currentUsers.length);
        renderTable();
    } catch (err) {
        console.error(err);
        noData.innerText = '회원 목록을 불러오는데 실패했습니다.';
        noData.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
};

// 회원 정보 수정 모달 제어
const openUserEditModal = (id) => {
    const user = currentUsers.find(u => u.id === id);
    if (!user) return;

    const modal = document.getElementById('editUserModal');
    const form = document.getElementById('editUserForm');

    form.id.value = user.id;
    form.username.value = user.username;
    form.password.value = ''; // 비밀번호는 항상 비워둠
    form.real_name.value = user.real_name || '';
    form.company_name.value = user.company_name || '';
    form.user_type.value = user.user_type;

    modal.style.display = 'flex';
};

const closeUserModal = () => {
    document.getElementById('editUserModal').style.display = 'none';
};

// 회원 삭제
const deleteUser = async (id) => {
    if (!confirm('정말로 이 회원을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.')) return;
    try {
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
        if (res.ok) {
            alert('회원이 삭제되었습니다.');
            fetchAdminUsers();
        } else {
            const data = await res.json();
            alert(data.error || '삭제 실패');
        }
    } catch (err) {
        console.error(err);
        alert('네트워크 오류');
    }
};

// 회원 수정 폼 submit 핸들러 등록
const editUserForm = document.getElementById('editUserForm');
if (editUserForm) {
    editUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = editUserForm.id.value;
        const username = editUserForm.username.value;
        const password = editUserForm.password.value;
        const real_name = editUserForm.real_name.value;
        const company_name = editUserForm.company_name.value;
        const user_type = editUserForm.user_type.value;

        const bodyData = { username, real_name, company_name, user_type };
        if (password && password.trim() !== '') {
            bodyData.password = password;
        }

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            const data = await res.json();
            if (res.ok) {
                alert('회원 정보가 성공적으로 수정되었습니다.');
                closeUserModal();
                fetchAdminUsers();
            } else {
                alert(data.error || '수정 실패');
            }
        } catch (err) {
            console.error(err);
            alert('서버 전송 중 에러가 발생했습니다.');
        }
    });
}
