function resizeAndCompress(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(maxWidth / img.width, 1);
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            blob => {
              const url = URL.createObjectURL(blob);
              resolve(url);
            },
            'image/jpeg',
            quality
          );
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function uploadLogo(side) {
    const input = document.getElementById('logo-input');
    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        try {
          // 1) Redimensiona y comprime el logo
          const tinyUrl = await resizeAndCompress(file, 200, 0.8);
          // 2) Inserta el logo comprimido
          const logo = document.getElementById('logo-' + side);
          logo.innerHTML = `<img src="${tinyUrl}" />`;
          logo.style.outline = 'none';
        } catch (err) {
          console.error('Error comprimiendo logo', err);
          // Si falla, recurre al DataURL original:
          const reader = new FileReader();
          reader.onload = e => {
            const logo = document.getElementById('logo-' + side);
            logo.innerHTML = `<img src="${e.target.result}" />`;
            logo.style.outline = 'none';
          };
          reader.readAsDataURL(file);
        }
      }
    };
    input.click();
  }

const grid = document.getElementById('row-5');
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
