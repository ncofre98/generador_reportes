import { resizeAndCompress } from "./compressPhoto.js";
import { uploadLogo } from "./uploadLogo.js";

const report = document.getElementById('report');

function initSlots(grid) {
    const slots = [];
    grid.innerHTML = '';
    
    for (let i = 0; i < 10; i++) {
        const slot = document.createElement('div');
        slot.className = 'photo-slot';
        slot.draggable = true;
        slots.push(slot);
        grid.appendChild(slot);
    }
    return slots;
}

function setupPage(pageElement) {
    const grid = pageElement.querySelector('.grid');
    const photoInput = pageElement.querySelector('.photo-input');
    const slots = initSlots(grid);
    let currentClickedSlot = null;
    let isDragging = false;
    let dragSrc = null;

    // Configurar eventos de drag and drop
    slots.forEach(slot => {
        // Drag Start
        slot.addEventListener('dragstart', function(e) {
            dragSrc = this;
            isDragging = true;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.innerHTML);
        });

        // Drag End
        slot.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            isDragging = false;
            dragSrc = null;
        });

        // Drag Over
        slot.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('over');
            e.dataTransfer.dropEffect = 'move';
        });

        // Drag Leave
        slot.addEventListener('dragleave', function() {
            this.classList.remove('over');
        });

        // Drop
        slot.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('over');
            
            if (dragSrc && dragSrc !== this) {
                // Guardar estados originales
                const srcHTML = dragSrc.innerHTML;
                const srcClasses = dragSrc.className;
                
                // Intercambiar contenido
                dragSrc.innerHTML = this.innerHTML;
                dragSrc.className = this.className;
                
                this.innerHTML = srcHTML;
                this.className = srcClasses;
            }
        });

        // Click para reemplazar foto
        slot.addEventListener('click', () => {
            if (!isDragging) {
                currentClickedSlot = slot;
                photoInput.click();
            }
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
                    
                    if (targetSlot) {
                        targetSlot.innerHTML = '';
                        targetSlot.appendChild(img);
                        targetSlot.classList.toggle('horizontal', img.naturalWidth > img.naturalHeight);
                        
                        // Resetear solo si fue click directo
                        if (currentClickedSlot) currentClickedSlot = null;
                    }
                };
            } catch (err) {
                console.error('Error procesando imagen:', err);
            }
        }
        photoInput.value = '';
    };

    // Configurar logos
    pageElement.querySelectorAll('.logo').forEach(logo => {
        logo.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.logo-input');
            if (input) {
                input.click();
                input.onchange = e => {
                    const file = e.target.files[0];
                    if (file) {
                        this.innerHTML = '';
                        const img = new Image();
                        img.src = URL.createObjectURL(file);
                        this.appendChild(img);
                    }
                };
            }
        });
    });
}

function createNewPage() {
    fetch('templates/pageTemplate.html')
        .then(res => res.text())
        .then(html => {
            const template = document.createElement('template');
            template.innerHTML = html;
            const clone = template.content.cloneNode(true);
            setupPage(clone);
            report.appendChild(clone);
        })
        .catch(err => console.error('Error loading template:', err));
}

function duplicatePage() {
    const lastPage = report.querySelector('.page:last-child');
    if (!lastPage) return;
    
    const clone = lastPage.cloneNode(true);
    
    // Clonar contenido editable
    const originalEditable = lastPage.querySelectorAll('[contenteditable]');
    clone.querySelectorAll('[contenteditable]').forEach((el, index) => {
        el.innerHTML = originalEditable[index]?.innerHTML || '';
    });
    
    setupPage(clone);
    report.appendChild(clone);
}

function deletePage(node) {

}

// Inicialización
document.addEventListener('DOMContentLoaded', createNewPage);
document.getElementById('duplicate-last').addEventListener('click', duplicatePage);
document.getElementById('delete-last').addEventListener('click', () => {
    const pages = document.querySelectorAll('.page');
    pages[pages.length - 1].remove();
})