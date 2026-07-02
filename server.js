const express = require('express');
const multer = require('multer');
const { encryptPDF } = require('@pdfsmaller/pdf-encrypt');
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static(__dirname));

app.post('/api/secure-pdf', upload.single('pdfFile'), async (req, res) => {
    const { password, type } = req.body;
    
    // Type A: No printing allowed | Type B: Printing allowed
    const canPrint = (type === 'B');

    const encryptedBytes = await encryptPDF(req.file.buffer, password, {
        ownerPassword: password,
        allowPrinting: canPrint,
        allowModifying: false,
        allowCopying: false
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(encryptedBytes));
});

app.listen(3000);
