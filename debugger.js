export const debuggerMiddleware = (req, res, next) => {
    console.log('--- Nova Requisição ---');
    console.log('Método:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body); // Se você estiver usando express.json() ou um body-parser
    next();
};