"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
// import cors from 'cors';
var index_1 = __importDefault(require("./repo/index"));
// import postRouter from './routes/post';
var app = express_1.default();
// get
app.get('/', function (req, res) {
    res.send('hello express');
});
app.get('/posts', function (req, res) {
    res.json([
        { id: 1, content: 'hello' },
        { id: 2, content: 'hello2' },
        { id: 3, content: 'hello3' },
    ]);
});
// DB Connection 
index_1.default.mongoose
    .connect(index_1.default.url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(function () {
    console.log('db.url', index_1.default.url);
    console.log('db.mongoose', index_1.default.mongoose);
    console.log('db.tutorial.db', index_1.default.test.db);
    console.log('Database Connection Success.');
})
    .catch(function (err) {
    console.log('Database Connection Failure.', err);
    process.exit();
});
// 3010 포트로 서버 실행
app.listen(3010, function () {
    console.log('실행중');
});
