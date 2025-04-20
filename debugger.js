const debuggerMiddleware = (req, res, next) => {
    console.log('--- Debugger Middleware ---');
    console.log('Método:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
  };
  
  module.exports = debuggerMiddleware;