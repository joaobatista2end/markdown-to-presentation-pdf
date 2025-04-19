const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const port = 3000;

// Configuração do multer para upload de arquivos
const upload = multer({ dest: os.tmpdir() });

// Middleware para permitir JSON
app.use(express.json());

// Endpoint para converter markdown para PDF
app.post('/convert', upload.single('markdown'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const inputFile = req.file.path;
    const outputFile = path.join(os.tmpdir(), `${Date.now()}.pdf`);

    // Comando para converter usando Marp
    const command = `marp "${inputFile}" --pdf -o "${outputFile}"`;

    exec(command, (error, stdout, stderr) => {
        // Limpar arquivo de entrada
        fs.unlinkSync(inputFile);

        if (error) {
            console.error('Erro na conversão:', error);
            return res.status(500).json({ error: 'Erro na conversão do arquivo' });
        }

        // Enviar o arquivo PDF
        res.download(outputFile, 'converted.pdf', (err) => {
            // Limpar arquivo de saída após o download
            fs.unlinkSync(outputFile);
            if (err) {
                console.error('Erro ao enviar arquivo:', err);
            }
        });
    });
});

// Rota de teste
app.get('/', (req, res) => {
    res.send('Servidor de conversão Markdown para PDF está rodando!');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
}); 