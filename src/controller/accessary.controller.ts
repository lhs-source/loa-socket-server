import * as express from 'express';
import moment from 'moment';

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
    getFinalComposition,
} from './calculateComposition';


enum ACCTYPE {
    NECK = 200010,
    EARRING = 200020,
    RING = 200030,
}


const dbCheckTime = -1;

class AccessaryController {
    public path = '/acc'
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get(this.path, this.getTest);
        this.router.put(this.path, this.putAccessaryFromTrader);
        this.router.post(this.path, this.postAccessaryFromTrader);
    }

    getTest = (request: express.Request, response: express.Response) => {
        console.log('getTest start',);
        response.send('안녕하세요 by 까마귀주먹(카제로스)');
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
            needNumber: number[];
        }
        let requestBody : Request = request.body;

        console.log('putAccessaryFromTrader body', request.body);

        this.checkExistCount(requestBody.grade, requestBody.socket).then((res: any) => {
            if(!res) {
                // 없으면 새로 만들기
                this.saveCount(requestBody.grade, requestBody.socket, requestBody.needNumber);
            } else {
                // 있으면 카운트 증가
                this.updateCount(res);
            }
        })

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
                            // 최근 조회한 데이터가 있는지 찾자
                            let searchPromise = this.checkExistDB(
                                param.socket1, 
                                param.socket2, 
                                k, 
                                Number(accType), 
                                requestBody.grade)
                            .then((result: any) => {
                                if(!result) {
                                    // console.log(`디비에 데이터가 없다 ㅠ ${socket1.name}(${valcomp[0]}) - ${socket2.name}(${valcomp[1]}) 치특신: ${k}`);
                                    // 결과가 없음, 데이터를 새로 가져오자
                                    if(requestBody.grade === 4) {
                                        return getDataLegend(param).then((res : any) => {
                                            // console.log(`전설 ${socket1.name}(${valcomp[0]}) - ${socket2.name}(${valcomp[1]}) 치특신: ${k} 거래소에서 가져옴! ${res.length}`);
                                            // console.log(res);
                                            return res;
                                        }).then((itemList: any[]) => {
                                            // 가져온 데이터로 디비에 저장한다.
                                            return this.saveToDB(
                                                {...socket1, number: valcomp[0]}, 
                                                {...socket2, number: valcomp[1]}, 
                                                k, 
                                                Number(accType),
                                                requestBody.grade, 
                                                itemList).then((dbres: any) => {
                                                    // console.log(`디비 저장 성공! ${socket1.name}(${valcomp[0]}) - ${socket2.name}(${valcomp[1]}) 치특신: ${k}, ${itemList.length}개`);
                                                }).catch((dberr: any) => {
                                                    console.log(`디비 저장 에러! ${socket1.name}(${valcomp[0]}) - ${socket2.name}(${valcomp[1]}) 치특신: ${k}, ${itemList.length}개`, dberr);
                                                })
                                        });
                                    } else if(requestBody.grade === 5) {
                                        return getData(param).then((res : any) => {
                                            // console.log(`유물 ${socket1.name}(${valcomp[0]}) - ${socket2.name}(${valcomp[1]}) 치특신: ${k} 거래소에서 가져옴!  ${res.length}`);
                                            // console.log(res);
                                            return res;
                                        }).then((itemList: any[]) => {
                                            // 가져온 데이터로 디비에 저장한다.
                                            return this.saveToDB(
                                                {...socket1, number: valcomp[0]}, 
                                                {...socket2, number: valcomp[1]}, 
                                                k, 
                                                Number(accType),
                                                requestBody.grade, 
                                                itemList).then((dbres: any) => {
                                                    // console.log(`디비 저장 성공! ${socket1.name}(${valcomp[0]}) - ${socket2.name}(${valcomp[1]}) 치특신: ${k}, ${itemList.length}개`);
                                                }).catch((dberr: any) => {
                                                    console.log(`디비 저장 에러! ${socket1.name}(${valcomp[0]}) - ${socket2.name}(${valcomp[1]}) 치특신: ${k}, ${itemList.length}개`, dberr);
                                                })
                                        });
                                    }
                                    return 0;
                                } else {
                                    // 최근 데이터가 있으니까 아무것도 안한다.
                                    // console.log(`최근 데이터가 있습니다 ^.^v ${socket1.name}(${valcomp[0]}) - ${socket2.name}(${valcomp[1]}) 치특신: ${k}`);
                                    return 0;
                                }
                            }).catch((err: any) => {
                                console.log(`문제가 생김! ${socket1.name}(${valcomp[0]}) - ${socket2.name}(${valcomp[1]}) 치특신: ${k} `, err);
                            })
                            promiseArray.push(searchPromise);
                        }
                    }                    
                })
            }
        }
        console.log('기다린다.. promise 모든 게 끝나길');
        Promise.all(promiseArray)
        .then((res: any) => {
            console.log('데이터를 긁어오고 응답을 보냅니다!')
            response.send('done');
        }).catch((res: any) => {
            console.log('데이터를 긁어오다가 잘못되었고, 응답을 보냅니다!')
            response.send('error');
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
         *  grade: number;
         *  socket: Socket[];
         *  needNumber: number[];
         * }
         * ? socket 과 needNumber 는 길이가 같아야지!
         */
        interface RequestComposition {
            socketList: Socket[];
            needNumber: number[];
            grade: 4 | 5;
            maxPrice: number;
            props: any;
            penalty: {
                name: string;
                number: number;
            }
            
        }
        let requestBody : RequestComposition = request.body;

        const accCount = 5;
        let grade = requestBody.grade;
        let socketList = requestBody.socketList;
        let needNumber = requestBody.needNumber.slice(0, requestBody.socketList.length);
        let sumSocket = needNumber.reduce((sum: number, current: number) => { sum += current; return sum;}, 0);
        let ableNumber = grade === 4 ? [ 0, 1, 2, 3 ] : [ 3, 4, 5 ];

        let despResult: any[] = [];
        needNumber.forEach((val, index) => {
            despResult.push(getDesposition(val, accCount, ableNumber));
        })

        console.log('getDesposition', despResult);  
        
        let deComp = getDespComposition(despResult, sumSocket, grade, accCount);
        console.log('getDespComposition', deComp);

        let casesResult: any[] = [];
        deComp.forEach(val => {
            casesResult.push(getAllCases(socketList, val, grade, accCount, 2));
        })
        Promise.all(casesResult).then((res : any[]) => {
            console.log('getAllCases', res.length);
            response.send(res);
            // console.log('cases', res);
            // TODO Temp 주석
            // let finalResult: any[] = [];
            // let maxPrice = requestBody.maxPrice;
            // let props = requestBody.props;
            // let penalty = requestBody.penalty;
            // let stop = false;

            // res.forEach((cases: any[], caseCount: number) => {
            //     if(stop === true) {
            //         return;
            //     }
            //     cases.forEach((oneCase: any, oneCaseCount: number) => {
            //         if(stop === true) {
            //             return;
            //         }
            //         // console.log('accList', oneCase.accSocketList);
            //         // console.log('accList', oneCase.accList);
            //         let result = getFinalComposition(maxPrice, props, penalty, oneCase.accList);
            //         if(typeof(result) === 'number') {
            //             console.log('getFinalComposition stop', `${caseCount}-${oneCaseCount}`, result);
            //             stop = true;
            //         }else {
            //             // console.log('getFinalComposition', `${caseCount}-${oneCaseCount}`, result.length);
            //             finalResult.push(...result);
            //             if(finalResult.length > 3000) {
            //                 stop = true;
            //             }
            //         }
            //     })
            // })
            // console.log('finalResult', finalResult.length);
    
            // if(finalResult.length > 3000) {
            //     response.send({count: -finalResult.length});
            //     return;
            // }
            // else {
            //     // 가격순으로 정렬
            //     finalResult.sort((a: any, b:any) => {
            //         return a[1].price > b[1].price ? 1 : -1;
            //     })
                
            //     if(finalResult[0]) {
            //         // 조합 결과 로그 남기기
            //         let scheme: any = {
            //             grade: grade,
            //             socket: socketList,
            //             property: [],
            //             price: finalResult[0][1].price,
            //         }
            //         if(requestBody.props['[치명]']){
            //             let prop: any = {
            //                 id: 0,
            //                 name: '치명',
            //                 number: requestBody.props['[치명]'],
            //             }
            //             scheme.property.push(prop);
            //         }
            //         if(requestBody.props['[특화]']){
            //             let prop: any = {
            //                 id: 1,
            //                 name: '특화',
            //                 number: requestBody.props['[특화]'],
            //             }
            //             scheme.property.push(prop);
            //         }
            //         if(requestBody.props['[신속]']){
            //             let prop: any = {
            //                 id: 2,
            //                 name: '신속',
            //                 number: requestBody.props['[신속]'],
            //             }
            //             scheme.property.push(prop);
            //         }
            //         let logAcc = new db.logAccComposition(scheme);
            //         logAcc.save();
            //     }
            //     response.send(finalResult);
            //     return;

            // }
        }).catch((e) => {
            console.log('뭐가 잘못됐나..?', e);
            response.send([]);
            return;
        })
    }

    checkExistCount(grade: number, socket: Socket[]) {
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
    saveCount(grade: number, socket: Socket[], needNumber: number[]) {
        // 각인 목록을 로그에 저장
        let logSocket = new db.logSocket({
            grade: grade,
            socket: socket.map((val: Socket, index: number) => 
                {return {...val, number: needNumber[index]}}),
            count: 1,
        })
        logSocket.save().then((res: any) => {
            console.log('로그 카운트 생성!');
        })
    }
    /**
     * * 로그의 숫자를 업데이트 한다.
     */
    updateCount(res: any) {
        res.updateOne({
            count: res.count + 1,
        }).then(() => {
            console.log('로그 카운트 업!');
        })
    }


    /**
     * * 디비에 데이터가 있는지 체크한다.
     * @param firstSocket 
     * @param secondSocket 
     * @param acctype 
     * @param grade 
     */
    checkExistDB(firstSocket: Socket, secondSocket: Socket, propertyType: number, accType: number, grade: number) {
        const today = moment()
        return db.accessary.findOne({
            grade: grade,
            accType: accType,
            propertyType: propertyType,
            'socket1.id': firstSocket.id,
            'socket1.number': firstSocket.number,
            'socket2.id': secondSocket.id,
            'socket2.number': secondSocket.number, 
            timestamp: {
                $gte: today.clone().add(dbCheckTime, 'minute').toDate(),
                $lte: moment().toDate()
            }
        })
    }

    /**
     * * 디비에 새로운 로그를 저장한다.
     * @param firstSocket 
     * @param secondSocket 
     * @param propertyType 
     * @param acctype 
     * @param grade 
     * @param itemList 
     */
    saveToDB(firstSocket: Socket, secondSocket: Socket, propertyType: number, acctype: number, grade: number, itemList: any[]) {
        let item = {
            grade: grade,
            accType: acctype,
            propertyType: propertyType,
            socket1: firstSocket,
            socket2: secondSocket,
            timestamp: new Date(),
            list: itemList,
        }
        let dbAccessary = new db.accessary(item);
        return dbAccessary.save();
    }
}



export default AccessaryController;





