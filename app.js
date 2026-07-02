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
    statusDiv.innerText = "API ਰਾਹੀਂ ਫਾਈਲ ਸੁਰੱਖਿਅਤ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ, ਕਿਰਪਾ ਕਰਕੇ ਉਡੀਕ ਕਰੋ...";

    // 1. ਡੇਟਾ ਦਾ ਪੈਕੇਟ (FormData) ਤਿਆਰ ਕਰਨਾ
    const formData = new FormData();
    formData.append('pdfFile', fileInput.files[0]);
    formData.append('userPassword', userPassword);
    formData.append('ownerPassword', ownerPassword);

    try {
        // 2. ਆਪਣੀ API ਨੂੰ ਰਿਕਵੈਸਟ ਭੇਜੋ 
        // (ਨੋਟ: ਲਾਈਵ ਹੋਣ 'ਤੇ http://localhost:3000 ਦੀ ਜਗ੍ਹਾ Vercel/Firebase ਦਾ ਲਿੰਕ ਆਵੇਗਾ)
        const response = await fetch('http://localhost:3000/api/secure-pdf', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error("API ਨੇ ਗਲਤੀ ਦਿੱਤੀ ਹੈ");
        }

        // 3. API ਤੋਂ ਵਾਪਸ ਆਈ ਲਾਕ PDF ਨੂੰ ਪ੍ਰਾਪਤ ਕਰਨਾ
        const blob = await response.blob();
        
        // 4. ਮੋਬਾਈਲ ਵਿੱਚ ਆਟੋਮੈਟਿਕ ਡਾਊਨਲੋਡ ਕਰਵਾਉਣਾ
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = "Secured_" + fileInput.files[0].name;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        statusDiv.style.color = "green";
        statusDiv.innerText = "ਸਫ਼ਲਤਾ! PDF ਲਾਕ ਹੋ ਕੇ ਡਾਊਨਲੋਡ ਹੋ ਗਈ ਹੈ।";

    } catch (error) {
        statusDiv.style.color = "red";
        statusDiv.innerText = "ਗਲਤੀ: API ਨਾਲ ਸੰਪਰਕ ਨਹੀਂ ਹੋ ਸਕਿਆ ਜਾਂ ਫਾਈਲ ਸਪੋਰਟਡ ਨਹੀਂ ਹੈ।";
        console.error(error);
    }
}
