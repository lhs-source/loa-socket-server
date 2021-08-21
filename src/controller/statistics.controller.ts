import * as express from 'express';
import moment from 'moment';
import { Socket } from '../constants/SocketList';

import db from '../repo/index';


class LogController {
    public path = '/stat'
    public router = express.Router();
    
    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get(`${this.path}`, this.getLogCount);
        this.router.put(`${this.path}`, this.putLogCount);
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
    putLogCount = (request: express.Request, response: express.Response) => {
        console.log('putLogCount start');
        let body = request.body;
        console.log(body);

        checkExistCount(body.grade, body.socketList).then((res: any) => {
            if(!res) {
                // 없으면 새로 만들기
                console.log('save new count log');
                saveCount(body.grade, body.socketList, body.needNumber);
                response.send({count: 1});
            } else {
                // 있으면 카운트 증가
                console.log('save exist count log');
                updateCount(res);
                response.send({count: res.count});
            }
        })
        .catch((err: any) => {
            response.send('error');
        })

    }
    putLogPrice = (request: express.Request, response: express.Response) => {
        console.log('putLogPrice start');
        let body = request.body;
        let scheme: any = {
            grade: body.grade,
            socket: body.socketList,
            property: body.property,
            price: body.price,
        }
        console.log('save price log into db!', scheme);
        let logAcc = new db.logAccComposition(scheme);
        logAcc.save().then((res: any) => {
            response.send({price: res.price});
        })
        .catch((err: any) => {
            response.send('error');
        })
    }
}


function checkExistCount(grade: number, socket: Socket[]) {
    let select = {
        grade: grade,
        $and: socket.map((val: Socket) => {
            return { socket: { $elemMatch: {id: val.id} } };
        })
    }
    // console.log('checkExistCount', select);
    return db.logSocket.findOne(select).then((res: any) => {
        console.log(res);
        return res;
    });
}
/**
 * * 새로 로그를 만든다.
 */
function saveCount(grade: number, socket: Socket[], needNumber: number[]) {
    // 각인 목록을 로그에 저장
    let logSocket = new db.logSocket({
        grade: grade,
        socket: socket.map((val: Socket, index: number) => 
            {return {...val, number: needNumber[index]}}),
        count: 1,
    })
    logSocket.save()
    .then((res: any) => {
        console.log('로그 카운트 생성!');
        return res;
    })
    .catch((err: any) => {
        return err;
    }) 
}
/**
 * * 로그의 숫자를 업데이트 한다.
 */
 function updateCount(res: any) {
    res.updateOne({
        count: res.count + 1,
    })
    .then(() => {
        console.log('로그 카운트 업!');
        return res;
    })
    .catch((err: any) => {
        return err;
    })
}

export default LogController;











