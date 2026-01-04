function toggleMenu(){
  document.getElementById("menu").classList.toggle("show");
}

function register(){
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

  let users=JSON.parse(localStorage.getItem("users"))||[];
  if(users.find(u=>u.username===user.username)){
    alert("Username sudah ada");
    return;
  }

  users.push(user);
  localStorage.setItem("users",JSON.stringify(users));
  alert("Pendaftaran berhasil");
  location.href="index.html";
}

function login(){
  const u=username.value;
  const p=password.value;
  const users=JSON.parse(localStorage.getItem("users"))||[];

  const ok=users.find(x=>x.username===u && x.password===p);
  if(!ok){alert("Login gagal");return;}

  localStorage.setItem("login","true");
  location.href="dashboard.html";
}

function checkLogin(){
  if(!localStorage.getItem("login")){
    location.href="index.html";
  }
}

function logout(){
  localStorage.removeItem("login");
  location.href="index.html";
}
