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
        this.router.put(`${this.path}/price`, this.putLogPrice);
    }

    getLogCount = (request: express.Request, response: express.Response) => {
        console.log('getLogCount start');
        db.logSocket.find({})
            .sort({count: -1})
            .limit(300)
            .then((res: any[]) => {
            response.send(res);
        })
    }
    getLogPrice = (request: express.Request, response: express.Response) => {
        console.log('getLogPrice start');
        db.logAccComposition.find({})
            .sort({createdAt: -1})
            .limit(300)
            .then((res: any[]) => {
            response.send(res);
        })
    }
    putLogPrice = (request: express.Request, response: express.Response) => {
        console.log('putLogPrice start');
        let body = request.body;
        let scheme: any = {
            grade: body.grade,
            socket: body.socket,
            property: body.property,
            price: body.price,
        }
        console.log('log!', scheme);
        let logAcc = new db.logAccComposition(scheme);
        logAcc.save().then((res: any) => {
            response.send('saved');
        });
    }
}

export default LogController;











