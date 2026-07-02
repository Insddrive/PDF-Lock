if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => console.log(err));
    });
}

async function securePDF() {
    const fileInput = document.getElementById('pdfFile');
    const userPassword = document.getElementById('userPassword').value;
    const ownerPassword = document.getElementById('ownerPassword').value;
    const statusDiv = document.getElementById('status');

    if (fileInput.files.length === 0 || !userPassword || !ownerPassword) {
        statusDiv.style.color = "red";
        statusDiv.innerText = "ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੀ ਜਾਣਕਾਰੀ ਭਰੋ!";
        return;
    }

    statusDiv.style.color = "blue";
    statusDiv.innerText = "PDF ਦੀ ਬਣਤਰ ਚੈੱਕ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...";

    const file = fileInput.files[0];
    const fileReader = new FileReader();

    fileReader.onload = async function () {
        try {
            const pdfBytes = new Uint8Array(this.result);
            
            // ਫਾਈਲ ਨੂੰ ਸੁਰੱਖਿਅਤ ਮੋਡ ਵਿੱਚ ਲੋਡ ਕਰਨਾ
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true });

            statusDiv.innerText = "ਪਾਸਵਰਡ ਅਤੇ ਪਰਮਿਸ਼ਨਾਂ ਲਾਗੂ ਹੋ ਰਹੀਆਂ ਹਨ...";

            // ਬ੍ਰਾਊਜ਼ਰ ਕੰਪੈਟੇਬਿਲਟੀ ਮੁਤਾਬਕ ਏਨਕ੍ਰਿਪਸ਼ਨ ਸੈਟਿੰਗਜ਼
            await pdfDoc.encrypt({
                userPassword: userPassword,
                ownerPassword: ownerPassword,
                permissions: {
                    printing: 'notAllowed',
                    modifying: 'notAllowed',
                    copying: 'notAllowed',
                    annotating: 'notAllowed'
                }
            });

            const securedPdfBytes = await pdfDoc.save();

            // ਡਾਊਨਲੋਡ ਪ੍ਰਕਿਰਿਆ
            const blob = new Blob([securedPdfBytes], { type: "application/pdf" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = "secured_" + file.name;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            statusDiv.style.color = "green";
            statusDiv.innerText = "ਸਫ਼ਲਤਾ! PDF ਲਾਕ ਹੋ ਕੇ ਡਾਊਨਲੋਡ ਹੋ ਚੁੱਕੀ ਹੈ।";
        } catch (error) {
            statusDiv.style.color = "red";
            statusDiv.innerText = "ਗਲਤੀ: ਇਸ PDF ਦਾ ਅੰਦਰੂਨੀ ਢਾਂਚਾ (Structure) ਸਿੱਧਾ ਲਾਕਿੰਗ ਸਪੋਰਟ ਨਹੀਂ ਕਰਦਾ।\nਕਿਰਪਾ ਕਰਕੇ ਕੋਈ ਹੋਰ PDF ਟੈਸਟ ਕਰੋ।";
            console.error(error);
        }
    };

    fileReader.readAsArrayBuffer(file);
}
