import { resizeAndCompress } from "./compressPhoto.js";
import { uploadLogo } from "./uploadLogo.js";

const report = document.getElementById('report');

function initSlots(grid, photoInput) {
    const slots = [];
    grid.innerHTML = '';
    
    for (let i = 0; i < 10; i++) {
        const slot = document.createElement('div');
        slot.className = 'photo-slot';
        slot.textContent = '+';
        slot.draggable = true;
        slots.push(slot);
        grid.appendChild(slot);
    }
    return slots;
}

function setupPage(pageElement) {
    const grid = pageElement.querySelector('.grid');
    const photoInput = pageElement.querySelector('.photo-input');
    const slots = initSlots(grid, photoInput);
    let currentClickedSlot = null;

    // Configurar clicks en slots
    slots.forEach(slot => {
        slot.addEventListener('click', () => {
            currentClickedSlot = slot;
            photoInput.click();
        });
    });

    // Configurar input de fotos
    photoInput.onchange = async () => {
        const files = Array.from(photoInput.files).slice(0, 10);
        for (const file of files) {
            try {
                const tinyUrl = await resizeAndCompress(file, 800, 0.7);
                const img = new Image();
                img.src = tinyUrl;
                img.onload = () => {
                    const targetSlot = currentClickedSlot || slots.find(s => !s.querySelector('img'));
                    if (!targetSlot) return;
                    
                    targetSlot.innerHTML = '';
                    targetSlot.appendChild(img);
                    targetSlot.classList.toggle('horizontal', img.naturalWidth > img.naturalHeight);
                    
                    currentClickedSlot = null; // Resetear después de usar
                };
            } catch (err) {
                console.error('Error:', err);
            }
        }
        photoInput.value = '';
    };

    // Drag & Drop mejorado
    let dragSrc = null;

    pageElement.addEventListener('dragstart', e => {
        if (e.target.closest('.photo-slot')) {
            dragSrc = e.target.closest('.photo-slot');
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    pageElement.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });

    pageElement.addEventListener('drop', e => {
        const dest = e.target.closest('.photo-slot');
        if (dest && dragSrc && dest !== dragSrc) {
            // Intercambiar contenido
            [dest.innerHTML, dragSrc.innerHTML] = [dragSrc.innerHTML, dest.innerHTML];
            // Intercambiar clases
            [dest.className, dragSrc.className] = [dragSrc.className, dest.className];
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