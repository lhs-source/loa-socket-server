import express from 'express';
import bodyParser  from 'body-parser';
import cors from 'cors';
import db from './repo/index';

class App {
  public app: express.Application;
  public port: number;

  constructor(controllers : any, port : any) {
    this.app = express();
    this.port = port;
 
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeNoSQL();
  }
  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(cors());
  }

  private initializeNoSQL() {
    db.mongoose
        .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true }) 
        .then(() => { 
          console.log('db.url', db.url); 
          console.log('Database Connection Success.'); }) 
        .catch((err : any) => { 
          console.log('Database Connection Failure.', err); 
          process.exit(); 
        });
  }
 
  private initializeControllers(controllers : any) {
    controllers.forEach((controller : any) => {
      this.app.use('/api/', controller.router);
    });
  }
 
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
}

export default App;



