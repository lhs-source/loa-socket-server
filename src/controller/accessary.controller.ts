import * as express from 'express';

import AccessaryFromTradeModel from './accessary.interface';
import { 
    getData,
    RequestAcc,
} from './getDataFromTrader';


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
        console.log('getTest start');
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
        // console.log(request);
        response.send(mockResponse);
        
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





