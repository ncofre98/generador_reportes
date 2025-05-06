import { resizeAndCompress } from "./compressPhoto.js";
import { uploadLogo } from "./uploadLogo.js";

const report = document.getElementById('report');

function initSlots(grid, slots, photoInput) {
    for (let i = 0; i < 10; i++) {
        const slot = document.createElement('div');
        slot.className = 'photo-slot';
        slot.dataset.index = i;
        slot.textContent = '+';
        slot.draggable = true;
        slot.addEventListener('click', () => photoInput.click());
        grid.appendChild(slot);
        slots.push(slot);
    }
}

function loadPageTemplate() {
    fetch('templates/pageTemplate.html')
        .then(res => res.text())
        .then(html => {
            const template = document.createElement('template');
            template.innerHTML = html;

            const clone = template.content.cloneNode(true);
            const grid = clone.getElementById('grid');
            const photoInput = clone.getElementById('photo-input');
            const slots = [];

            // Inicializa los slots
            initSlots(grid, slots, photoInput);

            // Asigna listeners al CLON, no al template original
            photoInput.onchange = async () => {
                const files = Array.from(photoInput.files).slice(0, 10);
                for (const file of files) {
                    try {
                        const tinyUrl = await resizeAndCompress(file, 800, 0.7);
                        const img = new Image();
                        img.src = tinyUrl;
                        img.onload = () => {
                            const slot = slots.find(s => !s.querySelector('img'));
                            if (!slot) return;
                            slot.innerHTML = '';
                            slot.appendChild(img);
                            img.naturalWidth > img.naturalHeight
                                ? slot.classList.add('horizontal')
                                : slot.classList.remove('horizontal');
                        };
                    } catch (err) {
                        console.error('Error comprimiendo imagen', err);
                    }
                }
            };

            // Eventos drag & drop en el CLON
            let dragSrc = null;
            clone.addEventListener('dragstart', e => {
                if (e.target.closest('.photo-slot img')) {
                    dragSrc = e.target.closest('.photo-slot');
                }
            });
            clone.addEventListener('dragover', e => {
                if (e.target.closest('.photo-slot')) {
                    e.preventDefault();
                }
            });
            clone.addEventListener('drop', e => {
                const dest = e.target.closest('.photo-slot');
                if (dest && dragSrc && dest !== dragSrc) {
                    const tmpHTML = dragSrc.innerHTML;
                    const tmpClass = dragSrc.className;
                    dragSrc.innerHTML = dest.innerHTML;
                    dragSrc.className = dest.className;
                    dest.innerHTML = tmpHTML;
                    dest.className = tmpClass;
                }
            });

            // Logo clicks
            clone.querySelectorAll('.logo').forEach(logoImg => {
                const side = logoImg.id.split('-')[1];
                logoImg.addEventListener('click', () => uploadLogo(side));
            });

            report.appendChild(clone);
        });
}


loadPageTemplate();
