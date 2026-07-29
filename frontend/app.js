
let contacts = [];


function getContacts() {
    const data = localStorage.getItem('contacts');
    return data ? JSON.parse(data) : [];
}

function saveContacts(updatedContacts) {
    contacts = updatedContacts;
    localStorage.setItem('contacts', JSON.stringify(contacts));
    renderContacts(contacts);
}


function validateForm(formData) {
    let isValid = true;
    clearErrors();

    // 1. Name validation
    if (!formData.name.trim()) {
        showError('name-error', 'Name field is explicitly required.');
        isValid = false;
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showError('email-error', 'Please enter a valid format email address.');
        isValid = false;
    }

    // 3. Unique email check[cite: 1]
    const duplicate = contacts.some(c => c.email.toLowerCase() === formData.email.toLowerCase() && c.id !== formData.id);
    if (duplicate) {
        showError('email-error', 'This email address is already in use.');
        isValid = false;
    }

    // 4. Phone validation
    const phoneRegex = /^\+?[0-9\s\-]{7,15}$/;
    if (!phoneRegex.test(formData.phone)) {
        showError('phone-error', 'Please provide a valid phone number string.');
        isValid = false;
    }

    return isValid;
}


function renderContacts(contactsToRender) {
    const grid = document.getElementById('contacts-grid');
    grid.innerHTML = '';

    if (contactsToRender.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #94a3b8;">No contacts match your query.</div>`;
        return;
    }

    contactsToRender.forEach(contact => {
        const card = document.createElement('div');
        card.className = 'contact-card';
        
        const avatarLayout = contact.imageUrl 
            ? `<img src="${contact.imageUrl}" class="avatar" alt="${contact.name}">`
            : `<div class="avatar">${contact.name.charAt(0).toUpperCase()}</div>`;

        card.innerHTML = `
            <div>
                <div class="contact-info">
                    ${avatarLayout}
                    <div class="details">
                        <h4>${contact.name}</h4>
                        <p>${contact.company ? `<i class="fa-solid fa-briefcase"></i> ${contact.company}` : ''}</p>
                    </div>
                </div>
                <div class="contact-meta">
                    <div class="meta-item"><i class="fa-solid fa-envelope"></i> <span>${contact.email}</span></div>
                    <div class="meta-item"><i class="fa-solid fa-phone"></i> <span>${contact.phone}</span></div>
                </div>
            </div>
            <div class="card-actions">
                <button class="action-btn edit" data-id="${contact.id}"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn delete" data-id="${contact.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.action-btn.edit').forEach(b => b.addEventListener('click', () => handleEdit(b.dataset.id)));
    document.querySelectorAll('.action-btn.delete').forEach(b => b.addEventListener('click', () => handleDelete(b.dataset.id)));
}

function handleEdit(id) {
    const target = contacts.find(c => c.id === id);
    if (!target) return;

    document.getElementById('modal-title').innerText = "Edit Contact";
    document.getElementById('contact-id').value = target.id;
    document.getElementById('contact-name').value = target.name;
    document.getElementById('contact-email').value = target.email;
    document.getElementById('contact-phone').value = target.phone;
    document.getElementById('contact-company').value = target.company || '';
    document.getElementById('contact-image').value = target.imageUrl || '';
    
    clearErrors();
    document.getElementById('contact-modal').classList.remove('hidden');
}

function handleDelete(id) {
    if (confirm("Are you certain you want to permanently delete this contact object?[cite: 1]")) {
        const remaining = contacts.filter(c => c.id !== id);
        saveContacts(remaining);
    }
}

function showError(elementId, message) {
    document.getElementById(elementId).innerText = message;
}

function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(el => el.innerText = '');
}

document.addEventListener('DOMContentLoaded', () => {
    contacts = getContacts();
    renderContacts(contacts);

    const modal = document.getElementById('contact-modal');
    const form = document.getElementById('contact-form');

    // Open Modal
    document.getElementById('add-contact-btn').addEventListener('click', () => {
        document.getElementById('modal-title').innerText = "Add New Contact";
        form.reset();
        document.getElementById('contact-id').value = '';
        clearErrors();
        modal.classList.remove('hidden');
    });

    const closeModal = () => modal.classList.add('hidden');
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-modal-btn').addEventListener('click', closeModal);

    document.getElementById('search-input').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = contacts.filter(c => 
            c.name.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            c.phone.includes(query)
        );
        renderContacts(filtered);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('contact-id').value;
        const formData = {
            id: id || Date.now().toString(),
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            phone: document.getElementById('contact-phone').value,
            company: document.getElementById('contact-company').value,
            imageUrl: document.getElementById('contact-image').value
        };

        if (!validateForm(formData)) return;

        let updated;
        if (id) {
            updated = contacts.map(c => c.id === id ? formData : c);
        } else {
            updated = [...contacts, formData];
        }

        saveContacts(updated);
        closeModal();
    });
});