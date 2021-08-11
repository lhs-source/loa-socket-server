import * as express from 'express';
import moment from 'moment';

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
    getDespComposition,
    getAllCases,
} from './calculateComposition';


enum ACCTYPE {
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
        let mockSocket : Socket[] = [
            {
                id: 118,
                name: '원한',
            },
            {
                id: 141,
                name: '예리한 둔기',
            },
            {
                id: 299, 
                name: '아드레날린',
            },
            {
                id: 254, 
                name: '돌격대장',
            },
            {
                id: 292, 
                name: '오의난무',
            }
        ]
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

        let casesResult: any[] = [];
        deComp.forEach(val => {
            casesResult.push(getAllCases(mockSocket, val, grade, accCount, 2));
        })
        console.log('getAllCases', casesResult.length);
        response.send(casesResult);
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
                    for(let accType of [ACCTYPE.NECK, ACCTYPE.EARRING, ACCTYPE.RING]){
                        // console.log('acctype 은 어떻게 찍히나?', accType);
                        // 치 특 신 3번
                        let propertyPromiseArray = [];
                        for(let k = 0; k < 3; ++k) {
                            let param : RequestAcc = {
                                acctype: Number(accType),
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
                                    return res;
                                });
                                promiseArray.push(dataPromise);
                                propertyPromiseArray.push(dataPromise);
                            } else if(requestBody.grade === 5) {
                                let dataPromise = getData(param).then((res : any) => {
                                    console.log(`유물 ${socket1.name}(${valcomp[0]}) - ${socket2.name}(${valcomp[1]}) 치특신: ${k} 조회함!`);
                                    return res;
                                });
                                promiseArray.push(dataPromise);
                                propertyPromiseArray.push(dataPromise);
                            }
                        }
                        Promise.all(propertyPromiseArray).then((res: any) => {
                            // console.log('치특신 합쳐서 ㅎㅎ', res.length ? res.length : '');
                            let totalList = [];
                            for(let list of res){
                                // console.log('치특신 아이템 목록', list);
                                if(list !== null && list !== undefined) {
                                    totalList.push(...list);
                                }
                            }
                            // console.log('totalList', totalList)
                            this.saveToDB(
                                {...socket1, number: valcomp[0]}, 
                                {...socket2, number: valcomp[1]}, 
                                Number(accType),
                                requestBody.grade, 
                                totalList);
                        })
                    }                    
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


    saveToDB(firstSocket: Socket, secondSocket: Socket, acctype: ACCTYPE, grade: number, itemList: any[]) {
        // 우선 항목이 있는지 찾기
        const today = moment()
        // console.log('gte',  today.clone().add(-5, 'minute').toDate())
        // console.log('lte',  moment().toDate())
        // console.log('acctype', acctype)
        db.accessary.findOne({
            grade: grade,
            accType: acctype,
            'socket1.id': firstSocket.id,
            'socket1.number': firstSocket.number,
            'socket2.id': secondSocket.id,
            'socket2.number': secondSocket.number, 
            'itemtrail.timestamp': {
                $gte: today.clone().add(-3, 'minute').toDate(),
                $lte: moment().toDate()
            }
        }, {
            itemtrail: { $slice: 10 }
        }).then((acc : any) => {
            // console.log(acc);
            if(!acc || acc.length <= 0) {
                // 항목이 없으면 새로 만들기
                let item = {
                    grade: grade,
                    acctype: acctype,
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
                    console.log('데이터 신규 추가!');
                })
            }
            else {
                // TODO 거래소에서 조회해오기 전에 3분 이내 데이터가 있으면 무시하도록 수정하기!
                // if(acc.itemtrail.length > 0) {
                //     // 이미 항목에 2분 이내 검색한 결과가 있으면, 디비에 저장하지 않음.
                // }
                console.log('있는 데이터에 추가', acc.itemtrail.length, itemList.length);
                // 항목이 있으면 list 에 추가
                let itemTrail = {
                    timestamp: new Date(),
                    list: itemList,
                }
                // acc.itemtrail.push(itemTrail);
                db.accessary.updateOne(
                    { _id: acc._id },
                    { $push: { itemtrail : 
                        {   $each: [itemTrail],
                            $position: 0, }
                    } },
                    function (error: any, success: any) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log(success);
                        }
                    }
                )
            }
        })
    }

}

const mockResponse : AccessaryFromTradeModel = {
    status: 'done',
}


export default AccessaryController;





