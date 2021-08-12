import axios from 'axios';
import cheerio, { CheerioAPI } from 'cheerio';
import SocketList, { Socket } from "../constants/SocketList";

enum ACCTYPE {
    ALL = 0,
    NECK = 200010,
    EARRING = 200020,
    RING = 200030,
}

export async function getData(request: RequestAcc) {
    let param: any = {};
    let prop1: number | null = 0;
    let prop2: number | null = 0;
    switch(request.property1){
        case 0: // 치
            prop1 = 15;
            break;
        case 1: // 특
            prop1 = 16;
            break;
        case 2: // 신
            prop1 = 18;
            break;
        default:
            prop1 = null;
            break;
    }
    if(request.acctype === ACCTYPE.NECK) {
        switch(request.property1){
            case 0: // 치특
                prop1 = 15;
                prop2 = 16;
                break;
            case 1: // 치신
                prop1 = 15;
                prop2 = 18;
                break;
            case 2: // 특신
                prop1 = 16;
                prop2 = 18;
                break;
            default:
                prop2 = null;
                break;
        }
    }

    param['request[firstCategory]'] = 200000;
    param['request[secondCategory]'] = request.acctype,
    param['request[classNo]'] = '';
    param['request[itemTier]'] = 3;
    param['request[itemGrade]'] = 5;
    param['request[itemLevelMin]'] = 0
    param['request[itemLevelMax]'] = 1600
    param['request[itemName]'] = ''; 
    param['request[gradeQuality]'] = 60
    param['request[skillOptionList][0][firstOption]'] = '';
    param['request[skillOptionList][0][secondOption]'] = '';
    param['request[skillOptionList][0][minValue]'] = '';
    param['request[skillOptionList][0][maxValue]'] = ''; 

    param['request[skillOptionList][1][firstOption]'] = ''; 
    param['request[skillOptionList][1][secondOption]'] = ''; 
    param['request[skillOptionList][1][minValue]'] = ''; 
    param['request[skillOptionList][1][maxValue]'] = ''; 

    param['request[skillOptionList][2][firstOption]'] = ''; 
    param['request[skillOptionList][2][secondOption]'] = ''; 
    param['request[skillOptionList][2][minValue]'] = ''; 
    param['request[skillOptionList][2][maxValue]'] = ''; 

    param['request[etcOptionList][0][firstOption]'] = 2;
    param['request[etcOptionList][0][secondOption]'] = prop1;
    param['request[etcOptionList][0][minValue]'] = ''; 
    param['request[etcOptionList][0][maxValue]'] = ''; 

    param['request[etcOptionList][1][firstOption]'] = 3
    param['request[etcOptionList][1][secondOption]'] = request.socket1.id
    param['request[etcOptionList][1][minValue]'] = request.socket1.number; 
    param['request[etcOptionList][1][maxValue]'] = ''; 

    param['request[etcOptionList][2][firstOption]'] = 3; 
    param['request[etcOptionList][2][secondOption]'] = request.socket2.id; 
    param['request[etcOptionList][2][minValue]'] = request.socket2.number; 
    param['request[etcOptionList][2][maxValue]'] = ''; 

    param['request[etcOptionList][3][firstOption]'] = ''; 
    param['request[etcOptionList][3][secondOption]'] = ''; 
    param['request[etcOptionList][3][minValue]'] = ''; 
    param['request[etcOptionList][3][maxValue]'] = ''; 

    // 두번째 특성
    if(request.acctype === ACCTYPE.NECK) {
        param['request[etcOptionList][3][firstOption]'] = 2; 
        param['request[etcOptionList][3][secondOption]'] = prop2; 
        param['request[etcOptionList][3][minValue]'] = ''; 
        param['request[etcOptionList][3][maxValue]'] = ''; 
    }
    
    param['request[sortOption][Sort]'] = 'BUY_PRICE';
    param['request[sortOption][IsDesc]'] = false;
    
    param['request[pageNo]'] = 1
    param['pushKey'] = '';
    param['tooltipData'] = ''; 
    let form = new URLSearchParams(param);
    // console.log('request to trader');
    return axios.post(
        // 'https://lhs-yeah.herokuapp.com/https://lostark.game.onstove.com/Auction/GetAuctionListV2',
        'https://lostark.game.onstove.com/Auction/GetAuctionListV2',
        form, 
        {
            headers: {
                // 'Content-Type' : 'application/x-www-form-urlencoded'
                // 'Origin': 'https://lostark.game.onstove.com',
                // 'Referer': 'https://lostark.game.onstove.com/Auction'
                // "X-Requested-With": "XMLHttpRequest"
            }
        }
    ).then(res => {
        // console.log('response from trader');
        let data = res.data;
        let cheer = cheerio.load(data);
        let output: any[] = [];
        
        let empty = cheer('tbody').children('tr.empty');
        if(empty && empty.length > 0) {
            console.log('getData data is empty ', request);
            return output;
        }
        cheer('tbody tr').each((i, el) => {
            let name = ''
            try {
                name = (cheer(el).find('span.name')[0].children[0] as any).data;
            } catch (e ) {
                // console.log('error debug :: name', cheer(el).find('span.name')[0]);
            }
            let count = '';
            try{
                count = (cheer(el).find('span.count font')[0].children[0] as any).data.match(/\d/g).join('');
            }catch(e ) {
                // console.log('error debug :: count', cheer(el).find('span.count font')[0]);
            }
            let grade = Number(cheer(el).find('div.grade')[0].attribs['data-grade']);
            let socket = cheer(el).find('div.effect ul')[0];
            let socket1 = {
                name: (cheer(socket.children[1]).children('font')[0].children[0] as any).data,
                number: Number((cheer(socket.children[1]).children('font')[1].children[0] as any).data.match(/\d/g).join('')),
            };
            let socket2 = {
                name: (cheer(socket.children[3]).children('font')[0].children[0] as any).data,
                number: Number((cheer(socket.children[3]).children('font')[1].children[0] as any).data.match(/\d/g).join('')),
            };
            let badSocket1 = {
                name: (cheer(socket.children[5]).children('font')[0].children[0] as any).data,
                number: Number((cheer(socket.children[5]).children('font')[1].children[0] as any).data.match(/\d/g).join('')),
            };
            let prop = cheer(el).find('div.effect ul')[1];
            let property1 = {
                name: (cheer(prop.children[1]).children('font')[0].children[0] as any).data,
                number: Number((cheer(prop.children[1]).children('font')[1].children[0] as any).data.match(/\d/g).join('')),
            };
            let property2 = {name:'', number: 0};
            if(request.acctype === ACCTYPE.NECK) {
                property2 = {
                    name: (cheer(prop.children[3]).children('font')[0].children[0] as any).data,
                    number: Number((cheer(prop.children[3]).children('font')[1].children[0] as any).data.match(/\d/g).join('')),
                };
            }
            let price= 0;
            try{
                price = Number((cheer(el).find('div.price-buy em')[0].children[0] as any).data.match(/\d/g).join(''));
            } catch(e ) {
                // console.log('error debug :: price', cheer(el).find('div.price-buy em')[0]);
            }
            let raw: AccData = {
                name: name,
                count: count,
                grade: grade,
                acctype: request.acctype,
                socket1: socket1,
                socket2: socket2,
                badSocket1: badSocket1,
                property1: property1,
                property2: property2,
                price: price,
            }
            // console.log(raw);
            output.push(raw);
        })
    
        return output;
    }).catch((error: any) => {
        // console.log("DEBUG :: 거래소에서 데이터 가져오는 데 문제가 생겼다, 아니면 결과가 없음!", request, param);
        console.log("DEBUG :: 거래소에서 데이터 가져오는 데 문제가 생겼다, 아니면 결과가 없음!", request);
        return [];
        // if (error.response) {
        //     // 요청이 이루어졌으며 서버가 2xx의 범위를 벗어나는 상태 코드로 응답했습니다.
        //     // console.log(error.response.data);
        //     console.log(error.response.status);
        //     console.log(error.response.headers);
        //   }
        //   else if (error.request) {
        //     // 요청이 이루어 졌으나 응답을 받지 못했습니다.
        //     // `error.request`는 브라우저의 XMLHttpRequest 인스턴스 또는
        //     // Node.js의 http.ClientRequest 인스턴스입니다.
        //     console.log(error.request);
        //   }
        //   else {
        //     // 오류를 발생시킨 요청을 설정하는 중에 문제가 발생했습니다.
        //     console.log('Error', error.message);
        //   }
        //   console.log(error.config);
    })
}

