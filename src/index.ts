import express from 'express';
import bodyParser  from 'body-parser';
// import cors from 'cors';
import db from './repo/index';

// import postRouter from './routes/post';
const app: express.Application = express();

// get
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('hello express');
});

app.get('/posts', (req: express.Request, res: express.Response) => {
  res.json([
    { id: 1, content: 'hello' },
    { id: 2, content: 'hello2' },
    { id: 3, content: 'hello3' },
  ]);
});

// DB Connection 
db.mongoose
  .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true }) 
  .then(() => { 
    console.log('db.url', db.url); 
    // console.log('db.mongoose', db.mongoose); 
    console.log('db.test.db', db.test.db); 
    console.log('db.accessary.db', db.accessary.db); 
    console.log('Database Connection Success.'); }) 
  .catch((err : any) => { 
    console.log('Database Connection Failure.', err); 
    process.exit(); 
  });



// 3010 포트로 서버 실행
app.listen(3010, () => {
  console.log('실행중');
});