import * as express from 'express';

import AccessaryFromTradeModel from './accessary.interface';
import { 
    getData,
    getDataLegend,
    RequestAcc,
} from './getDataFromTrader';

import {Socket} from '../constants/SocketList';


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
        // response.send('<h3>welcome lhs world</h3>');
        let param : RequestAcc = {
            acctype: ACCTYPE.NECK,
            socket1: {
                id: 118,
                name: '원한',
                number: 5,
            },
            socket2: {
                id: 249,
                name: '기습의대가',
                number: 3,
            },
            property1: 0,
            property2: -1,
        }
        getData(param).then((res : any) => {
            response.send(res);
        })
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
                            promiseArray.push(getDataLegend(param).then((res : any) => {
                                console.log(`전설 ${socket1.name}(${valcomp[0]}) - ${socket2.name}(${valcomp[1]}) 치특신: ${k} 조회함!`);
                            }));
                        } else if(requestBody.grade === 5) {
                            promiseArray.push(getData(param).then((res : any) => {
                                console.log(`유물 ${socket1.name}(${valcomp[0]}) - ${socket2.name}(${valcomp[1]}) 치특신: ${k} 조회함!`);
                            }));
                        }
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

        response.send(mockResponse);        
    }



}

const mockResponse : AccessaryFromTradeModel = {
    status: 'done',
}


export default AccessaryController;





