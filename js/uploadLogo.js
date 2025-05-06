function uploadLogo(side) {
    const input = document.getElementById('logo-input');
    console.log(input);
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

  export { uploadLogo };