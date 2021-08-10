import App from './app';
import AccessaryController from './controller/accessary.controller';
 
const app = new App(
  [
    new AccessaryController(),
  ],
  5000,
);
 
app.listen();