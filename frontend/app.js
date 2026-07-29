let contacts = [];
const API_URL = '/api/contacts';
let activeTab = 'all';
let activeSearch = '';
let currentImageDataUrl = '';

function filterAndRender() {
    let filtered = contacts;

    // Filter by active tab
    if (activeTab === 'favorites') {
        filtered = filtered.filter(c => c.isFavorite);
    } else if (activeTab !== 'all') {
        filtered = filtered.filter(c => c.category === activeTab);
    }

    // Filter by search query
    if (activeSearch.trim()) {
        const q = activeSearch.toLowerCase();
        filtered = filtered.filter(c =>
            c.fullName.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.phone.includes(q)
        );
    }

    renderContacts(filtered);
}

function showToast(message, type = 'success', duration = 3200) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-xmark';
    if (type === 'info') iconClass = 'fa-circle-info';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass} toast-icon"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    const dismissTimeout = setTimeout(() => removeToast(toast), duration);

    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(dismissTimeout);
        removeToast(toast);
    });
}

function removeToast(toast) {
    toast.classList.add('toast-hiding');
    toast.addEventListener('animationend', () => toast.remove());
}

async function parseErrorResponse(response, defaultMsg) {
    try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return data.message || defaultMsg;
        }
        const text = await response.text();
        return text || defaultMsg;
    } catch {
        return defaultMsg;
    }
}

function compressAndResizeImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const maxDim = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxDim) {
                    height *= maxDim / width;
                    width = maxDim;
                }
            } else {
                if (height > maxDim) {
                    width *= maxDim / height;
                    height = maxDim;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
            callback(compressedDataUrl);
        };
        img.onerror = function() {
            callback(e.target.result);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

async function fetchContacts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch contacts');
        contacts = await response.json();
        filterAndRender();
    } catch (error) {
        console.error('Error fetching contacts:', error);
        showToast('Error loading contacts', 'error');
    }
}

