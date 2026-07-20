/**
 * @file js/login.js
 * @description 로그인 및 회원가입 화면 이벤트 핸들링 및 유효성 검사 스크립트
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. 로그인 폼 전송 이벤트
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            const errorMsgEl = document.getElementById('loginErrorMsg');
            if (errorMsgEl) errorMsgEl.style.display = 'none';

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.user && result.user.user_type === 'admin') {
                        location.href = 'admin.html';
                    } else {
                        location.href = 'index.html';
                    }
                } else {
                    const err = await response.json();
                    if (errorMsgEl) {
                        errorMsgEl.innerText = err.error || '아이디와 비번이 잘못입력되었습니다';
                        errorMsgEl.style.display = 'block';
                    } else {
                        alert('아이디와 비번이 잘못입력되었습니다');
                    }
                }
            } catch (err) {
                if (errorMsgEl) {
                    errorMsgEl.innerText = '서버 연결 오류';
                    errorMsgEl.style.display = 'block';
                } else {
                    alert('서버 연결 오류');
                }
            }
        });
    }

    // 2. 회원가입/로그인 탭 전환 스크립트
    const tabs = document.querySelectorAll('.auth-tab');
    const areas = document.querySelectorAll('.auth-area');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            areas.forEach(a => a.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.getAttribute('data-target');
            const targetEl = document.getElementById(target);
            if (targetEl) targetEl.classList.add('active');
        });
    });

    // 3. 아이디 중복 확인 스크립트
    const checkUserBtn = document.getElementById('checkUserBtn');
    const usernameInput = document.getElementById('username');
    const userMsg = document.getElementById('userMsg');
    let isUsernameChecked = false;

    if (checkUserBtn && usernameInput) {
        checkUserBtn.addEventListener('click', async () => {
            const username = usernameInput.value.trim();
            if (!username) {
                alert('아이디를 입력해 주세요.');
                return;
            }
            const regExp = /^[a-z0-9]{4,16}$/;
            if (!regExp.test(username)) {
                if (userMsg) {
                    userMsg.style.color = '#ef4444';
                    userMsg.innerText = '형식에 맞지 않는 아이디입니다.';
                } else {
                    alert('4~16자의 영문 소문자, 숫자만 가능합니다.');
                }
                return;
            }

            try {
                const res = await fetch(`/api/check-username?username=${username}`);
                const result = await res.json();
                if (result.exists) {
                    if (userMsg) {
                        userMsg.style.color = '#ef4444';
                        userMsg.innerText = '이미 사용 중인 아이디입니다.';
                    } else {
                        alert('이미 사용 중인 아이디입니다.');
                    }
                    isUsernameChecked = false;
                } else {
                    if (userMsg) {
                        userMsg.style.color = '#10b981';
                        userMsg.innerText = '사용 가능한 아이디입니다.';
                    } else {
                        alert('사용 가능한 아이디입니다.');
                    }
                    isUsernameChecked = true;
                }
            } catch (err) {
                console.error(err);
                alert('중복 확인 중 서버 오류가 발생했습니다.');
            }
        });

        usernameInput.addEventListener('input', () => {
            isUsernameChecked = false;
            if (userMsg) userMsg.innerText = '';
        });
    }

    // 4. 회원가입 폼 제출 스크립트
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isUsernameChecked) {
                alert('아이디 중복 확인을 먼저 해주세요.');
                return;
            }

            const pw = document.getElementById('password').value;
            const confirmPw = document.getElementById('confirmPassword').value;
            if (pw !== confirmPw) {
                alert('비밀번호가 일치하지 않습니다.');
                return;
            }
            
            const pwRegExp = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,}$/;
            if (!pwRegExp.test(pw)) {
                alert('비밀번호는 8자 이상이며 특수문자를 1개 이상 포함해야 합니다.');
                return;
            }

            const formData = new FormData(signupForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const res = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();

                if (res.ok) {
                    alert('회원가입이 완료되었습니다! 로그인 해 주세요.');
                    if (tabs[0]) tabs[0].click();
                    signupForm.reset();
                    isUsernameChecked = false;
                    if (userMsg) userMsg.innerText = '';
                } else {
                    alert(result.error || '가입에 실패했습니다.');
                }
            } catch (err) {
                console.error(err);
                alert('서버 연결 오류');
            }
        });
    }
});
