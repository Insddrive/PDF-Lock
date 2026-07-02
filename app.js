// Service Worker ਰਜਿਸਟਰ ਕਰਨਾ (PWA ਲਈ)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker ਰਜਿਸਟਰ ਹੋ ਗਿਆ!'))
            .catch(err => console.log('ਸਰਵਿਸ ਵਰਕਰ ਵਿੱਚ ਗਲਤੀ:', err));
    });
}

async function securePDF() {
    const fileInput = document.getElementById('pdfFile');
    const userPassword = document.getElementById('userPassword').value;
    const ownerPassword = document.getElementById('ownerPassword').value;
    const statusDiv = document.getElementById('status');

    // ਵੈਲੀਡੇਸ਼ਨ ਚੈੱਕ
    if (fileInput.files.length === 0 || !userPassword || !ownerPassword) {
        statusDiv.style.color = "red";
        statusDiv.innerText = "ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੀ ਜਾਣਕਾਰੀ ਭਰੋ!";
        return;
    }

    statusDiv.style.color = "blue";
    statusDiv.innerText = "ਪ੍ਰੋਸੈਸਿੰਗ ਚੱਲ ਰਹੀ ਹੈ...";

    const file = fileInput.files[0];
    const fileReader = new FileReader();

    fileReader.onload = async function () {
        try {
            const pdfBytes = new Uint8Array(this.result);
            
            // PDF ਫਾਈਲ ਨੂੰ ਲੋਡ ਕਰੋ
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

            // ਪਾਸਵਰਡ ਅਤੇ ਪਰਮਿਸ਼ਨਾਂ ਲਾਗੂ ਕਰਨਾ
            await pdfDoc.encrypt({
                userPassword: userPassword,
                ownerPassword: ownerPassword,
                permissions: {
                    printing: 'notAllowed',   // ਪਾਸਵਰਡ A ਨਾਲ ਪ੍ਰਿੰਟਿੰਗ ਬੰਦ
                    modifying: 'notAllowed',  // ਬਦਲਾਅ ਬੰਦ
                    copying: 'notAllowed',    // ਟੈਕਸਟ ਕਾਪੀ ਕਰਨਾ ਬੰਦ
                    annotating: 'notAllowed'  // ਨੋਟਸ ਲਿਖਣਾ ਬੰਦ
                }
            });

            // ਸੁਰੱਖਿਅਤ ਹੋਈ PDF ਦਾ ਡੇਟਾ ਤਿਆਰ ਕਰੋ
            const securedPdfBytes = await pdfDoc.save();

            // ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਡਾਊਨਲੋਡ ਕਰਵਾਉਣ ਦਾ ਸਭ ਤੋਂ ਪੱਕਾ ਤਰੀਕਾ
            const blob = new Blob([securedPdfBytes], { type: "application/pdf" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = "secured_" + file.name;
            
            // ਲਿੰਕ ਨੂੰ DOM ਵਿੱਚ ਜੋੜ ਕੇ ਕਲਿੱਕ ਕਰਨਾ (ਮੋਬਾਈਲ ਅਤੇ ਡੈਸਕਟੌਪ ਦੋਵਾਂ ਲਈ)
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            statusDiv.style.color = "green";
            statusDiv.innerText = "PDF ਸੁਰੱਖਿਅਤ ਹੋ ਕੇ ਡਾਊਨਲੋਡ ਹੋ ਚੁੱਕੀ ਹੈ!";
        } catch (error) {
            statusDiv.style.color = "red";
            statusDiv.innerText = "ਗਲਤੀ: ਇਹ PDF ਪਹਿਲਾਂ ਹੀ ਲਾਕ ਹੈ ਜਾਂ ਇਸਦਾ ਫਾਰਮੈਟ ਸਪੋਰਟ ਨਹੀਂ ਕਰਦਾ।";
            console.error(error);
        }
    };

    fileReader.readAsArrayBuffer(file);
}
