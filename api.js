/**
 * API INTEGRATION FILE
 * Connects frontend to backend API
 * Backend running at: http://localhost:3000
 */

const API_URL = 'http://localhost:3000/api';
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  timeout: 8000 // 8 seconds
};

// ============ API HELPER FUNCTIONS ============
async function fetchWithRetry(url, options = {}, retries = RETRY_CONFIG.maxRetries) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  };

  // Add timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RETRY_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Retry on network errors or timeout
    if (retries > 0 && (error.name === 'AbortError' || error.message.includes('Failed to fetch'))) {
      console.warn(`⚠️ Retry attempt ${RETRY_CONFIG.maxRetries - retries + 1}/${RETRY_CONFIG.maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelay));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

// ============ NOTIFICATION SYSTEM ============
function showNotification(message, type = 'info', duration = 4000) {
  // Create notification container if not exists
  if (!document.getElementById('notificationContainer')) {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    `;
    document.body.appendChild(container);
  }

  const notification = document.createElement('div');
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  const colors = {
    success: '#d4edda #c3e6cb #155724',
    error: '#f8d7da #f5c6cb #721c24',
    warning: '#fff3cd #ffeaa7 #856404',
    info: '#d1ecf1 #bee5eb #0c5460'
  };

  const [bg, border, text] = colors[type].split(' ');
  
  notification.style.cssText = `
    background: ${bg};
    border: 1px solid ${border};
    color: ${text};
    padding: 14px 16px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
    font-size: 14px;
  `;
  
  notification.innerHTML = `<span style="font-size: 18px;">${icons[type]}</span><span>${message}</span>`;
  
  document.getElementById('notificationContainer').appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// Add animation styles if not already present
if (!document.getElementById('notificationStyles')) {
  const style = document.createElement('style');
  style.id = 'notificationStyles';
  style.innerHTML = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(400px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(400px);
      }
    }
  `;
  document.head.appendChild(style);
}

// ============ DEBUG HELPER ============
function logAPI(method, endpoint, data = null) {
  console.log(`[API] ${method} ${API_URL}${endpoint}`, data || '');
}

// Test API connection on page load
document.addEventListener('DOMContentLoaded', function() {
  testAPIConnection();
});

async function testAPIConnection() {
  try {
    const response = await fetchWithRetry(`${API_URL}/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ [API] Backend connection OK');
      console.log('Server Status:', data);
      document.dispatchEvent(new Event('apiReady'));
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('❌ [API] Backend connection failed at ' + API_URL);
    console.error('Error:', error.message);
    console.warn('Make sure to start backend with: cd backend && npm start');
    
    // Show warning to user
    showNotification('⚠️ Server connection failed. Some features may not work properly.', 'warning', 5000);
  }
}

// ============ USER FUNCTIONS ============

/**
 * Register User
 */
async function registerAPI() {
  try {
    const user = {
      nama: document.getElementById('regNama')?.value,
      nim: document.getElementById('regNim')?.value,
      username: document.getElementById('regUsername')?.value,
      password: document.getElementById('regPassword')?.value
    };

    if (!user.nama || !user.nim || !user.username || !user.password) {
      showNotification('Lengkapi semua data!', 'warning');
      return;
    }

    if (user.username.length < 5) {
      showNotification('Username minimal 5 karakter', 'warning');
      return;
    }

    if (user.password.length < 8) {
      showNotification('Password minimal 8 karakter', 'warning');
      return;
    }

    const response = await fetchWithRetry(`${API_URL}/user/register`, {
      method: 'POST',
      body: JSON.stringify(user)
    });

    const result = await response.json();

    if (response.ok) {
      showNotification('✨ Pendaftaran berhasil! Silakan login.', 'success', 3000);
      setTimeout(() => {
        location.href = 'index.html';
      }, 1500);
    } else {
      showNotification(result.error || 'Pendaftaran gagal', 'error');
    }
  } catch (error) {
    console.error('❌ Register error:', error);
    showNotification('Koneksi ke server gagal. Pastikan backend running.', 'error', 5000);
  }
}

/**
 * Login User
 */