async function addContact(formData) {
    try {
        // Map frontend fields to backend schema fields
        const payload = {
            fullName: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            profileImage: formData.imageUrl,
            isFavorite: Boolean(formData.isFavorite),
            category: formData.category || ''
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorMsg = await parseErrorResponse(response, 'Failed to add contact');
            throw new Error(errorMsg);
        }

        showToast('Contact added successfully!', 'success');
        await fetchContacts(); // Refresh list
    } catch (error) {
        console.error('Error adding contact:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

async function updateContact(id, formData) {
    try {
        const payload = {
            fullName: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            profileImage: formData.imageUrl,
            isFavorite: Boolean(formData.isFavorite),
            category: formData.category || ''
        };

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorMsg = await parseErrorResponse(response, 'Failed to update contact');
            throw new Error(errorMsg);
        }

        showToast('Contact updated successfully!', 'success');
        await fetchContacts(); // Refresh list
    } catch (error) {
        console.error('Error updating contact:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

async function deleteContactFromAPI(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete contact');
        
        showToast('Contact deleted successfully', 'info');
        await fetchContacts(); // Refresh list
    } catch (error) {
        console.error('Error deleting contact:', error);
        showToast('Error deleting contact', 'error');
    }
}


function validateForm(formData) {
    let isValid = true;
    clearErrors();

    // 1. Name validation
    if (!formData.name.trim()) {
        showError('name-error', 'Name field is required.');
        isValid = false;
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showError('email-error', 'Please enter a valid format email address.');
        isValid = false;
    }

    // 3. Phone validation
    const phoneRegex = /^\+?[0-9\s\-]{7,15}$/;
    if (!phoneRegex.test(formData.phone)) {
        showError('phone-error', 'Please provide a valid phone number.');
        isValid = false;
    }
    
    // 4. Duplicate email check
    const id = document.getElementById('contact-id').value;
    const isDuplicate = contacts.some(c => c.email.toLowerCase() === formData.email.toLowerCase() && c._id !== id);
    if (isDuplicate) {
        showError('email-error', 'This email address is already in use.');
        isValid = false;
    }
    
    return isValid;
}


function renderContacts(contactsToRender) {
    const grid = document.getElementById('contacts-grid');
    grid.innerHTML = '';

    if (contactsToRender.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #94a3b8;">No contacts found.</div>`;
        return;
    }

    contactsToRender.forEach(contact => {
        const card = document.createElement('div');
        card.className = 'contact-card';
        
        // Map backend schema back to frontend fields for display
        const name = contact.fullName;
        const imageUrl = contact.profileImage;
        const id = contact._id;

        const avatarLayout = (imageUrl && imageUrl.trim()) 
            ? `<img src="${imageUrl.trim()}" class="avatar" alt="${name}" onerror="this.onerror=null; this.outerHTML='<div class=\\'avatar\\'>${name.charAt(0).toUpperCase()}</div>';">`
            : `<div class="avatar">${name.charAt(0).toUpperCase()}</div>`;

        const starBadge = contact.isFavorite 
            ? `<i class="fa-solid fa-star favorite-star" title="Favorite Contact"></i>` 
            : '';

        const categoryColors = { Work: 'cat-work', Family: 'cat-family', Friends: 'cat-friends', Other: 'cat-other' };
        const catBadge = contact.category 
            ? `<span class="category-badge ${categoryColors[contact.category] || 'cat-other'}">${contact.category}</span>` 
            : '';

        card.innerHTML = `
            <div>
                <div class="contact-card-header">
                    <div class="contact-info">
                        ${avatarLayout}
                        <div class="details">
                            <h4>${name} ${starBadge}</h4>
                            <p>${contact.company ? `<i class="fa-solid fa-briefcase"></i> ${contact.company}` : ''}</p>
                            ${catBadge}
                        </div>
                    </div>
                </div>
                <div class="contact-meta">
                    <div class="meta-item"><i class="fa-solid fa-envelope"></i> <span>${contact.email}</span></div>
                    <div class="meta-item"><i class="fa-solid fa-phone"></i> <span>${contact.phone}</span></div>
                </div>
            </div>
            <div class="card-actions">
                <button class="action-btn edit" data-id="${id}"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn delete" data-id="${id}"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.action-btn.edit').forEach(b => b.addEventListener('click', () => handleEdit(b.dataset.id)));
    document.querySelectorAll('.action-btn.delete').forEach(b => b.addEventListener('click', () => handleDelete(b.dataset.id)));
}

function handleEdit(id) {
    const target = contacts.find(c => c._id === id);
    if (!target) return;

    document.getElementById('modal-title').innerText = "Edit Contact";
    document.getElementById('contact-id').value = target._id;
    document.getElementById('contact-name').value = target.fullName;
    document.getElementById('contact-email').value = target.email;
    document.getElementById('contact-phone').value = target.phone;
    document.getElementById('contact-company').value = target.company || '';
    const imgUrl = target.profileImage || '';
    currentImageDataUrl = imgUrl;
    document.getElementById('contact-image').value = imgUrl.startsWith('data:') ? '' : imgUrl;
    document.getElementById('contact-file').value = '';
    document.getElementById('contact-favorite').checked = Boolean(target.isFavorite);
    document.getElementById('contact-category').value = target.category || '';
    
    const previewWrapper = document.getElementById('image-preview-wrapper');
    const previewImg = document.getElementById('image-preview');
    const previewLabel = document.getElementById('preview-label');

    if (imgUrl.trim()) {
        previewImg.src = imgUrl.trim();
        previewLabel.innerText = imgUrl.startsWith('data:') ? 'Uploaded Photo' : 'Image URL';
        previewWrapper.classList.remove('hidden');
    } else {
        previewWrapper.classList.add('hidden');
    }
    
    clearErrors();
    document.getElementById('contact-modal').classList.remove('hidden');
}

function handleDelete(id) {
    showDeleteConfirm(id);
}

function showDeleteConfirm(id) {
    // Remove any existing confirm modal
    const existing = document.getElementById('delete-confirm-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'delete-confirm-modal';
    overlay.className = 'delete-confirm-backdrop';
    overlay.innerHTML = `
        <div class="delete-confirm-card">
            <div class="delete-confirm-icon">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 class="delete-confirm-title">Delete Contact?</h3>
            <p class="delete-confirm-msg">This action is permanent and cannot be undone.</p>
            <div class="delete-confirm-actions">
                <button id="delete-cancel-btn" class="btn btn-secondary">Cancel</button>
                <button id="delete-confirm-btn" class="btn btn-danger">Yes, Delete</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('delete-cancel-btn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.getElementById('delete-confirm-btn').addEventListener('click', () => {
        overlay.remove();
        deleteContactFromAPI(id);
    });
}

function showError(elementId, message) {
    document.getElementById(elementId).innerText = message;
}

function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(el => el.innerText = '');
}

document.addEventListener('DOMContentLoaded', () => {
    // Fetch initial contacts from the API
    fetchContacts();

    const modal = document.getElementById('contact-modal');
    const form = document.getElementById('contact-form');

    // Open Modal
    document.getElementById('add-contact-btn').addEventListener('click', () => {
        document.getElementById('modal-title').innerText = "Add New Contact";
        form.reset();
        document.getElementById('contact-id').value = '';
        document.getElementById('contact-favorite').checked = false;
        document.getElementById('contact-category').value = '';
        document.getElementById('contact-file').value = '';
        document.getElementById('contact-image').value = '';
        currentImageDataUrl = '';
        document.getElementById('image-preview-wrapper').classList.add('hidden');
        clearErrors();
        modal.classList.remove('hidden');
    });

    const closeModal = () => modal.classList.add('hidden');
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-modal-btn').addEventListener('click', closeModal);

    document.getElementById('search-input').addEventListener('input', (e) => {
        activeSearch = e.target.value;
        filterAndRender();
    });

    // Image Mode Toggle Buttons
    const fileBtn = document.getElementById('mode-file-btn');
    const urlBtn = document.getElementById('mode-url-btn');
    const fileWrapper = document.getElementById('file-input-wrapper');
    const urlWrapper = document.getElementById('url-input-wrapper');
    const fileInput = document.getElementById('contact-file');
    const imageInput = document.getElementById('contact-image');
    const previewWrapper = document.getElementById('image-preview-wrapper');
    const previewImg = document.getElementById('image-preview');
    const previewLabel = document.getElementById('preview-label');
    const removeImgBtn = document.getElementById('remove-image-btn');

    fileBtn.addEventListener('click', () => {
        fileBtn.classList.add('active');
        urlBtn.classList.remove('active');
        fileWrapper.classList.remove('hidden');
        urlWrapper.classList.add('hidden');
    });

    urlBtn.addEventListener('click', () => {
        urlBtn.classList.add('active');
        fileBtn.classList.remove('active');
        urlWrapper.classList.remove('hidden');
        fileWrapper.classList.add('hidden');
    });

    // File Input Listener (Read device photo, compress & resize)
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            compressAndResizeImage(file, function(compressedUrl) {
                currentImageDataUrl = compressedUrl;
                previewImg.src = currentImageDataUrl;
                previewLabel.innerText = file.name;
                previewWrapper.classList.remove('hidden');
            });
        }
    });

    // URL Input Listener
    imageInput.addEventListener('input', () => {
        const url = imageInput.value.trim();
        if (url) {
            currentImageDataUrl = url;
            previewImg.src = url;
            previewLabel.innerText = 'Live Image Preview';
            previewWrapper.classList.remove('hidden');
        } else {
            currentImageDataUrl = '';
            previewWrapper.classList.add('hidden');
        }
    });

    // Remove Image Button Listener
    removeImgBtn.addEventListener('click', () => {
        currentImageDataUrl = '';
        fileInput.value = '';
        imageInput.value = '';
        previewWrapper.classList.add('hidden');
    });

    // Filter tab clicks
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeTab = tab.dataset.filter;
            filterAndRender();
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('contact-id').value;
        const formData = {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            phone: document.getElementById('contact-phone').value,
            company: document.getElementById('contact-company').value,
            imageUrl: currentImageDataUrl || document.getElementById('contact-image').value.trim(),
            isFavorite: document.getElementById('contact-favorite').checked,
            category: document.getElementById('contact-category').value
        };

        if (!validateForm(formData)) return;

        if (id) {
            await updateContact(id, formData);
        } else {
            await addContact(formData);
        }

        closeModal();
    });
});