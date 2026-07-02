async function processPDF(type) {
    const fileInput = document.getElementById('pdfFile');
    const statusDiv = document.getElementById('status');
    const password = type === 'A' ? document.getElementById('passA').value : document.getElementById('passB').value;

    if (fileInput.files.length === 0 || !password) {
        statusDiv.innerText = "Please select a file and enter a password!";
        return;
    }

    statusDiv.innerText = "Processing...";
    const formData = new FormData();
    formData.append('pdfFile', fileInput.files[0]);
    formData.append('password', password);
    formData.append('type', type);

    const response = await fetch('/api/secure-pdf', { method: 'POST', body: formData });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Secured_PDF_${type}.pdf`;
    link.click();
    statusDiv.innerText = "Success! Download started.";
}
