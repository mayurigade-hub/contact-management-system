let contacts = [];
const API_URL = '/api/contacts';

async function fetchContacts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch contacts');
        contacts = await response.json();
        renderContacts(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        alert('Error loading contacts');
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
            profileImage: formData.imageUrl
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add contact');
        }

        await fetchContacts(); // Refresh list
    } catch (error) {
        console.error('Error adding contact:', error);
        alert(`Error: ${error.message}`);
    }
}

async function updateContact(id, formData) {
    try {
        const payload = {
            fullName: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            profileImage: formData.imageUrl
        };

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update contact');
        }

        await fetchContacts(); // Refresh list
    } catch (error) {
        console.error('Error updating contact:', error);
        alert(`Error: ${error.message}`);
    }
}

async function deleteContactFromAPI(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete contact');
        
        await fetchContacts(); // Refresh list
    } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Error deleting contact');
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

        const avatarLayout = imageUrl 
            ? `<img src="${imageUrl}" class="avatar" alt="${name}">`
            : `<div class="avatar">${name.charAt(0).toUpperCase()}</div>`;

        card.innerHTML = `
            <div>
                <div class="contact-info">
                    ${avatarLayout}
                    <div class="details">
                        <h4>${name}</h4>
                        <p>${contact.company ? `<i class="fa-solid fa-briefcase"></i> ${contact.company}` : ''}</p>
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
    document.getElementById('contact-image').value = target.profileImage || '';
    
    clearErrors();
    document.getElementById('contact-modal').classList.remove('hidden');
}

function handleDelete(id) {
    if (confirm("Are you sure you want to permanently delete this contact?")) {
        deleteContactFromAPI(id);
    }
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
        clearErrors();
        modal.classList.remove('hidden');
    });

    const closeModal = () => modal.classList.add('hidden');
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-modal-btn').addEventListener('click', closeModal);

    document.getElementById('search-input').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = contacts.filter(c => 
            c.fullName.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            c.phone.includes(query)
        );
        renderContacts(filtered);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('contact-id').value;
        const formData = {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            phone: document.getElementById('contact-phone').value,
            company: document.getElementById('contact-company').value,
            imageUrl: document.getElementById('contact-image').value
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