import express from 'express';
var app = express();

app.use(express.static('www'));

app.listen('3000');
console.log('working on 3000');