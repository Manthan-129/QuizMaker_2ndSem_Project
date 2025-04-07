document.addEventListener("DOMContentLoaded", () => {
    // Check if user is already logged in
    const userId = localStorage.getItem("userId");
    if (userId && window.location.pathname.includes("login.html") || 
        userId && window.location.pathname.includes("signup.html")) {
        window.location.href = "dashboard.html";
        return;
    }

    const crtAccount = document.getElementById('create-Account')
    const lgAccount = document.getElementById('login-Account')

    if(crtAccount) {
        crtAccount.addEventListener("click", () => window.location.href = "signup.html");
    }
    if(lgAccount) {
        lgAccount.addEventListener("click", () => window.location.href = "login.html");
    }

    const btnLogin = document.getElementById('proceed-login')
    const btnSign = document.getElementById('proceed-signup')

    if(btnLogin) {
        btnLogin.addEventListener("click", async () => {
            try {
                const Username = document.getElementById('Username').value.trim();
                const Pass = document.getElementById('Password').value.trim();

                if(!Username) {
                    alert(`Please Enter your UserName first`)
                    return;
                }
                if(!Pass) {
                    alert(`Please Enter your Password`)
                    return
                }

                const response = await axios.post('http://localhost:5000/login', {
                    username: Username, 
                    password: Pass
                });
                
                alert(response.data.message);
                
                if(response.status === 200) {
                    // Store user info in localStorage
                    localStorage.setItem("userId", response.data.userId);
                    localStorage.setItem("username", Username);
                    window.location.href = "dashboard.html";
                }
            }
            catch(error) {
                alert(error.response.data.error);
                return
            }
        });
    }

    if(btnSign) {
        btnSign.addEventListener("click", async () => {
            try {
                const userName = document.getElementById('username').value.trim();
                const password = document.getElementById('password1').value.trim();
                const cnfPass = document.getElementById('password2').value.trim();

                if(!userName) {
                    alert(`Please Enter your UserName first`)
                    return;
                }
                if(!password) {
                    alert(`Please Enter your Password`)
                    return
                }
                if(password !== cnfPass) {
                    alert(`Your password and confirm password is not matching. Please check your Password.`)
                    return
                }

                const response = await axios.post('http://localhost:5000/signup', {
                    username: userName, 
                    password: password
                });
                
                alert(response.data.message);
                
                if(response.status === 200) {
                    // Store user info in localStorage
                    localStorage.setItem("userId", response.data.userId);
                    localStorage.setItem("username", userName);
                    window.location.href = "dashboard.html";
                }
            }
            catch(error) {
                alert(error.response.data.error);
                return
            }
        });
    }
});