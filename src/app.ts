import express from 'express';
import bodyParser  from 'body-parser';
// import cors from 'cors';
import db from './repo/index';

// // express 객체 만들기
// const app: express.Application = express();

// // bodyparser 미들웨어 등록
// app.use(bodyParser.json());

// // test root path
// app.get('/', (req: express.Request, res: express.Response) => {
//   res.send('hello express');
// });

// app.get('/posts', (req: express.Request, res: express.Response) => {
//   res.json([
//     { id: 1, content: 'hello' },
//     { id: 2, content: 'hello2' },
//     { id: 3, content: 'hello3' },
//   ]);
// });

// // DB Connection 
// db.mongoose
//   .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true }) 
//   .then(() => { 
//     console.log('db.url', db.url); 
//     // console.log('db.mongoose', db.mongoose); 
//     console.log('db.test.db', db.test.db); 
//     console.log('db.accessary.db', db.accessary.db); 
//     console.log('Database Connection Success.'); }) 
//   .catch((err : any) => { 
//     console.log('Database Connection Failure.', err); 
//     process.exit(); 
//   });



// // 3010 포트로 서버 실행
// app.listen(3010, () => {
//   console.log('실행중');
// });


class App {
  public app: express.Application;
  public port: number;

  constructor(controllers : any, port : any) {
    this.app = express();
    this.port = port;
 
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }
  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
  }

  private initializeNoSQL() {
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
  }
 
  private initializeControllers(controllers : any) {
    controllers.forEach((controller : any) => {
      this.app.use('/', controller.router);
    });
  }
 
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
}

export default App;



