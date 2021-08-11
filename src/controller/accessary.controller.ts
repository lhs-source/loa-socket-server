import * as express from 'express';

import AccessaryFromTradeModel from './accessary.interface';
import { 
    getData,
    getDataLegend,
    RequestAcc,
} from './getDataFromTrader';

import {Socket} from '../constants/SocketList';

import db from '../repo/index';
import { 
    getDesposition ,
    getDespComposition
} from './calculateComposition';


enum ACCTYPE {
    ALL = 0,
    NECK = 200010,
    EARRING = 200020,
    RING = 200030,
}



class AccessaryController {
    public path = '/acc'
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get(this.path, this.getTest);
        this.router.put(this.path, this.putAccessaryFromTrader);
    }

    getTest = (request: express.Request, response: express.Response) => {
        console.log('getTest start',);
        /**
         * request = {
         *  grade: number;
         *  socket: Socket[];
         *  needNumber: number[];
         * }
         * ? socket 과 needNumber 는 길이가 같아야지!
         */
        let grade = 5;
        const accCount = 5;
        let mockNeedNumber = [8, 8, 6, 15, 3];
        let mockSumSocket = 40;
        let ableNumber = grade === 4 ? 
        // [
        //     [1, 3],
        //     [2, 2],
        //     [2, 3],
        //     [3, 3],
        // ] 
        // :
        // [
        //     [3, 4],
        //     [3, 5],
        // ]
        [ 0, 1, 2, 3 ] : [ 3, 4, 5 ];

        let despResult: any[] = [];
        mockNeedNumber.forEach(val => {
            despResult.push(getDesposition(val, accCount, ableNumber));
        })

        console.log('getDesposition', despResult);  
        
        let deComp = getDespComposition(despResult, mockSumSocket, grade, accCount);
        console.log('getDespComposition', deComp);
        response.send(deComp);
    }
    /**
     * 거래소에서 원하는 각인의 악세서리를 모두 가져와서
     * 목록을 디비에 저장한다.
     *   1. 각인 코드 조합으로 악세서리를 긁어온다.
     *      전설 - 1, 3 / 2, 2 / 2, 3 / 3, 3
     *      유물 - 3, 4 / 3, 5
     *   2. 디비에 저장한다.
     *   3. 모든 과정이 끝나고 응답으로 ok 신호를 보낸다.
     * @param request 각인 목록 (각인 이름, 코드, 전설?유물?)
     * @param response 다 됐는지 아닌지 단순 플래그
     */
    putAccessaryFromTrader = (request : express.Request, response : express.Response) => {
        interface Request {
            grade: 4 | 5;
            socket: Socket[];
        }
        let requestBody : Request = request.body;

        console.log('putAccessaryFromTrader body', request.body);
        // 각인 조합별로 가져오기
        let promiseArray: any[] = [];
        let socketLength = requestBody.socket.length;
        for(let i = 0; i < socketLength; ++i) {
            for(let j = i + 1; j < socketLength; ++j){
                let socket1 = requestBody.socket[i];
                let socket2 = requestBody.socket[j];
                // 악세 각인 숫자 경우의 수
                let valueComposition = requestBody.grade === 4 ? 
                [
                    [1, 3],
                    [2, 2],
                    [2, 3],
                    [3, 1],
                    [3, 2],
                    [3, 3],
                ] 
                :
                [
                    [3, 4],
                    [3, 5],
                    [4, 3],
                    [5, 3],
                ]
                // 3, 5 / 3, 4 등등 악세서리를 다 조회해온다.
                valueComposition.forEach((valcomp : number[]) => {
                    // 치 특 신 3번
                    let propertyPromiseArray = [];
                    for(let k = 0; k < 3; ++k) {
                        let param : RequestAcc = {
                            acctype: ACCTYPE.NECK,
                            socket1: {
                                id: socket1.id,
                                name: socket1.name,
                                number: valcomp[0],
                            },
                            socket2: {
                                id: socket2.id,
                                name: socket2.name,
                                number: valcomp[1],
                            },
                            property1: k,
                            property2: -1,
                        }
                        // console.log(param);
                        if(requestBody.grade === 4) {
                            let dataPromise = getDataLegend(param).then((res : any) => {
                                console.log(`전설 ${socket1.name}(${valcomp[0]}) - ${socket2.name}(${valcomp[1]}) 치특신: ${k} 조회함!`);
                            });
                            promiseArray.push(dataPromise);
                            propertyPromiseArray.push(dataPromise);
                        } else if(requestBody.grade === 5) {
                            let dataPromise = getData(param).then((res : any) => {
                                console.log(`유물 ${socket1.name}(${valcomp[0]}) - ${socket2.name}(${valcomp[1]}) 치특신: ${k} 조회함!`);
                            });
                            promiseArray.push(dataPromise);
                            propertyPromiseArray.push(dataPromise);
                        }
                    }
                    Promise.all(propertyPromiseArray).then((res: any) => {
                        console.log('치특신 합쳐서 ㅎㅎ', res.length ? res.length : '');
                        let totalList = [];
                        for(let list of res){
                            totalList.push(...list);
                        }
                        this.saveToDB(socket1, socket2, requestBody.grade, totalList);
                    })
                    
                })
            }
        }
        Promise.all(promiseArray)
        .then((res: any) => {
            console.log('send the response')
            response.send('done');
        })
    }

    /**
     * 케이스 계산 실시!
     *   1. 치특신
     *   2. 패널티
     *   3. 가격 
     * @param request 조합 조건들
     * @param response 조합 결과 배열
     */
    postAccessaryFromTrader = (request : express.Request, response :express.Response) => {
        /**
         * request = {
         *  socket: Socket[],
         *  needNumber: number[],
         * }
         * ? socket 과 needNumber 는 길이가 같아야지!
         */
        let mockNeedNumber = [8, 8, 6, 15, 3];


    }


    saveToDB(firstSocket: Socket, secondSocket: Socket, grade: number, itemList: any[]) {
        // 우선 항목이 있는지 찾기
        db.accessary.find({}).then((acc : any) => {
            console.log(acc);
            if(!acc || acc.length <= 0) {
                // 항목이 없으면 새로 만들기
                let item = {
                    grade: grade,
                    socket1: firstSocket,
                    socket2: secondSocket,
                    itemtrail: [
                        {
                            timestamp: new Date(),
                            list: itemList,
                        }
                    ]
                }
                let dbAccessary = new db.accessary(item);
                dbAccessary.save().then(() => {
                    console.log('save done?!');
                })
            }
        })
    }

}

const mockResponse : AccessaryFromTradeModel = {
    status: 'done',
}


export default AccessaryController;





