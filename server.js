const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const cors = require('cors');

const app = express();
app.use(cors()); // PWA ਨੂੰ API ਨਾਲ ਜੋੜਨ ਲਈ ਜ਼ਰੂਰੀ

// ਫਾਈਲ ਅਪਲੋਡ ਲੈਣ ਲਈ multer ਦੀ ਵਰਤੋਂ
const upload = multer({ storage: multer.memoryStorage() });

// API Endpoint (ਇੱਥੇ ਮੋਬਾਈਲ ਤੋਂ ਡੇਟਾ ਆਵੇਗਾ)
app.post('/api/secure-pdf', upload.single('pdfFile'), async (req, res) => {
    try {
        const userPassword = req.body.userPassword;
        const ownerPassword = req.body.ownerPassword;
        
        // 1. ਮੋਬਾਈਲ ਤੋਂ ਆਈ PDF ਫਾਈਲ ਨੂੰ ਲੋਡ ਕਰੋ
        const pdfDoc = await PDFDocument.load(req.file.buffer, { ignoreEncryption: true });

        // 2. ਸਰਵਰ 'ਤੇ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਪਾਸਵਰਡ ਲਗਾਓ
        await pdfDoc.encrypt({
            userPassword: userPassword,
            ownerPassword: ownerPassword,
            permissions: {
                printing: 'notAllowed',
                modifying: 'notAllowed',
                copying: 'notAllowed'
            }
        });

        // 3. ਲਾਕ ਹੋਈ PDF ਦੇ ਬਾਈਟਸ ਤਿਆਰ ਕਰੋ
        const securedPdfBytes = await pdfDoc.save();

        // 4. ਲਾਕ ਫਾਈਲ ਵਾਪਸ ਮੋਬਾਈਲ ਨੂੰ ਭੇਜੋ
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="locked_file.pdf"');
        res.send(Buffer.from(securedPdfBytes));

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "PDF ਪ੍ਰੋਸੈਸ ਕਰਨ ਵਿੱਚ ਗਲਤੀ ਆਈ ਹੈ।" });
    }
});

// ਸਰਵਰ ਚਾਲੂ ਕਰਨਾ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API ਸਰਵਰ ਪੋਰਟ ${PORT} 'ਤੇ ਚੱਲ ਰਿਹਾ ਹੈ`);
});
