const express = require('express');
const multer = require('multer');
const { encryptPDF } = require('@pdfsmaller/pdf-encrypt');
const cors = require('cors');

const app = express();
app.use(cors()); // PWA ਨੂੰ API ਨਾਲ ਜੋੜਨ ਲਈ ਜ਼ਰੂਰੀ

// ਫਾਈਲ ਅਪਲੋਡ ਲੈਣ ਲਈ multer ਦੀ ਵਰਤੋਂ
const upload = multer({ storage: multer.memoryStorage() });

// API Endpoint
app.post('/api/secure-pdf', upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "ਕੋਈ ਫਾਈਲ ਨਹੀਂ ਮਿਲੀ" });
        }

        const userPassword = req.body.userPassword;
        const ownerPassword = req.body.ownerPassword;
        
        // 1. ਮੋਬਾਈਲ ਤੋਂ ਆਈ PDF ਫਾਈਲ 'ਤੇ ਪਾਸਵਰਡ ਲਗਾਓ
        const encryptedBytes = await encryptPDF(req.file.buffer, userPassword, {
            ownerPassword: ownerPassword,
            allowPrinting: false,
            allowModifying: false,
            allowCopying: false
        });

        // 2. ਲਾਕ ਫਾਈਲ ਵਾਪਸ ਮੋਬਾਈਲ ਨੂੰ ਭੇਜੋ
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="locked_file.pdf"');
        res.send(Buffer.from(encryptedBytes));

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