async function loginAPI() {
  try {
    const user = {
      username: document.getElementById('username')?.value,
      password: document.getElementById('password')?.value
    };

    if (!user.username || !user.password) {
      showNotification('Username dan password harus diisi!', 'warning');
      return;
    }

    const response = await fetchWithRetry(`${API_URL}/user/login`, {
      method: 'POST',
      body: JSON.stringify(user)
    });

    const result = await response.json();

    if (response.ok) {
      // Simpan token/user info ke localStorage dengan sync status
      localStorage.setItem('login', 'true');
      localStorage.setItem('user_id', result.user.id);
      localStorage.setItem('username', result.user.username);
      localStorage.setItem('nama', result.user.nama);
      localStorage.setItem('nim', result.user.nim);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('lastSync', new Date().toISOString());
      
      showNotification(`👋 Selamat datang, ${result.user.nama}!`, 'success', 2000);
      setTimeout(() => {
        location.href = 'dashboard.html';
      }, 1000);
    } else {
      showNotification(result.error || 'Login gagal', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotification('Koneksi ke server gagal. Pastikan backend running.', 'error', 5000);
  }
}

/**
 * Admin Login (via API)
 */
/**
 * Admin Login with Notification
 */
async function adminLoginWithNotification() {
  try {
    const user = {
      username: document.getElementById('adminUsername')?.value?.trim(),
      password: document.getElementById('adminPassword')?.value?.trim()
    };

    if (!user.username || !user.password) {
      showNotification('Username dan password harus diisi!', 'warning');
      return;
    }

    const response = await fetchWithRetry(`${API_URL}/user/login`, {
      method: 'POST',
      body: JSON.stringify(user)
    });

    const result = await response.json();

    if (response.ok && result.data.role === 'admin') {
      localStorage.setItem('admin_login', 'true');
      localStorage.setItem('admin_id', result.data.id);
      localStorage.setItem('admin_user', result.data.username);
      localStorage.setItem('admin_nama', result.data.nama);
      
      showNotification(`👋 Selamat datang, Admin ${result.data.nama}!`, 'success', 2000);
      setTimeout(() => {
        location.href = 'admin-dashboard.html';
      }, 1000);
    } else {
      showNotification('Username/password salah atau bukan akun admin!', 'error');
    }
  } catch (error) {
    console.error('Admin login error:', error);
    showNotification('Koneksi ke server gagal. Pastikan backend running.', 'error', 5000);
  }
}

async function adminLoginAPI() {
  try {
    const user = {
      username: document.getElementById('adminUsername')?.value,
      password: document.getElementById('adminPassword')?.value
    };

    if (!user.username || !user.password) {
      alert('Username dan password harus diisi!');
      return;
    }

    const response = await fetchWithRetry(`${API_URL}/user/login`, {
      method: 'POST',
      body: JSON.stringify(user)
    });

    const result = await response.json();

    if (response.ok && result.data.role === 'admin') {
      localStorage.setItem('admin_login', 'true');
      localStorage.setItem('admin_id', result.data.id);
      localStorage.setItem('admin_user', result.data.username);
      
      alert('Login admin berhasil!');

      location.href = 'admin-dashboard.html';
    } else {
      alert('Username/password admin salah atau bukan admin!');
    }
  } catch (error) {
    console.error('Admin login error:', error);
    alert('Koneksi ke server gagal!');
  }
}

function checkLogin() {
  if (!localStorage.getItem('login')) {
    location.href = 'index.html';
  }
}

function checkAdminLogin() {
  if (!localStorage.getItem('admin_login')) {
    location.href = 'login-admin.html';
  }
}

function logout() {
  localStorage.removeItem('login');
  localStorage.removeItem('user_id');
  localStorage.removeItem('username');
  localStorage.removeItem('nama');
  location.href = 'index.html';
}

function adminLogout() {
  localStorage.removeItem('admin_login');
  localStorage.removeItem('admin_id');
  localStorage.removeItem('admin_user');
  location.href = 'index.html';
}

// ============ BOOK FUNCTIONS ============

/**
 * Load All Books
 */
async function loadBukuAPI() {
  try {
    const response = await fetchWithRetry(`${API_URL}/buku`);
    const result = await response.json();

    if (response.ok && result.data) {
      return result.data;
    } else {
      console.error('Error loading books:', result.message);
      return [];
    }
  } catch (error) {
    console.error('Load books error:', error);
    showNotification('⚠️ Gagal memuat data buku', 'warning');
    return [];
  }
}

/**
 * Add Book (Admin)
 */
async function addBukuAPI() {
  try {
    const buku = {
      judul: document.getElementById('judul')?.value,
      pengarang: document.getElementById('pengarang')?.value,
      penerbit: document.getElementById('penerbit')?.value,
      tahun: parseInt(document.getElementById('tahun')?.value),
      isbn: document.getElementById('isbn')?.value,
      kategori: document.getElementById('kategori')?.value,
      stok: parseInt(document.getElementById('stok')?.value),
      deskripsi: document.getElementById('deskripsi')?.value
    };

    if (!buku.judul || !buku.pengarang || !buku.isbn) {
      alert('Judul, Pengarang, dan ISBN harus diisi!');
      return;
    }

    const response = await fetch(`${API_URL}/buku`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(buku)
    });

    const result = await response.json();

    if (response.ok) {
      alert('Buku berhasil ditambahkan!');
      document.getElementById('bukuForm')?.reset();
      loadAdminBuku(); // Refresh list
    } else {
      alert('Error: ' + (result.message || 'Gagal tambah buku'));
    }
  } catch (error) {
    console.error('Add book error:', error);
    alert('Koneksi ke server gagal!');
  }
}

/**
 * Update Book (Admin)
 */
async function updateBukuAPI(id) {
  try {
    const buku = {
      judul: document.getElementById('judul')?.value,
      pengarang: document.getElementById('pengarang')?.value,
      penerbit: document.getElementById('penerbit')?.value,
      tahun: parseInt(document.getElementById('tahun')?.value),
      isbn: document.getElementById('isbn')?.value,
      kategori: document.getElementById('kategori')?.value,
      stok: parseInt(document.getElementById('stok')?.value),
      deskripsi: document.getElementById('deskripsi')?.value
    };

    const response = await fetch(`${API_URL}/buku/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(buku)
    });

    const result = await response.json();

    if (response.ok) {
      alert('Buku berhasil diperbarui!');
      loadAdminBuku(); // Refresh list
    } else {
      alert('Error: ' + (result.message || 'Gagal update buku'));
    }
  } catch (error) {
    console.error('Update book error:', error);
    alert('Koneksi ke server gagal!');
  }
}

/**
 * Delete Book (Admin)
 */
async function deleteBukuAPI(id) {
  if (!confirm('Yakin hapus buku ini?')) return;

  try {
    const response = await fetch(`${API_URL}/buku/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (response.ok) {
      alert('Buku berhasil dihapus!');
      loadAdminBuku(); // Refresh list
    } else {
      alert('Error: ' + (result.message || 'Gagal hapus buku'));
    }
  } catch (error) {
    console.error('Delete book error:', error);
    alert('Koneksi ke server gagal!');
  }
}

/**
 * Search Books
 */
async function searchBukuAPI(keyword) {
  try {
    if (!keyword || keyword.trim() === '') {
      return await loadBukuAPI();
    }

    const response = await fetchWithRetry(`${API_URL}/buku/search/${encodeURIComponent(keyword)}`);
    const result = await response.json();

    if (response.ok && result.data) {
      return result.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Search error:', error);
    showNotification('⚠️ Gagal mencari buku', 'warning');
    return [];
  }
}

/**
 * Load Admin Book List
 */
async function loadAdminBuku() {
  try {
    const buku = await loadBukuAPI();
    const tbody = document.querySelector('table tbody');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (buku.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9">Tidak ada data</td></tr>';
      return;
    }

    buku.forEach(book => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${book.id}</td>
        <td>${book.judul}</td>
        <td>${book.pengarang}</td>
        <td>${book.penerbit}</td>
        <td>${book.tahun}</td>
        <td>${book.isbn}</td>
        <td>${book.kategori}</td>
        <td>${book.stok}</td>
        <td>
          <button onclick="editBuku(${book.id})">Edit</button>
          <button onclick="deleteBukuAPI(${book.id})">Hapus</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Load admin books error:', error);
  }
}

/**
 * Edit Book (Load data to form)
 */
async function editBuku(id) {
  try {
    const response = await fetch(`${API_URL}/buku/${id}`);
    const result = await response.json();

    if (response.ok && result.data) {
      const book = result.data;
      document.getElementById('judul').value = book.judul;
      document.getElementById('pengarang').value = book.pengarang;
      document.getElementById('penerbit').value = book.penerbit;
      document.getElementById('tahun').value = book.tahun;
      document.getElementById('isbn').value = book.isbn;
      document.getElementById('kategori').value = book.kategori;
      document.getElementById('stok').value = book.stok;
      document.getElementById('deskripsi').value = book.deskripsi;

      // Change form action
      const form = document.getElementById('bukuForm');
      form.onsubmit = (e) => {
        e.preventDefault();
        updateBukuAPI(id);
      };
    }
  } catch (error) {
    console.error('Edit book error:', error);
  }
}

// ============ BORROWING FUNCTIONS ============

/**
 * Borrow Book
 */
async function pinjamBukuAPI() {
  try {
    const user_id = localStorage.getItem('user_id');
    const buku_id = document.getElementById('buku_id')?.value;

    if (!user_id || !buku_id) {
      alert('Pilih buku yang ingin dipinjam!');
      return;
    }

    const pinjaman = {
      user_id: parseInt(user_id),
      buku_id: parseInt(buku_id),
      tgl_pinjam: new Date().toISOString().split('T')[0]
    };

    const response = await fetchWithRetry(`${API_URL}/peminjaman`, {
      method: 'POST',
      body: JSON.stringify(pinjaman)
    });

    const result = await response.json();

    if (response.ok) {
      alert('Buku berhasil dipinjam!');
      document.getElementById('peminjamanForm')?.reset();
      loadRiwayatPinjam();
    } else {
      alert('Error: ' + (result.message || 'Gagal pinjam buku'));
    }
  } catch (error) {
    console.error('Borrow error:', error);
    alert('Koneksi ke server gagal!');
  }
}

/**
 * Return Book
 */
async function kembaliBukuAPI(peminjamanId) {
  if (!confirm('Yakin kembalikan buku ini?')) return;

  try {
    const response = await fetch(`${API_URL}/peminjaman/${peminjamanId}/return`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tgl_kembali: new Date().toISOString().split('T')[0]
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert('Buku berhasil dikembalikan!');
      loadRiwayatPinjam();
    } else {
      alert('Error: ' + (result.message || 'Gagal kembalikan buku'));
    }
  } catch (error) {
    console.error('Return error:', error);
    alert('Koneksi ke server gagal!');
  }
}

/**
 * Load Borrowing History
 */
async function loadRiwayatPinjam() {
  try {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) return;

    const response = await fetchWithRetry(`${API_URL}/peminjaman/user/${user_id}`);
    const result = await response.json();

    if (response.ok && result.data) {
      const peminjaman = result.data;
      const tbody = document.querySelector('.riwayat-table tbody');

      if (!tbody) return;

      tbody.innerHTML = '';

      peminjaman.forEach(p => {
        const row = document.createElement('tr');
        const statusClass = p.status === 'Kembali' ? 'returned' : 'active';
        row.innerHTML = `
          <td>${p.id}</td>
          <td>${p.judul || p.buku_id}</td>
          <td>${p.tgl_pinjam}</td>
          <td>${p.tgl_kembali || '-'}</td>
          <td><span class="${statusClass}">${p.status}</span></td>
          <td>
            ${p.status === 'Dipinjam' ? `<button onclick="kembaliBukuAPI(${p.id})">Kembalikan</button>` : ''}
          </td>
        `;
        tbody.appendChild(row);
      });
    }
  } catch (error) {
    console.error('Load history error:', error);
  }
}

// ============ CATALOG FUNCTIONS ============

/**
 * Load Catalog (Member View)
 */
async function loadKatalogAPI() {
  try {
    const buku = await loadBukuAPI();
    const catalogDiv = document.getElementById('katalog-list');

    if (!catalogDiv) return;

    catalogDiv.innerHTML = '';

    if (buku.length === 0) {
      catalogDiv.innerHTML = '<p>Tidak ada buku tersedia</p>';
      return;
    }

    buku.forEach(book => {
      const card = document.createElement('div');
      card.className = 'buku-card';
      card.innerHTML = `
        <h3>${book.judul}</h3>
        <p><strong>Pengarang:</strong> ${book.pengarang}</p>
        <p><strong>Penerbit:</strong> ${book.penerbit}</p>
        <p><strong>Tahun:</strong> ${book.tahun}</p>
        <p><strong>Kategori:</strong> ${book.kategori}</p>
        <p><strong>Stok:</strong> ${book.stok}</p>
        <p>${book.deskripsi || ''}</p>
        ${book.stok > 0 ? `<button onclick="selectBuku(${book.id})">Pinjam</button>` : '<span class="no-stock">Stok Habis</span>'}
      `;
      catalogDiv.appendChild(card);
    });
  } catch (error) {
    console.error('Load catalog error:', error);
  }
}

/**
 * Select Book to Borrow
 */
function selectBuku(bukuId) {
  document.getElementById('buku_id').value = bukuId;
  document.getElementById('peminjamanForm').scrollIntoView({ behavior: 'smooth' });
}

// ============ PAGINATION & UI ============

function toggleMenu() {
  const menu = document.getElementById('menu');
  if (menu) {
    menu.classList.toggle('show');
  }
}

// ============ PROFILE & SYNC FUNCTIONS ============

/**
 * Load User Profile with Sync
 */
async function loadUserProfileAPI(userId) {
  try {
    const response = await fetch(`${API_URL}/user/${userId}`);
    const data = await response.json();

    if (response.ok) {
      // Update localStorage with synced data
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      localStorage.setItem('lastSync', new Date().toISOString());
      
      return data;
    } else {
      console.error('Error loading profile:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Profile load error:', error);
    return null;
  }
}

/**
 * Update User Profile
 */
async function updateUserProfileAPI(userId, profileData) {
  try {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });

    const data = await response.json();

    if (response.ok) {
      // Update localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updated));
      localStorage.setItem('lastSync', new Date().toISOString());
      
      return data;
    } else {
      console.error('Error updating profile:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return null;
  }
}

/**
 * Load User Riwayat/History
 */
async function loadUserRiwayatAPI(userId) {
  try {
    const response = await fetch(`${API_URL}/user/${userId}/riwayat`);
    const data = await response.json();

    if (response.ok) {
      // Cache in localStorage
      localStorage.setItem('riwayat', JSON.stringify(data));
      localStorage.setItem('riwayatSync', new Date().toISOString());
      
      return data;
    } else {
      console.error('Error loading riwayat:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Riwayat load error:', error);
    return [];
  }
}

/**
 * Get Synced Riwayat from Cache or API
 */
async function getRiwayatAPI(userId, forceRefresh = false) {
  const cached = localStorage.getItem('riwayat');
  const syncTime = localStorage.getItem('riwayatSync');
  const now = new Date().getTime();
  const syncAge = syncTime ? (now - new Date(syncTime).getTime()) / 1000 : 999999;
  
  // Refresh if older than 5 minutes or forced
  if (forceRefresh || !cached || syncAge > 300) {
    return await loadUserRiwayatAPI(userId);
  }
  
  return JSON.parse(cached);
}

/**
 * Sync All User Data
 */
async function syncUserDataAPI(userId) {
  try {
    const profilePromise = loadUserProfileAPI(userId);
    const riwayatPromise = loadUserRiwayatAPI(userId);
    
    const [profile, riwayat] = await Promise.all([profilePromise, riwayatPromise]);
    
    if (profile && riwayat !== null) {
      showNotification('✅ Data disinkronkan', 'success', 2000);
      return { profile, riwayat };
    } else {
      throw new Error('Sync failed');
    }
  } catch (error) {
    console.error('Sync error:', error);
    showNotification('⚠️ Gagal sinkronkan data', 'warning');
    return null;
  }
}

/**
 * Get Last Sync Time
 */
function getLastSyncTime() {
  const lastSync = localStorage.getItem('lastSync');
  if (!lastSync) return null;
  
  const syncDate = new Date(lastSync);
  const now = new Date();
  const diffMs = now - syncDate;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  
  return syncDate.toLocaleDateString('id-ID');
}

/**
 * Borrow Book (with database sync)
 */
async function pinjamBukuAPI() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const buku_id = document.getElementById('buku_id')?.value;
    const tgl_kembali = document.getElementById('tgl_kembali')?.value;

    if (!user.id || !buku_id) {
      showNotification('Pilih buku dan tanggal kembali!', 'warning');
      return;
    }

    const pinjaman = {
      user_id: user.id,
      buku_id: parseInt(buku_id),
      tgl_pinjam: new Date().toISOString().split('T')[0],
      tgl_kembali: tgl_kembali || new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0]
    };

    const response = await fetch(`${API_URL}/peminjaman`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pinjaman)
    });

    const result = await response.json();

    if (response.ok) {
      showNotification('✅ Buku berhasil dipinjam!', 'success');
      // Sync riwayat
      await syncUserDataAPI(user.id);
      document.getElementById('peminjamanForm')?.reset();
      loadRiwayatPinjam();
    } else {
      showNotification(result.error || 'Gagal pinjam buku', 'error');
    }
  } catch (error) {
    console.error('Borrow error:', error);
    showNotification('Koneksi ke server gagal!', 'error');
  }
}

