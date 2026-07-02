const express = require('express');
const multer = require('multer');
const { encryptPDF } = require('@pdfsmaller/pdf-encrypt');
const cors = require('cors');
const path = require('path'); 

const app = express();
app.use(cors()); 

// ਸਾਰੀਆਂ ਫਾਈਲਾਂ (CSS, JS, Images) ਨੂੰ ਚਲਾਉਣ ਲਈ
app.use(express.static(path.join(__dirname))); 

// ਮੁੱਖ ਪੇਜ 'ਤੇ index.html ਦਿਖਾਉਣ ਲਈ (ਇਹ ਲਾਈਨ Cannot GET / ਐਰਰ ਠੀਕ ਕਰੇਗੀ)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/secure-pdf', upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "ਕੋਈ ਫਾਈਲ ਨਹੀਂ ਮਿਲੀ" });
        }

        const userPassword = req.body.userPassword;
        const ownerPassword = req.body.ownerPassword;
        
        const encryptedBytes = await encryptPDF(req.file.buffer, userPassword, {
            ownerPassword: ownerPassword,
            allowPrinting: false,
            allowModifying: false,
            allowCopying: false
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="locked_file.pdf"');
        res.send(Buffer.from(encryptedBytes));

    } catch (error) {
        console.error("ਸਰਵਰ ਵਿੱਚ ਗਲਤੀ ਆਈ ਹੈ:", error);
        res.status(500).json({ error: "PDF ਪ੍ਰੋਸੈਸ ਕਰਨ ਵਿੱਚ ਗਲਤੀ ਆਈ ਹੈ।" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`ਸਰਵਰ ਚਾਲੂ ਹੈ ਪੋਰਟ ${PORT} 'ਤੇ`);
});
