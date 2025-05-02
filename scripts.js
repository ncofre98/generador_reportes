function uploadLogo(side) {
    const input = document.getElementById('logo-input');
    input.onchange = () => {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                const logo = document.getElementById('logo-' + side);
                logo.innerHTML = '<img src="' + e.target.result + '" />';
                logo.style.outline = 'none';
            };
            reader.readAsDataURL(file);
            console.log(e.target)
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

photoInput.onchange = () => {
    const files = Array.from(photoInput.files);
    files.slice(0, 10).forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const slot = slots.find(s => !s.querySelector('img'));
                if (slot) {
                    slot.innerHTML = '';
                    slot.appendChild(img);
                    if (img.naturalWidth > img.naturalHeight) {
                        slot.classList.add('horizontal');
                    } else {
                        slot.classList.remove('horizontal');
                    }
                }
            };
        };
        reader.readAsDataURL(file);
    });
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

function exportPDF() {
    html2pdf().set({
        margin: 0.5,
        filename: 'reporte.pdf',
        html2canvas: { scale: 2 }
    }).from(document.getElementById('report')).save();
}