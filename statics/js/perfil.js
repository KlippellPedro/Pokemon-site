/**
 * Lógica para Preview de Imagem e validação de senha no Perfil
 */
document.addEventListener('DOMContentLoaded', () => {
    const inputFoto = document.querySelector('input[type="file"]');
    const imgPreview = document.querySelector('.perfil-foto'); // Assume que sua tag img tem essa classe

    if (inputFoto && imgPreview) {
        inputFoto.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                // Validação visual de tamanho antes do upload
                if (file.size > 2 * 1024 * 1024) {
                    alert("A imagem deve ter no máximo 2MB!");
                    this.value = "";
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => imgPreview.src = e.target.result;
                reader.readAsDataURL(file);
            }
        });
    }
});