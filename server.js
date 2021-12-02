const express = require('express');
const app = express();
const PORT = process.env.PORT || 4111;

const ParserRoute = require('./router');
app.use(ParserRoute);
app.listen(PORT, () => console.log('Express server is running on port ', PORT));