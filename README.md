# Servidor de Conversão Markdown para PDF

Este é um servidor Express que converte arquivos Markdown para PDF usando o Marp CLI. O servidor é containerizado usando Docker para fácil implantação e uso.

## Requisitos

- Docker
- Docker Compose

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd [NOME_DO_REPOSITÓRIO]
```

2. Construa e inicie o container:
```bash
docker-compose up --build
```

O servidor estará disponível em `http://localhost:3000`.

## Endpoints

### POST /convert

Converte um arquivo Markdown para PDF.

**Parâmetros:**
- `markdown`: Arquivo Markdown a ser convertido (multipart/form-data)

**Resposta:**
- Sucesso: Arquivo PDF para download
- Erro: JSON com mensagem de erro

**Exemplo de uso com curl:**
```bash
curl -X POST -F "markdown=@seu_arquivo.md" http://localhost:3000/convert --output converted.pdf
```

**Exemplo de uso com Python:**
```python
import requests

url = "http://localhost:3000/convert"
files = {"markdown": open("seu_arquivo.md", "rb")}
response = requests.post(url, files=files)

with open("converted.pdf", "wb") as f:
    f.write(response.content)
```

### GET /

Rota de teste para verificar se o servidor está rodando.

**Resposta:**
- String: "Servidor de conversão Markdown para PDF está rodando!"

## Estrutura do Projeto

```
.
├── Dockerfile
├── docker-compose.yml
├── package.json
├── server.js
└── README.md
```

## Configurações do Container

O container está configurado com:
- Node.js 18 Alpine
- Chromium para renderização
- Marp CLI e Marp Core
- Configurações otimizadas para conversão

## Variáveis de Ambiente

- `NODE_ENV`: Ambiente de execução (production/development)
- `CHROME_PATH`: Caminho para o executável do Chromium
- `CHROME_LAUNCH_OPTIONS`: Opções de inicialização do Chromium
- `PUPPETEER_TIMEOUT`: Timeout para operações do Puppeteer
- `NODE_OPTIONS`: Opções do Node.js
- `DEBUG`: Nível de log do Marp CLI

## Segurança

O container é executado com:
- Usuário não-root
- Permissões limitadas
- Configurações de segurança do Chromium

## Limitações

- Tamanho máximo do arquivo: Limitado pela configuração do servidor
- Timeout: 120 segundos para conversão
- Memória: 8GB máximo para o Node.js

## Solução de Problemas

### Erros Comuns

1. **Timeout na conversão**
   - Verifique o tamanho do arquivo Markdown
   - Aumente o timeout se necessário

2. **Erro de permissão**
   - Verifique as permissões dos diretórios temporários
   - Execute o container com as permissões corretas

3. **Erro de conversão**
   - Verifique o formato do arquivo Markdown
   - Consulte os logs do container

### Logs

Para ver os logs do container:
```bash
docker-compose logs -f
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes. 