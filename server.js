import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { Marp } from '@marp-team/marp-core';
import { debuggerMiddleware } from './debugger.js';  // Atualize o caminho se necessário
import puppeteer from 'puppeteer';
import { run as mermaid } from '@mermaid-js/mermaid-cli';

const app = express();
const port = 3000;
const upload = multer({ dest: os.tmpdir() });

// Import dos middlewares
app.use(express.json());
app.use(debuggerMiddleware);

// Converter router
app.post('/', upload.single('markdown'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const inputFile = req.file.path;
    const outputFile = path.join(os.tmpdir(), `${Date.now()}.pdf`);

    const handleErrorParseFile = (error) => {
        console.error('Erro na conversão:', error);
        fs.unlinkSync(inputFile); // Limpar o arquivo de entrada em caso de erro
        res.status(500).json({ error: 'Erro na conversão do arquivo' });
    }

    const downloadPdfFile = () => {
        res.download(outputFile, 'converted.pdf', (err) => {
            fs.unlinkSync(outputFile);
            if (err) {
                console.error('Erro ao enviar arquivo:', err);
            }
        });
    }

    const parsePdfFile = async () => {
        try {
            const markdown = fs.readFileSync(inputFile, 'utf-8');
            const marp = new Marp();
            const { html, css } = marp.render(markdown);
            console.log('Puppeteer executablePath:', puppeteer.executablePath()); // Adicione esta linha
            const browser = await puppeteer.launch({
                headless: 'new',
                executablePath: process.env.CHROME_PATH, // Garanta que está usando a variável de ambiente
                args: process.env.CHROME_LAUNCH_OPTIONS ? process.env.CHROME_LAUNCH_OPTIONS.split(' ') : []
            });
            const page = await browser.newPage();
            await page.setContent(`<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`);
            await page.pdf({ path: outputFile, format: 'A4' });
            await browser.close();
            fs.unlinkSync(inputFile);
        } catch (error) {
            handleErrorParseFile(error)
        }
    }

    await parsePdfFile();
    downloadPdfFile();
});


app.post('/mermaid', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const inputFile = req.file.path;  // Caminho temporário do arquivo .mmd
    const outputFileName = `${Date.now()}.png`;  // Nome do arquivo de saída
    const outputFile = path.join(os.tmpdir(), outputFileName);  // Caminho para salvar o arquivo de saída

    try {
        // Chama o mermaid passando o caminho do arquivo .mmd e o caminho de saída
        await mermaid(inputFile, outputFile);

        // Envia o arquivo gerado de volta para o cliente
        res.download(outputFile, outputFileName, (err) => {
            fs.unlinkSync(outputFile);  // Apaga o arquivo de saída após o envio
            fs.unlinkSync(inputFile);  // Apaga o arquivo de entrada após o uso
            if (err) {
                console.error('Erro ao enviar o arquivo:', err);
            }
        });
    } catch (error) {
        console.error('Erro ao gerar o diagrama:', error);
        res.status(500).json({ error: 'Erro ao gerar o diagrama Mermaid' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});