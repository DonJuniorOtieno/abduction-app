// Global variables
let map;
let currentMarker = null;
let currentLat = -1.2921;
let currentLon = 36.8219;
let contacts = [];

// Initialize Leaflet map
function initMap() {
    map = L.map('map', {
        zoomControl: true,
        attributionControl: false
    }).setView([currentLat, currentLon], 14);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        className: 'map-tiles'
    }).addTo(map);
    
    currentMarker = L.marker([currentLat, currentLon]).addTo(map)
        .bindPopup('<b>Demo Location</b><br>Nairobi, Kenya')
        .openPopup();
}

// Update map position
function updateMap(lat, lon) {
    if (!map) return;
    map.setView([lat, lon], 17);
    
    if (currentMarker) currentMarker.remove();
    
    currentMarker = L.marker([lat, lon]).addTo(map)
        .bindPopup('<b>YOU ARE HERE</b><br>Live GPS • Accurate now')
        .openPopup();
}

// Get user location
function getLocation(isSOS = false) {
    if (!navigator.geolocation) {
        alert("Geolocation not supported.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentLat = position.coords.latitude;
            currentLon = position.coords.longitude;

            document.getElementById('locationText').innerHTML = 
                `<span style="color:#34d399">📍</span> ${currentLat.toFixed(5)}, ${currentLon.toFixed(5)}`;

            const acc = Math.round(position.coords.accuracy);
            const badge = document.getElementById('accuracyBadge');
            badge.classList.remove('hidden');
            badge.textContent = `±${acc}m accurate`;

            updateMap(currentLat, currentLon);

            if (isSOS) showSOSModal();
        },
        (err) => {
            let msg = "Location error: ";
            if (err.code === 1) msg += "Permission denied.";
            else if (err.code === 2) msg += "Position unavailable.";
            else msg += "Timeout.";
            alert(msg + "\nUsing demo Nairobi coordinates.");

            if (isSOS) showSOSModal();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// Trigger SOS
function triggerSOS() {
    const btn = document.getElementById('sosBtn');
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => btn.style.transform = 'scale(1)', 150);
    
    getLocation(true);
}

// Show alert modal
function showSOSModal() {
    document.getElementById('sosModal').classList.remove('hidden');

    const now = new Date();
    document.getElementById('modalTime').textContent = 
        now.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + 
        ' • ' + now.toLocaleDateString('en-KE');

    document.getElementById('modalLocation').innerHTML = 
        `Latitude: <b>${currentLat.toFixed(6)}</b><br>` +
        `Longitude: <b>${currentLon.toFixed(6)}</b><br>` +
        `<span style="font-size:12px;color:#71717a;display:block;margin-top:12px;">Nairobi, Kenya (high accuracy)</span>`;

    renderModalContacts();
}

// Render contacts in modal
function renderModalContacts() {
    const container = document.getElementById('modalContactsNotified');
    container.innerHTML = '';

    if (contacts.length === 0) {
        container.innerHTML = '<p style="color:#71717a;font-style:italic;">No personal contacts added yet</p>';
        return;
    }

    contacts.forEach(c => {
        const div = document.createElement('div');
        div.className = 'notification-item';
        div.innerHTML = `
            <div class="details">
                <p>${c.name}</p>
            </div>
            <div class="status" style="font-family:monospace;">${c.phone}</div>
            <span class="check">✓</span>
        `;
        container.appendChild(div);
    });
}

function closeModal() {
    document.getElementById('sosModal').classList.add('hidden');
}

function fakeCallPolice() {
    alert("📞 SIMULATED CALL TO 999\n\nIn real app this would connect directly to Kenya Police with GPS already sent.");
    closeModal();
}

// Contacts management
function loadContacts() {
    const saved = localStorage.getItem('safeSOS_contacts');
    if (saved) {
        contacts = JSON.parse(saved);
    } else {
        contacts = [
            { name: "Mum", phone: "+254 712 345 678" },
            { name: "Police Station", phone: "999" }
        ];
        saveContacts();
    }
    renderContacts();
}

function saveContacts() {
    localStorage.setItem('safeSOS_contacts', JSON.stringify(contacts));
}

function renderContacts() {
    const list = document.getElementById('contactsList');
    list.innerHTML = '';

    if (contacts.length === 0) {
        list.innerHTML = '<p style="color:#71717a;text-align:center;padding:32px 0;">No contacts yet.<br>Add one below 👇</p>';
        return;
    }

    contacts.forEach((contact, i) => {
        const div = document.createElement('div');
        div.className = 'contact-item';
        div.innerHTML = `
            <div>
                <p>${contact.name}</p>
                <p class="phone">${contact.phone}</p>
            </div>
            <div style="display:flex;gap:8px;">
                <a href="tel:${contact.phone}" style="background:#10b981;color:white;padding:8px 16px;border-radius:12px;font-size:14px;text-decoration:none;">CALL</a>
                <button onclick="deleteContact(${i})" style="background:none;border:none;color:#f87171;font-size:24px;cursor:pointer;">×</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function deleteContact(index) {
    if (confirm("Remove this contact?")) {
        contacts.splice(index, 1);
        saveContacts();
        renderContacts();
    }
}

// Form submit
document.getElementById('addContactForm').addEventListener('submit', e => {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    
    if (!name || !phone) {
        alert("Please enter both name and phone.");
        return;
    }

    contacts.push({ name, phone });
    saveContacts();
    renderContacts();

    document.getElementById('contactName').value = '';
    document.getElementById('contactPhone').value = '';
});

// Keyboard support (press Space for SOS)
document.addEventListener('keydown', e => {
    if (e.key === " " && 
        document.activeElement.tagName !== "INPUT" && 
        document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        triggerSOS();
    }
});

// Init
window.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadContacts();
    
    console.log("%cSafeSOS prototype ready ✅", "color:#10b981;font-weight:bold");
});

// Expose global functions used in HTML onclick
window.triggerSOS   = triggerSOS;
window.getLocation  = getLocation;
window.closeModal   = closeModal;
window.fakeCallPolice = fakeCallPolice;
window.deleteContact = deleteContact;