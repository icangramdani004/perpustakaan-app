function toggleMenu(){
  document.getElementById("menu").classList.toggle("show");
}

async function register(){
  const user={
    nama:regNama.value,
    nim:regNim.value,
    username:regUsername.value,
    password:regPassword.value
  };

  if(!user.nama||!user.nim||!user.username||!user.password){
    alert("Lengkapi data");
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    const data = await response.json();
    
    if (!response.ok) {
      alert(data.error || "Registrasi gagal");
      return;
    }

    alert("Pendaftaran berhasil!");
    location.href="index.html";
  } catch (error) {
    console.error("Register error:", error);
    alert("Error: " + error.message);
  }
}

async function login(){
  const u=username.value;
  const p=password.value;

  try {
    const response = await fetch('http://localhost:3000/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });

    const data = await response.json();
    
    if (!response.ok) {
      alert(data.error || "Login gagal");
      return;
    }

    const user = data.user;
    localStorage.setItem("login","true");
    localStorage.setItem("user_id", user.id);
    localStorage.setItem("username", user.username);
    localStorage.setItem("nama", user.nama);
    location.href="dashboard.html";
  } catch (error) {
    console.error("Login error:", error);
    alert("Error: " + error.message);
  }
}

function checkLogin(){
  if(!localStorage.getItem("login")){
    location.href="index.html";
  }
}

function logout(){
  localStorage.removeItem("login");
  localStorage.removeItem("user_id");
  localStorage.removeItem("username");
  localStorage.removeItem("nama");
  location.href="index.html";
}

// ===== ADMIN AUTHENTICATION =====


function checkAdminLogin(){
  if (!localStorage.getItem('admin_login')) {
    location.href = 'login-admin.html';
  }
}

function adminLogout(){
  localStorage.removeItem('admin_login');
  localStorage.removeItem('admin_user');
  location.href = 'index.html';
}
