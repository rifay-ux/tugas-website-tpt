/* ========================================
   VARIABEL GLOBAL - Data yang digunakan di seluruh aplikasi
   ======================================== */

// Object untuk menyimpan data user (NPM sebagai key)
let users = {};

// Object untuk menyimpan data booking (kombinasi field-date-time sebagai key)
let bookings = {};

// Menyimpan NPM user yang sedang login
let currentUser = null;

// Menyimpan lapangan yang dipilih user
let selectedField = null;

// Menyimpan jam yang dipilih user
let selectedTime = null;

/* ========================================
   FUNGSI: initTimeSlots
   Membuat slot waktu dari jam 08.00 - 19.00
   ======================================== */
function initTimeSlots() {
    // Ambil container untuk slot waktu
    const timeSlotsContainer = document.getElementById('timeSlots');
    
    // Kosongkan container dulu
    timeSlotsContainer.innerHTML = '';
    
    // Loop dari jam 8 sampai jam 18 (karena < 19)
    for (let hour = 8; hour < 19; hour++) {
        // Buat element div untuk setiap slot waktu
        const timeSlot = document.createElement('div');
        
        // Tambahkan class 'time-slot'
        timeSlot.className = 'time-slot';
        
        // Set text jam (misal: "08:00", "09:00")
        // padStart(2, '0') untuk menambahkan 0 di depan jika < 10
        timeSlot.textContent = `${hour.toString().padStart(2, '0')}:00`;
        
        // Set fungsi yang akan dipanggil saat diklik
        timeSlot.onclick = () => selectTimeSlot(hour);
        
        // Simpan jam di attribute data-hour untuk referensi
        timeSlot.dataset.hour = hour;
        
        // Tambahkan slot ke container
        timeSlotsContainer.appendChild(timeSlot);
    }
}

/* ========================================
   FUNGSI: selectField
   Dipanggil saat user memilih lapangan
   ======================================== */
function selectField(field) {
    // Simpan pilihan lapangan
    selectedField = field;
    
    // Hilangkan class 'selected' dari semua card
    document.querySelectorAll('.field-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Tambahkan class 'selected' ke card yang diklik
    event.target.closest('.field-card').classList.add('selected');
    
    // Update tampilan slot waktu yang sudah dibooking
    updateBookedSlots();
}

/* ========================================
   FUNGSI: selectTimeSlot
   Dipanggil saat user memilih jam
   ======================================== */
function selectTimeSlot(hour) {
    // Ambil element slot yang diklik
    const slot = event.target;
    
    // Cek apakah slot ini sudah dibooking
    if (slot.classList.contains('booked')) {
        // Tampilkan pesan error
        showAlert('bookingAlert', 'Jam ini sudah dibooking! Pilih jam lain.', 'error');
        return; // Stop fungsi
    }
    
    // Simpan jam yang dipilih
    selectedTime = hour;
    
    // Hilangkan class 'selected' dari semua slot
    document.querySelectorAll('.time-slot').forEach(s => {
        s.classList.remove('selected');
    });
    
    // Tambahkan class 'selected' ke slot yang diklik
    slot.classList.add('selected');
}

/* ========================================
   FUNGSI: showSection
   Pindah ke halaman/section tertentu
   ======================================== */
function showSection(sectionId) {
    // Hilangkan class 'active' dari semua section
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Tambahkan class 'active' ke section yang dituju
    document.getElementById(sectionId).classList.add('active');
    
    // Jika pindah ke halaman booking, inisialisasi slot waktu
    if (sectionId === 'bookingSection') {
        initTimeSlots();
        updateBookedSlots(); // Update slot yang sudah dibooking
    }
}

/* ========================================
   FUNGSI: updateBookedSlots
   Menandai slot waktu yang sudah dibooking
   ======================================== */
function updateBookedSlots() {
    // Ambil tanggal yang dipilih
    const date = document.getElementById('bookingDate').value;
    
    // Jika tanggal atau lapangan belum dipilih, stop fungsi
    if (!date || !selectedField) return;
    
    // Reset dulu semua slot (hilangkan class 'booked')
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('booked');
    });
    
    // Loop setiap jam untuk cek apakah sudah dibooking
    for (let hour = 8; hour < 19; hour++) {
        // Buat key booking (format: lapangan-tanggal-jam)
        const bookingKey = `${selectedField}-${date}-${hour}`;
        
        // Jika key ini ada di object bookings, berarti sudah dibooking
        if (bookings[bookingKey]) {
            // Cari slot dengan jam ini
            const slot = document.querySelector(`.time-slot[data-hour="${hour}"]`);
            
            // Jika slot ditemukan, tandai sebagai 'booked'
            if (slot) {
                slot.classList.add('booked');
                slot.classList.remove('selected'); // Hilangkan selected jika ada
            }
        }
    }
}

