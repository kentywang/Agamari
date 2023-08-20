const express = require('express'), morgan = require('morgan'), path = require('path');
const applyMiddleware = app => {
    app.use(require('cookie-session')({
        name: 'session',
        keys: [process.env.SESSION_SECRET || 'an insecure secret key'],
    }))
        .use(morgan('dev'))
        .use(express.static(path.join(__dirname, '..', 'public')))
        .use('/materialize-css', express.static(path.join(__dirname, '..', 'node_modules', 'materialize-css', 'dist')));
};
module.exports = { applyMiddleware };
//# sourceMappingURL=middleware.js.map