export async function getDataLegend(request: RequestAcc) {
    let param: any = {};
    let prop1: number | null = 0;
    let prop2: number | null = 0;
    switch(request.property1){
        case 0: // 치
            prop1 = 15;
            break;
        case 1: // 특
            prop1 = 16;
            break;
        case 2: // 신
            prop1 = 18;
            break;
        default:
            prop1 = null;
            break;
    }
    switch(request.property2){
        case 0: // 치
            prop2 = 15;
            break;
        case 1: // 특
            prop2 = 16;
            break;
        case 2: // 신
            prop2 = 18;
            break;
        default:
            prop2 = null;
            break;
    }

    param['request[firstCategory]'] = 200000;
    param['request[secondCategory]'] = request.acctype,
    param['request[classNo]'] = '';
    param['request[itemTier]'] = 3;
    param['request[itemGrade]'] = 4;
    param['request[itemLevelMin]'] = 0
    param['request[itemLevelMax]'] = 1600
    param['request[itemName]'] = ''; 
    param['request[gradeQuality]'] = 60
    param['request[skillOptionList][0][firstOption]'] = '';
    param['request[skillOptionList][0][secondOption]'] = '';
    param['request[skillOptionList][0][minValue]'] = '';
    param['request[skillOptionList][0][maxValue]'] = ''; 

    param['request[skillOptionList][1][firstOption]'] = ''; 
    param['request[skillOptionList][1][secondOption]'] = ''; 
    param['request[skillOptionList][1][minValue]'] = ''; 
    param['request[skillOptionList][1][maxValue]'] = ''; 

    param['request[skillOptionList][2][firstOption]'] = ''; 
    param['request[skillOptionList][2][secondOption]'] = ''; 
    param['request[skillOptionList][2][minValue]'] = ''; 
    param['request[skillOptionList][2][maxValue]'] = ''; 

    param['request[etcOptionList][0][firstOption]'] = 2;
    param['request[etcOptionList][0][secondOption]'] = prop1;
    param['request[etcOptionList][0][minValue]'] = ''; 
    param['request[etcOptionList][0][maxValue]'] = ''; 

    param['request[etcOptionList][1][firstOption]'] = 3
    param['request[etcOptionList][1][secondOption]'] = request.socket1.id
    param['request[etcOptionList][1][minValue]'] = request.socket1.number; 
    param['request[etcOptionList][1][maxValue]'] = ''; 

    param['request[etcOptionList][2][firstOption]'] = 3; 
    param['request[etcOptionList][2][secondOption]'] = request.socket2.id; 
    param['request[etcOptionList][2][minValue]'] = request.socket2.number; 
    param['request[etcOptionList][2][maxValue]'] = ''; 

    param['request[etcOptionList][3][firstOption]'] = ''; 
    param['request[etcOptionList][3][secondOption]'] = ''; 
    param['request[etcOptionList][3][minValue]'] = ''; 
    param['request[etcOptionList][3][maxValue]'] = ''; 

    // 두번째 특성
    if(request.acctype === ACCTYPE.NECK) {
        param['request[etcOptionList][3][firstOption]'] = 2; 
        param['request[etcOptionList][3][secondOption]'] = prop2; 
        param['request[etcOptionList][3][minValue]'] = ''; 
        param['request[etcOptionList][3][maxValue]'] = ''; 
    }
    
    param['request[sortOption][Sort]'] = 'BUY_PRICE';
    param['request[sortOption][IsDesc]'] = false;
    
    param['request[pageNo]'] = 1
    param['pushKey'] = '';
    param['tooltipData'] = ''; 
    let form = new URLSearchParams(param);
    let res = await axios.post(
            'https://lhs-yeah.herokuapp.com/https://lostark.game.onstove.com/Auction/GetAuctionListV2',
            form, 
            {
                headers: {
                    // 'Content-Type' : 'application/x-www-form-urlencoded'
                    // 'Origin': 'https://lostark.game.onstove.com',
                    // 'Referer': 'https://lostark.game.onstove.com/Auction'

                }
            })
    let data = res.data;
    let cheer = cheerio.load(data);
    let output: any[] = [];
    
    let empty = cheer('tbody').children('tr.empty');
    if(empty && empty.length > 0) {
        return output;
    }
    cheer('tbody tr').each((i, el) => {
        let name = ''
        try {
            name = (cheer(el).find('span.name')[0].children[0] as any).data;
        } catch (e) {
            console.log('error debug :: name', cheer(el).find('span.name')[0]);
        }
        let count = '';
        try{
            count = (cheer(el).find('span.count font')[0].children[0] as any).data.match(/\d/g).join('');
        }catch(e) {
            console.log('error debug :: count', cheer(el).find('span.count font')[0]);
        }
        let grade = Number(cheer(el).find('div.grade')[0].attribs['data-grade']);
        let socket = cheer(el).find('div.effect ul')[0];
        let socket1 = {
            name: (cheer(socket.children[1]).children('font')[0].children[0] as any).data,
            number: Number((cheer(socket.children[1]).children('font')[1].children[0] as any).data.match(/\d/g).join('')),
        };
        let socket2 = {
            name: (cheer(socket.children[3]).children('font')[0].children[0] as any).data,
            number: Number((cheer(socket.children[3]).children('font')[1].children[0] as any).data.match(/\d/g).join('')),
        };
        let badSocket1 = {
            name: (cheer(socket.children[5]).children('font')[0].children[0] as any).data,
            number: Number((cheer(socket.children[5]).children('font')[1].children[0] as any).data.match(/\d/g).join('')),
        };
        let prop = cheer(el).find('div.effect ul')[1];
        let property1 = {
            name: (cheer(prop.children[1]).children('font')[0].children[0] as any).data,
            number: Number((cheer(prop.children[1]).children('font')[1].children[0] as any).data.match(/\d/g).join('')),
        };
        let property2 = {name:'', number: 0};
        if(request.acctype === ACCTYPE.NECK) {
            property2 = {
                name: (cheer(prop.children[3]).children('font')[0].children[0] as any).data,
                number: Number((cheer(prop.children[3]).children('font')[1].children[0] as any).data.match(/\d/g).join('')),
            };
        }
        let price= 0;
        try{
            price = Number((cheer(el).find('div.price-buy em')[0].children[0] as any).data.match(/\d/g).join(''));
        } catch(e) {
            console.log('error debug :: price', cheer(el).find('div.price-buy em')[0]);
        }
        let raw: AccData = {
            name: name,
            count: count,
            grade: grade,
            acctype: request.acctype,
            socket1: socket1,
            socket2: socket2,
            badSocket1: badSocket1,
            property1: property1,
            property2: property2,
            price: price,
        }
        // console.log(raw);
        output.push(raw);
    })

    return output;
}





export interface RequestAcc {
    acctype: number;
    socket1: Socket;
    socket2: Socket;
    property1: number;
    property2: number;
}
export interface AccData {
    name: string;
    count: string;
    grade: number;
    acctype: number;
    socket1: {
        name: string;
        number: number;
    }
    socket2:{
        name: string;
        number: number;
    }
    badSocket1: {
        name: string;
        number: number;
    }
    property1: {
        name: string;
        number: number;
    }
    property2: {
        name: string;
        number: number;
    }
    price: number;
}