/* ========================================
   FUNGSI: showAlert
   Menampilkan pesan notifikasi (error/success)
   ======================================== */
function showAlert(elementId, message, type) {
    // Ambil element tempat alert ditampilkan
    const alertDiv = document.getElementById(elementId);
    
    // Set HTML alert dengan class sesuai tipe (error/success)
    alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    
    // Hapus alert setelah 3 detik
    setTimeout(() => alertDiv.innerHTML = '', 3000);
}

/* ========================================
   EVENT: Register Form Submit
   Proses registrasi user baru
   ======================================== */
document.getElementById('registerForm').addEventListener('submit', function(e) {
    // Cegah form reload halaman
    e.preventDefault();
    
    // Ambil nilai dari setiap input
    const name = document.getElementById('regName').value;
    const npm = document.getElementById('regNpm').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // VALIDASI 1: Cek apakah NPM sudah terdaftar
    if (users[npm]) {
        showAlert('registerAlert', 'NPM sudah terdaftar!', 'error');
        return;
    }
    
    // VALIDASI 2: Cek panjang password minimal 6 karakter
    if (password.length < 6) {
        showAlert('registerAlert', 'Password minimal 6 karakter!', 'error');
        return;
    }
    
    // VALIDASI 3: Cek apakah password dan konfirmasi cocok
    if (password !== confirmPassword) {
        showAlert('registerAlert', 'Password tidak cocok!', 'error');
        return;
    }
    
    // Simpan user baru ke object users
    users[npm] = { name, password };
    
    // Tampilkan pesan sukses
    showAlert('registerAlert', 'Registrasi berhasil! Silakan login.', 'success');
    
    // Pindah ke halaman login setelah 1.5 detik
    setTimeout(() => {
        showSection('loginSection');
    }, 1500);
});

/* ========================================
   EVENT: Login Form Submit
   Proses login user
   ======================================== */
document.getElementById('loginForm').addEventListener('submit', function(e) {
    // Cegah form reload halaman
    e.preventDefault();
    
    // Ambil nilai NPM dan password
    const npm = document.getElementById('loginNpm').value;
    const password = document.getElementById('loginPassword').value;
    
    // VALIDASI 1: Cek apakah NPM terdaftar
    if (!users[npm]) {
        showAlert('loginAlert', 'NPM tidak terdaftar!', 'error');
        return;
    }
    
    // VALIDASI 2: Cek apakah password benar
    if (users[npm].password !== password) {
        showAlert('loginAlert', 'Password salah!', 'error');
        return;
    }
    
    // Set user yang sedang login
    currentUser = npm;
    
    // Tampilkan pesan sukses
    showAlert('loginAlert', 'Login berhasil!', 'success');
    
    // Pindah ke halaman booking setelah 1 detik
    setTimeout(() => {
        showSection('bookingSection');
    }, 1000);
});

/* ========================================
   EVENT: Forgot Password Form Submit
   Proses reset password
   ======================================== */
document.getElementById('forgotForm').addEventListener('submit', function(e) {
    // Cegah form reload halaman
    e.preventDefault();
    
    // Ambil nilai input
    const npm = document.getElementById('forgotNpm').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    // VALIDASI 1: Cek apakah NPM terdaftar
    if (!users[npm]) {
        showAlert('forgotAlert', 'NPM tidak terdaftar!', 'error');
        return;
    }
    
    // VALIDASI 2: Cek panjang password minimal 6 karakter
    if (newPassword.length < 6) {
        showAlert('forgotAlert', 'Password minimal 6 karakter!', 'error');
        return;
    }
    
    // VALIDASI 3: Cek apakah password baru dan konfirmasi cocok
    if (newPassword !== confirmNewPassword) {
        showAlert('forgotAlert', 'Password tidak cocok!', 'error');
        return;
    }
    
    // Update password user
    users[npm].password = newPassword;
    
    // Tampilkan pesan sukses
    showAlert('forgotAlert', 'Password berhasil direset!', 'success');
    
    // Pindah ke halaman login setelah 1.5 detik
    setTimeout(() => {
        showSection('loginSection');
    }, 1500);
});

