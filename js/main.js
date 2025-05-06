import { resizeAndCompress } from "./compressPhoto.js";
import { uploadLogo } from "./uploadLogo.js";

const grid = document.getElementById('grid');
const photoInput = document.getElementById('photo-input');
let slots = [];

function initSlots() {
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

photoInput.onchange = async () => {
    const files = Array.from(photoInput.files).slice(0, 10);
    for (const file of files) {
      try {
        // 1) Redimensiona y comprime la foto
        const tinyUrl = await resizeAndCompress(file, 800, 0.7);
        // 2) Inserta la foto comprimida
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

initSlots();

let dragSrc = null;
document.addEventListener('dragstart', e => {
    if (e.target.closest('.photo-slot img')) {
        dragSrc = e.target.closest('.photo-slot');
    }
});
document.addEventListener('dragover', e => {
    if (e.target.closest('.photo-slot')) {
        e.preventDefault();
    }
});
document.addEventListener('drop', e => {
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

function duplicatePage() {
    const report = document.getElementById('report');
    const pages = document.querySelectorAll('.page');
    const lastPage = pages[pages.length - 1];

    report.appendChild(lastPage.cloneNode(true));
}

/* Event Listeners */

document.querySelectorAll('.logo').forEach(logoImg => {
    const side = logoImg.id.split('-')[1];
    logoImg.addEventListener('click', () => uploadLogo(side));
});

document.getElementById('duplicate-last').addEventListener('click', duplicatePage);