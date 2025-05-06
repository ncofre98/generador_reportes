export function uploadLogo(logoElement) {
    const input = logoElement.nextElementSibling;
    if (!input || !input.classList.contains('logo-input')) return;
    
    input.click();
    input.onchange = e => {
        const file = e.target.files[0];
        if (file) {
            logoElement.innerHTML = '';
            const img = new Image();
            img.src = URL.createObjectURL(file);
            logoElement.appendChild(img);
        }
    };
}