/* ========================================
   EVENT: File Upload Change
   Preview file yang diupload
   ======================================== */
document.getElementById('ktmFile').addEventListener('change', function(e) {
    // Ambil file yang diupload
    const file = e.target.files[0];
    
    // Jika ada file
    if (file) {
        // Ambil container preview
        const preview = document.getElementById('filePreview');
        
        // Tampilkan nama file dengan icon centang
        preview.innerHTML = `
            <div class="uploaded-file">
                <span>📄 ${file.name}</span>
                <span style="color: green;">✓</span>
            </div>
        `;
    }
});

/* ========================================
   EVENT: Tanggal Booking Change
   Update slot yang dibooking saat tanggal berubah
   ======================================== */
document.getElementById('bookingDate').addEventListener('change', function() {
    // Update tampilan slot yang sudah dibooking
    updateBookedSlots();
});

/* ========================================
   FUNGSI: submitBooking
   Proses submit booking lapangan
   ======================================== */
function submitBooking() {
    // Ambil semua data yang diinput user
    const name = document.getElementById('bookingName').value;
    const date = document.getElementById('bookingDate').value;
    const file = document.getElementById('ktmFile').files[0];
    
    // VALIDASI: Cek apakah semua data sudah diisi
    if (!name || !selectedField || !date || !selectedTime || !file) {
        showAlert('bookingAlert', 'Harap lengkapi semua data!', 'error');
        return;
    }
    
    // Buat key unik untuk booking ini
    const bookingKey = `${selectedField}-${date}-${selectedTime}`;
    
    // CEK DOUBLE BOOKING: Cek apakah jam ini sudah dibooking
    if (bookings[bookingKey]) {
        showAlert('bookingAlert', 'Jam ini sudah dibooking!', 'error');
        return;
    }
    
    // Simpan data booking
    bookings[bookingKey] = {
        name,
        field: selectedField,
        date,
        time: selectedTime,
        npm: currentUser
    };
    
    // Object untuk nama lapangan yang user-friendly
    const fieldNames = {
        futsal: 'Futsal ⚽',
        voli: 'Voli 🏐',
        basket: 'Basket 🏀',
        badminton: 'Badminton 🏸'
    };
    
    // Tampilkan detail booking di halaman sukses
    document.getElementById('bookingDetails').innerHTML = `
        <div class="info-item">
            <div class="info-label">Nama Pemesan</div>
            <div class="info-value">${name}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Lapangan</div>
            <div class="info-value">${fieldNames[selectedField]}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Tanggal</div>
            <div class="info-value">${new Date(date).toLocaleDateString('id-ID')}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Jam</div>
            <div class="info-value">${selectedTime.toString().padStart(2, '0')}:00 - ${(selectedTime + 1).toString().padStart(2, '0')}:00</div>
        </div>
    `;
    
    // Pindah ke halaman sukses
    showSection('successSection');
    
    // Reset form untuk booking selanjutnya
    document.getElementById('bookingName').value = '';
    document.getElementById('bookingDate').value = '';
    document.getElementById('ktmFile').value = '';
    document.getElementById('filePreview').innerHTML = '';
    selectedField = null;
    selectedTime = null;
}

/* ========================================
   FUNGSI: logout
   Proses logout user
   ======================================== */
function logout() {
    // Hapus data user yang sedang login
    currentUser = null;
    
    // Kembali ke halaman login
    showSection('loginSection');
}

/* ========================================
   INISIALISASI SAAT HALAMAN DIMUAT
   ======================================== */

// Set tanggal minimal adalah hari ini (tidak bisa booking tanggal lampau)
const today = new Date().toISOString().split('T')[0];
document.getElementById('bookingDate').setAttribute('min', today);

// Inisialisasi slot waktu pertama kali
initTimeSlots();