/**
 * Return Book (with database sync)
 */
async function kembaliBukuAPI(peminjamanId) {
  if (!confirm('Yakin kembalikan buku ini?')) return;

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const response = await fetch(`${API_URL}/peminjaman/${peminjamanId}/return`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tgl_kembali: new Date().toISOString().split('T')[0]
      })
    });

    const result = await response.json();

    if (response.ok) {
      showNotification('✅ Buku berhasil dikembalikan!', 'success');
      // Sync riwayat
      await syncUserDataAPI(user.id);
      loadRiwayatPinjam();
    } else {
      showNotification(result.error || 'Gagal kembalikan buku', 'error');
    }
  } catch (error) {
    console.error('Return error:', error);
    showNotification('Koneksi ke server gagal!', 'error');
  }
}

/**
 * Load Borrowing History with Sync
 */
async function loadRiwayatPinjam() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

    const riwayat = await getRiwayatAPI(user.id);
    const tbody = document.querySelector('.riwayat-table tbody');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (!riwayat || riwayat.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Belum ada riwayat peminjaman</td></tr>';
      return;
    }

    riwayat.forEach(p => {
      const row = document.createElement('tr');
      const statusClass = p.status === 'Kembali' ? 'returned' : 'active';
      const terlambat = p.hari_terlambat > 0 ? `<br><small style="color: red;">${p.hari_terlambat} hari terlambat</small>` : '';
      
      row.innerHTML = `
        <td>${p.id}</td>
        <td>${p.judul}</td>
        <td>${new Date(p.tgl_pinjam).toLocaleDateString('id-ID')}</td>
        <td>${new Date(p.tgl_kembali).toLocaleDateString('id-ID')}</td>
        <td><span class="${statusClass}" style="padding: 5px 10px; border-radius: 4px; background: ${p.status === 'Kembali' ? '#d4edda' : '#ffeaa7'}; color: ${p.status === 'Kembali' ? '#155724' : '#856404'};">${p.status}</span></td>
        <td>Rp ${new Intl.NumberFormat('id-ID').format(p.denda || 0)}</td>
        <td>
          ${p.status === 'Dipinjam' ? `<button class="btn-primary" onclick="kembaliBukuAPI(${p.id})">Kembalikan</button>` : '-'}
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Load history error:', error);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Check login status
  if (window.location.pathname.includes('dashboard') || 
      window.location.pathname.includes('katalog') ||
      window.location.pathname.includes('riwayat') ||
      window.location.pathname.includes('pinjam') ||
      window.location.pathname.includes('profil')) {
    checkLogin();
  }

  // Check admin login
  if (window.location.pathname.includes('admin')) {
    checkAdminLogin();
  }

  // Load data based on page
  if (window.location.pathname.includes('admin-dashboard')) {
    loadAdminBuku();
  }

  if (window.location.pathname.includes('katalog')) {
    loadKatalogAPI();
  }

  if (window.location.pathname.includes('riwayat') || 
      window.location.pathname.includes('pinjam')) {
    loadRiwayatPinjam();
  }
});
