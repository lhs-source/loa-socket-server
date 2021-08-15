import * as express from 'express';
import moment from 'moment';

import db from '../repo/index';


class LogController {
    public path = '/stat'
    public router = express.Router();
    
    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get(`${this.path}`, this.getLogCount);
        this.router.get(`${this.path}/price`, this.getLogPrice);
    }

    getLogCount = (request: express.Request, response: express.Response) => {
        console.log('getLogCount start');
        db.logSocket.find({}).sort({count: -1}).then((res: any[]) => {
            response.send(res);
        })
    }
    getLogPrice = (request: express.Request, response: express.Response) => {
        console.log('getLogPrice start');
        db.logAccComposition.find({}).sort({createdAt: -1}).then((res: any[]) => {
            response.send(res);
        })
    }
}

export default LogController;











