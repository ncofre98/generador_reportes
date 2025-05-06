import { resizeAndCompress } from "./compressPhoto.js";
import { uploadLogo } from "./uploadLogo.js";

const report = document.getElementById('report');

// Función para inicializar slots
function initSlots(grid, photoInput) {
    const slots = [];
    grid.innerHTML = ''; // Limpiar solo el grid
    
    for (let i = 0; i < 10; i++) {
        const slot = document.createElement('div');
        slot.className = 'photo-slot';
        slot.textContent = '+';
        slot.draggable = true;
        slot.addEventListener('click', () => photoInput.click());
        grid.appendChild(slot);
        slots.push(slot);
    }
    return slots;
}

// Función para configurar página
function setupPage(pageElement) {
    const grid = pageElement.querySelector('.grid');
    const photoInput = pageElement.querySelector('.photo-input');
    const slots = initSlots(grid, photoInput);

    // Configurar input de fotos
    photoInput.onchange = async () => {
        const files = Array.from(photoInput.files).slice(0, 10);
        for (const file of files) {
            try {
                const tinyUrl = await resizeAndCompress(file, 800, 0.7);
                const img = new Image();
                img.src = tinyUrl;
                img.onload = () => {
                    const emptySlot = slots.find(s => s.textContent === '+');
                    if (!emptySlot) return;
                    emptySlot.innerHTML = '';
                    emptySlot.appendChild(img);
                    emptySlot.classList.toggle('horizontal', img.naturalWidth > img.naturalHeight);
                };
            } catch (err) {
                console.error('Error:', err);
            }
        }
        photoInput.value = '';
    };

    // Configurar drag & drop
    let dragSrc = null;
    pageElement.addEventListener('dragstart', e => {
        dragSrc = e.target.closest('.photo-slot');
    });
    
    pageElement.addEventListener('dragover', e => e.preventDefault());
    
    pageElement.addEventListener('drop', e => {
        const dest = e.target.closest('.photo-slot');
        if (dest && dragSrc && dest !== dragSrc) {
            [dest.innerHTML, dragSrc.innerHTML] = [dragSrc.innerHTML, dest.innerHTML];
            [dest.className, dest.className] = [dragSrc.className, dragSrc.className];
        }
    });

    // Configurar logos
    pageElement.querySelectorAll('.logo').forEach(logo => {
        logo.addEventListener('click', () => {
            const input = logo.nextElementSibling; // Input debe estar después del logo
            if (input && input.classList.contains('logo-input')) {
                input.click();
                input.onchange = e => {
                    const file = e.target.files[0];
                    if (file) {
                        logo.innerHTML = '';
                        const img = new Image();
                        img.src = URL.createObjectURL(file);
                        logo.appendChild(img);
                    }
                };
            }
        });
    });
}

// Función para duplicar página
function duplicatePage() {
    const lastPage = report.querySelector('.page:last-child');
    if (!lastPage) return;
    
    const clone = lastPage.cloneNode(true);
    
    // Clonar contenido editable
    clone.querySelectorAll('[contenteditable]').forEach((el, index) => {
        const original = lastPage.querySelectorAll('[contenteditable]')[index];
        el.innerHTML = original.innerHTML;
    });
    
    setupPage(clone);
    report.appendChild(clone);
}

// Crear primera página
function createPage() {
    fetch('templates/pageTemplate.html')
        .then(res => res.text())
        .then(html => {
            const template = document.createElement('template');
            template.innerHTML = html;
            const clone = template.content.cloneNode(true);
            setupPage(clone);
            report.appendChild(clone);
        });
}

document.getElementById('duplicate-last').addEventListener('click', duplicatePage);
document.addEventListener('DOMContentLoaded', createPage);