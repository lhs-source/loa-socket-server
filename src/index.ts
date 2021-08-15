import App from './app';
import AccessaryController from './controller/accessary.controller';
import StatisticsController from './controller/statistics.controller';
 
const app = new App(
  [
    new AccessaryController(),
    new StatisticsController(),
  ],
  5000,
);
 
app.listen();