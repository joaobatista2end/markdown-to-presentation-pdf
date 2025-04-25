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

    const inputFile = req.file.path;
    const outputFileName = `${Date.now()}.png`;
    const outputFile = path.join(os.tmpdir(), outputFileName);

    try {
        // Configurações adicionais para o mermaid-cli com resolução aumentada
        const mermaidConfig = {
            puppeteerConfig: {
                timeout: 60000,
                args: [
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-setuid-sandbox',
                    '--force-device-scale-factor=2' // Força o DPI para 2x
                ],
                defaultViewport: {
                    width: 1920,
                    height: 1080,
                    deviceScaleFactor: 2 // Aumenta a densidade de pixels
                }
            },
            // Configurações específicas para melhorar a qualidade da imagem
            outputFormat: 'png',
            outputQuality: 100,
            backgroundColor: 'white',
            width: 1920, // Aumenta a largura
            height: 1080, // Aumenta a altura
            css: `
                .mermaid {
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                }
                .node rect, .node circle, .node ellipse, .node polygon {
                    fill: #f9f9f9;
                    stroke: #333;
                    stroke-width: 2px;
                }
                .edgePath path {
                    stroke: #333;
                    stroke-width: 2px;
                }
            `
        };

        // Chama o mermaid com as configurações personalizadas
        await mermaid(inputFile, outputFile, mermaidConfig);

        // Envia o arquivo gerado de volta para o cliente
        res.download(outputFile, outputFileName, (err) => {
            // Limpeza dos arquivos temporários
            try {
                if (fs.existsSync(outputFile)) {
                    fs.unlinkSync(outputFile);
                }
                if (fs.existsSync(inputFile)) {
                    fs.unlinkSync(inputFile);
                }
            } catch (cleanupError) {
                console.error('Erro ao limpar arquivos temporários:', cleanupError);
            }
            
            if (err) {
                console.error('Erro ao enviar o arquivo:', err);
            }
        });
    } catch (error) {
        console.error('Erro ao gerar o diagrama:', error);
        
        // Limpeza em caso de erro
        try {
            if (fs.existsSync(inputFile)) {
                fs.unlinkSync(inputFile);
            }
        } catch (cleanupError) {
            console.error('Erro ao limpar arquivo temporário:', cleanupError);
        }

        // Resposta de erro mais detalhada
        res.status(500).json({ 
            error: 'Erro ao gerar o diagrama Mermaid',
            details: error.message
        });
    }
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});