
import moment from 'moment';

import {Socket} from '../constants/SocketList';

import { AccData } from './getDataFromTrader';

import db from '../repo/index';

/**
* * 숫자 합분해를 찾아낸다
* @param {number} targetNumber 합분해 대상 숫자 (15)
* @param {number} accCount 장신구 장착 개수(5개)
* @param {number[]} valuelist 합분해 요소 숫자 리스트 ([5, 3])
*/
export function getDesposition(
  targetNumber: number = 0, 
  accCount: number = 5,
  valuelist: number[]) {
  let output: any[] = [];
  let recurrsive = (
    remain: number,
    makeList: number[],
    depth: number
  ) => {
    // 장신구 개수 넘어가면 ㄴㄴ
    if (depth > accCount) {
      return;
    }
    for (let use of valuelist) {
      // 이전 숫자보다 크면
      if (makeList && use > makeList[makeList.length - 1]) {
        continue;
      }
      let nextRemain = remain - use;

      if (nextRemain > 0) {
        // 숫자가 부족함
        recurrsive(
          nextRemain,
          [...makeList, use],
          depth + 1
        );
      } else if (nextRemain === 0) {
        // 숫자가 딱 떨어짐
        output.push([...makeList, use]);
      } else {
        // 숫자가 넘겨버려서 -가 됨
        continue;
      }
    }
    return;
 };
 recurrsive(targetNumber, [], 0);
 return output;
}

/**
 * * 가능한 합분해 조합 구하기
 * @param {any[]} desposition 합분해 리스트
 *  ex) [
          [ [ 4, 4 ], [ 5, 3 ] ],
          [ [ 4, 4 ], [ 5, 3 ] ],
          [ [ 3, 3 ] ],
          [ [ 3, 3, 3, 3, 3 ], [ 4, 4, 4, 3 ], [ 5, 4, 3, 3 ], [ 5, 5, 5 ] ],
          [ [ 3 ] ]
        ]
  @param {number} socketSum 소켓 합 ex) 40
 */
export function getDespComposition(desposition: any[], socketSum: number, grade: number, accCount: number) {
  
  let composition: any[] = [];
  let ableComp: any[] = [];

  if(!desposition || desposition.length <= 0) {
    return ableComp;
  }
  let recursive = (
    remain : number, 
    depth: number, 
    makeList: any[]) => {
    // console.log(depth, desposition.length)
    if(depth >= desposition.length) {
      return;
    }
    // console.log(desposition[depth].length)
    if(desposition[depth].length === 0) {
      recursive(remain, depth + 1, [...makeList, [0]]);
      // return;
    }
    for(let i = 0; i < desposition[depth].length; ++i) {
      let target = desposition[depth][i];
      let nextRemain = remain - target.length;

      if(depth < desposition.length - 1 && nextRemain <= 0) {
        continue;
      }
      if(depth === desposition.length - 1 && nextRemain === 0) {
        let sum = 0;
        [...makeList, target].forEach((val2: number[]) => {
          let innerSum = 0;
          val2.forEach((val3 : number) => innerSum += val3);
          sum += innerSum;
        });
        // console.log(socketSum, sum)
        if(socketSum > sum){
          continue;
        }

        // 유물이면 3이 5개 이상이어야 함!
        if(grade === 5) {
          let sumOfThree = countThree([...makeList, target])     
          if(sumOfThree < accCount) {
            continue;
          }
        }

        ableComp.push([...makeList, target]);
      }
      recursive(nextRemain, depth + 1, [...makeList, target]);
    }
  }
  // 악세 하나에 2개 각인
  recursive(accCount * 2, 0, []);
  return ableComp;
}


/**
 * 악세서리 조합을 찾아낸다.
 * @param {any[]} socketList : 각인 목록
 * @param {any[]} list : 숫자 조합 ([ 5, 3 ][ 5, 3 ][ 5, 5, 5 ][ 3, 3 ][ 3 ])
 * @param {number} accCount : 악세서리 개수 (보통 5개)
 * @param {number} valuenumber : 악세서리에 부여되는 각인 개수 (보통 2개)
 */
export function getAllCases(socketList: any[], list: any[], grade: number, accCount: number, valueNumber: number) {
  let rowRecursive = (sourceList: any[], maxcount: number, makeList: number[], output: any[]) => {
    // 반복이 악세서리 개수 이상으로 가면 중지
    if(maxcount >= accCount){
      return ;
    }
    let sourceListIndex: any[] = sourceList[maxcount];
    let step = [...new Set(sourceListIndex), 0];
    // console.log(maxcount, step, makeList);
    step.forEach((val:any) => {
      // console.log('for', step, val)
      if(maxcount === 0) {
        rowRecursive(sourceList, maxcount + 1, [val], output)
        return;
      }
      let newMakeList =  [...makeList, val];
      let validCount = newMakeList.filter(val => val !== 0).length;
      let sumOfSocket = 0;
      newMakeList.forEach(val => {sumOfSocket += val});

      // 유물 각인 합이 8 넘어가면 중단
      if(grade === 5 && sumOfSocket > 8) {
        return [];
      }
      // 전설 각인 합이 6 넘어가면 중단
      else if(grade === 4 && sumOfSocket > 6) {
        return [];
      }
      // n개까지 고르지 않았으니 계속 진행
      if(validCount < valueNumber){
        rowRecursive(sourceList, maxcount + 1, newMakeList, output);
        return;
      }
      // 다 골라서 배열에 넣고 중단
      else if(validCount === valueNumber){
        // 3이 하나라도 없는 유물 반지는 ㄴㄴ
        let sumOfThree = newMakeList.filter(val => val === 3).length;
        if(sumOfThree === 0) {
          return [];
        }
        output.push(newMakeList);
        return;
      }
    })
  }
  let finalOutput: any[] = [];
  let valueList = grade === 4 ? [ [0,2], [0,3], [1,2], [1,3], [2,0], [2,1], [2,2], [2,3], [3,0], [3,1], [3,2], [3,3] ] : [ [3,3], [3,4], [3,5], [4,3], [5,3] ];
  let itemDictionary: Promise<ItemDictionary[]> = spreadSocketComposition(socketList, grade, valueList);
  return itemDictionary.then((dic: ItemDictionary[]) => {
    // console.log('itemDictionary', itemDictionary)
    let createAcc = (sourceList: any[], index: number, targetList: any[], result: any[]) => {
      let rowOutput: any[] = [];
      // row 리스트 획득
      rowRecursive(sourceList, 0, [], rowOutput)
      
      // console.log('index : ', index, ' sourceList [', sourceList.join('],['), '] targetList', targetList.join(' '));
      // console.log('rowOutput : ', rowOutput.join('\n'));

      rowOutput.forEach((val: any[]) => {
        // 마지막 악세서리일 때
        if(index === 4) {
          let items = [...targetList, val];
          // console.log('last', index, '=>', items.join(' - '));
          let itemList = findSocket(socketList, items);
          finalOutput.push({
            accSocketList: itemList,
            // accStr: items.map((item, index) => this.getAcc(index, item)),
            accList: getAcc2(dic, itemList, grade),//items.map((item, index) => this.getAcc(index, item)),
            accCompositions: [], // this.getFinalComposition(items), TODO 다른 함수에서 한번에 ㄱㄱ
          });
          return;
        }
        // 리스트에서 제거한 새로운 리스트 생성
        let newSourceList = JSON.parse(JSON.stringify(sourceList));
        for(let i = 0; i < val.length; ++i){
          if(val[i] > 0){
            // skip 이 아니면 newSourceList 에서 숫자를 하나 뺀다.
            newSourceList[i].splice(newSourceList[i].findIndex((src : number) => src === val[i]), 1)
          }
        }
        // 리스트에서 제거한 후 다음 depth 순환
        createAcc(newSourceList, index + 1, [...targetList, val], result);
      })
      return rowOutput;
    }
    createAcc(list, 0, [], finalOutput);
    // console.log('final', finalOutput);
    return finalOutput;
  })
  
}


function getAcc2(itemDictionary: ItemDictionary[], sockets: any[], grade: number) {
  let itemList = sockets.map((sock: any, sockIndex: number) => {
    // 악세별로 돌아가면서 
    // ? { socket1: { id: 118, number: 3 }, socket2: { id: 141, number: 5 } }
    // console.log('getAcc2 loop', sock);
    let itemType: ItemDictionary | undefined = itemDictionary.find((item: any) => {
      if(item.grade === grade &&
          item.socket1.id === sock.socket1.id &&
          item.socket1.number === sock.socket1.number &&
          item.socket2.id === sock.socket2.id &&
          item.socket2.number === sock.socket2.number) {
        return item;
      }
    })
    // console.log('item found by itemDictionary', itemType);

    if(itemType === undefined) {
      console.log('DEBUG :: cannot find item from ItemDictionay', sock);
      return;
    }

    let item: any = {};
    switch(sockIndex){
      case 0:
        // neckless
        item = itemType.necklessList;
        break;
      case 1:
      case 2:
        // earring
        item = itemType.earringList;
        break;
      case 3:
      case 4:
        // ring
        item = itemType.ringList;
        break;
    }
    return item;
  });
  return itemList;
}

export function getFinalComposition( maxPrice: number, props: any, penalty: any, itemList: any[]) {
  // 장신구 목록
  interface SumDataModel {
    price: number;
    sockets: any;
    penalty: any;
    property: any;
    propertySum: number;
  }
  let tooMuchData: boolean = false;
  let dataLimit = 3000;

  // console.log('getFinalComposition', itemList.length);
  // console.log('getFinalComposition', itemList[0]);
  
  // console.log(allItemList);
  let allOfFinal: any[] = [];   
  let propSum = Number(props['[치명]']) + Number(props['[특화]']) + Number(props['[신속]']); 
  let recursive = (sourceList: any[], depth: number, makeList: AccData[], sumData: SumDataModel) => {
    let listUp: any = sourceList[depth];
    // console.log(sourceList, depth, listUp.list);
    if(tooMuchData === true) {
      return;
    }
    listUp.forEach((item : AccData) => {
      if(tooMuchData === true) {
        return;
      }
      // 아이템 이름이 같으면 안된다 ㅠ
      if(makeList.length > 0 && makeList[makeList.length - 1].name === item.name) {
        return;
      }

      // 악세 종류 하나의 list 중 아이템 하나임!
      // 특성을 모두 합쳐서 sum 에 담기
      if(!item.price || item.price < 0) {
        return;
      }
      let perSumData: SumDataModel = {
        price: sumData.price + item.price,
        sockets: {...sumData.sockets},
        penalty: {...sumData.penalty}, 
        property: {...sumData.property},
        propertySum: sumData.propertySum,
      }
      if(!perSumData.price || perSumData.price > maxPrice) {
        return;
      }
      // 소켓
      let socket1 = perSumData.sockets[item.socket1.name];
      if(socket1){
        perSumData.sockets[item.socket1.name] += item.socket1.number;
      }else {
        perSumData.sockets[item.socket1.name] = item.socket1.number;
      }
      
      let socket2 = perSumData.sockets[item.socket2.name];
      if(socket2){
        perSumData.sockets[item.socket2.name] += item.socket2.number;
      }else {
        perSumData.sockets[item.socket2.name] = item.socket2.number;
      }
      // console.log(perSumData.sockets, perSumData.sockets[item.socket1.name], item.socket1.number, perSumData.sockets[item.socket2.name], item.socket2.number)

      // 패널티
      let penalty = perSumData.penalty[item.badSocket1.name];
      if(penalty){
        perSumData.penalty[item.badSocket1.name] += item.badSocket1.number;
      }else {
        perSumData.penalty[item.badSocket1.name] = item.badSocket1.number;
      }
      
      // console.log(perSumData.penalty)
      let stop = false;
      for(let key of Object.keys(perSumData.penalty)){
        if(perSumData.penalty[key] > 4) {
          stop = true;
          break;
        }
      }
      if(stop === true) {
        return;
      }
      
      // 특성
      let prop1 = perSumData.property[item.property1.name];
      if(prop1){
        perSumData.property[item.property1.name] += item.property1.number;
      }else {
        perSumData.property[item.property1.name] = item.property1.number;
      }
      
      let prop2 = perSumData.property[item.property2.name];
      if(prop2){
        perSumData.property[item.property2.name] += item.property2.number;
      }else {
        perSumData.property[item.property2.name] = item.property2.number;
      }

      if(perSumData.property['[신속]'] 
        && perSumData.property['[신속]'] > Number(props['[신속]']) + 100) {
        return;
      }
      if(perSumData.property['[치명]'] 
        && perSumData.property['[치명]'] > Number(props['[치명]']) + 100) {
        return;
      }
      if(perSumData.property['[특화]'] 
        && perSumData.property['[특화]'] > Number(props['[특화]']) + 100) {
        return;
      }
      
      // stop = false;
      // for(let key of Object.keys(perSumData.property)){
      //   if(perSumData.property[key] > 1200) {
      //     stop = true;
      //     break;
      //   }
      // }
      // if(stop === true) {
      //   return;
      // }

      let newMakeList = [...makeList, item];
      if(depth + 1 >= 5) {
        // console.log(newMakeList, perSumData);
        if(perSumData.price > maxPrice) {
          // 가격이 넘으면 안되고
          return;
        }
        let itemPropSum = perSumData.property['[신속]'] ? perSumData.property['[신속]'] : 0
                         + perSumData.property['[특화]'] ? perSumData.property['[특화]'] : 0
                         + perSumData.property['[치명]'] ? perSumData.property['[치명]'] : 0;
        if(propSum > itemPropSum){
          // 특성 합이 부족하면 탈락
          // return;
        }

        // 개별 특성 합이 너무 부족해도 탈락 
        if(perSumData.property['[신속]'] 
          && perSumData.property['[신속]'] < Number(props['[신속]'])) {
          return;
        }
        if(perSumData.property['[치명]'] 
          && perSumData.property['[치명]'] < Number(props['[치명]'])) {
          return;
        }
        if(perSumData.property['[특화]'] 
          && perSumData.property['[특화]'] < Number(props['[특화]'])) {
          return;
        }
        perSumData.propertySum = ((perSumData.property['[특화]'] ? perSumData.property['[특화]'] : 0)
                                + (perSumData.property['[신속]'] ? perSumData.property['[신속]'] : 0)
                                + (perSumData.property['[치명]'] ? perSumData.property['[치명]'] : 0));

        allOfFinal.push([newMakeList, perSumData]);
        if(allOfFinal.length > dataLimit + 2) {
          console.log('data too much more');
          tooMuchData = true;
        }
        // this.testAllData.push([newMakeList, perSumData]);
        return;
      } 

      recursive(sourceList, depth + 1, newMakeList, perSumData);
    });
  }
  let prePenalty: any = {};
  prePenalty[penalty.name] = Number(penalty.number);
  recursive(itemList, 0, [], {price: 0, sockets: {}, penalty: prePenalty, property: {}, propertySum: 0,});
  // console.log('end of getFinalComposition');
  if(allOfFinal.length > dataLimit) {
    return -allOfFinal.length;
  }
  return allOfFinal;
}


enum ACCTYPE {
  ALL = 0,
  NECK = 200010,
  EARRING = 200020,
  RING = 200030,
}

function getDataFromDB(firstSocket: Socket, secondSocket: Socket, propertyType: number, accType: number, grade: number, itemList: any[]) {
  const today = moment()
  // console.log('getDataFromDB', {
  //   grade: grade,
  //   accType: accType,
  //   propertyType: propertyType,
  //   'socket1.id': firstSocket.id,
  //   'socket1.number': firstSocket.number,
  //   'socket2.id': secondSocket.id,
  //   'socket2.number': secondSocket.number, 
  //   timestamp: {
  //       $gte: today.clone().add(-30, 'minute').toDate(),
  //       $lte: moment().toDate()
  //   }
  // })
  return db.accessary.findOne({
    grade: grade,
    accType: accType,
    propertyType: propertyType,
    'socket1.id': firstSocket.id,
    'socket1.number': firstSocket.number,
    'socket2.id': secondSocket.id,
    'socket2.number': secondSocket.number, 
    timestamp: {
        $gte: today.clone().add(-30, 'minute').toDate(),
        $lte: moment().toDate()
    }
  },
  ).then((res : any) => {
    // console.log('데이터 가져옴?', res);
    return res;
  });
}

/**
 * 
 * @param list 2차원 배열 ex) [ [ 4, 4 ], [ 4, 4 ], [ 3, 3 ], [ 5, 5, 5 ], [ 3 ] ]
 * @returns 3의 개수
 */
function countThree(list: any[]) : number {
  let sumOfThree = list.reduce((sum : number, current : number[]) => {
    let subSumOfThree = current.reduce((three : number, num: number) => {
      if(num === 3) {
        ++three;
      }
      return three;
    }, 0);
    sum += subSumOfThree;
    return sum;
  }, 0);
  return sumOfThree;
}

/**
 * * 아이템 사전을 만든다.
 * @param socketList 각인 리스트
 * @param grade 전설, 유물 등
 * @param valueList 각인 수치 조합 등
 */
function spreadSocketComposition(socketList: any[], grade: number, valueList: any[], ) : Promise<ItemDictionary[]> {
  let socketLength = socketList.length;
  let itemTypeList: ItemDictionary[] = [];
  let promiseList: any[] = [];
  for(let i = 0; i < socketLength; ++i){
    for(let j = i + 1; j < socketLength; ++j){
      
      for(let value of valueList) {
        // [3, 3], [3, 4] 등 악세 수치 조합
        
        let itemType : ItemDictionary = {
          grade: grade,
          socket1: {
            id: socketList[i].id,
            number: value[0],
          },
          socket2: {
            id: socketList[j].id,
            number: value[1],
          },
          necklessList: [],
          earringList: [],
          ringList: [],
        }
        
        // db에서 데이터 가져오기
        promiseList.push(getDataFromDB(itemType.socket1, itemType.socket2, 0, ACCTYPE.NECK, grade, []).then((res: any) => {
          if(!res){
            // console.log("DEBUG :: db에서 가져오기를 실패했습니다", itemType.socket1, itemType.socket2, ACCTYPE.NECK, grade, res);
            return;
          } else {
            // console.log("DEBUG :: db에서 가져오기 성공", itemType.socket1, itemType.socket2, ACCTYPE.NECK, grade);
            itemType.necklessList = itemType.necklessList.concat(res.list);
            return;
          }
        }));
        promiseList.push(getDataFromDB(itemType.socket1, itemType.socket2, 1, ACCTYPE.NECK, grade, []).then((res: any) => {
          if(!res){
            // console.log("DEBUG :: db에서 가져오기를 실패했습니다", itemType.socket1, itemType.socket2, ACCTYPE.NECK, grade, res);
            return;
          } else {
            // console.log("DEBUG :: db에서 가져오기 성공", itemType.socket1, itemType.socket2, ACCTYPE.NECK, grade);
            itemType.necklessList = itemType.necklessList.concat(res.list);
            return;
          }
        }));
        promiseList.push(getDataFromDB(itemType.socket1, itemType.socket2, 2, ACCTYPE.NECK, grade, []).then((res: any) => {
          if(!res){
            // console.log("DEBUG :: db에서 가져오기를 실패했습니다", itemType.socket1, itemType.socket2, ACCTYPE.NECK, grade, res);
            return;
          } else {
            // console.log("DEBUG :: db에서 가져오기 성공", itemType.socket1, itemType.socket2, ACCTYPE.NECK, grade);
            itemType.necklessList = itemType.necklessList.concat(res.list);
            return;
          }
        }));
        // ------
        promiseList.push(getDataFromDB(itemType.socket1, itemType.socket2, 0, ACCTYPE.EARRING, grade, []).then((res: any) => {
          if(!res){
            // console.log("DEBUG :: db에서 가져오기를 실패했습니다", itemType.socket1, itemType.socket2, ACCTYPE.EARRING, grade, res);
            return;
          } else {
            // console.log("DEBUG :: db에서 가져오기 성공", itemType.socket1, itemType.socket2, ACCTYPE.EARRING, grade);
            itemType.earringList = itemType.earringList.concat(res.list);
            return;
          }
        }));
        promiseList.push(getDataFromDB(itemType.socket1, itemType.socket2, 1, ACCTYPE.EARRING, grade, []).then((res: any) => {
          if(!res){
            // console.log("DEBUG :: db에서 가져오기를 실패했습니다", itemType.socket1, itemType.socket2, ACCTYPE.EARRING, grade, res);
            return;
          } else {
            // console.log("DEBUG :: db에서 가져오기 성공", itemType.socket1, itemType.socket2, ACCTYPE.EARRING, grade);
            itemType.earringList = itemType.earringList.concat(res.list);
            return;
          }
        }));
        promiseList.push(getDataFromDB(itemType.socket1, itemType.socket2, 2, ACCTYPE.EARRING, grade, []).then((res: any) => {
          if(!res){
            // console.log("DEBUG :: db에서 가져오기를 실패했습니다", itemType.socket1, itemType.socket2, ACCTYPE.EARRING, grade, res);
            return;
          } else {
            // console.log("DEBUG :: db에서 가져오기 성공", itemType.socket1, itemType.socket2, ACCTYPE.EARRING, grade);
            itemType.earringList = itemType.earringList.concat(res.list);
            return;
          }
        }));
        // ------
        promiseList.push(getDataFromDB(itemType.socket1, itemType.socket2, 0, ACCTYPE.RING, grade, []).then((res: any) => {
          if(!res){
            // console.log("DEBUG :: db에서 가져오기를 실패했습니다", itemType.socket1, itemType.socket2, ACCTYPE.RING, grade, res);
            return;
          } else {
            // console.log("DEBUG :: db에서 가져오기 성공", itemType.socket1, itemType.socket2, ACCTYPE.RING, grade);
            itemType.ringList = itemType.ringList.concat(res.list);
            return;
          }
        }));
        promiseList.push(getDataFromDB(itemType.socket1, itemType.socket2, 1, ACCTYPE.RING, grade, []).then((res: any) => {
          if(!res){
            // console.log("DEBUG :: db에서 가져오기를 실패했습니다", itemType.socket1, itemType.socket2, ACCTYPE.RING, grade, res);
            return;
          } else {
            // console.log("DEBUG :: db에서 가져오기 성공", itemType.socket1, itemType.socket2, ACCTYPE.RING, grade);
            itemType.ringList = itemType.ringList.concat(res.list);
            return;
          }
        }));
        promiseList.push(getDataFromDB(itemType.socket1, itemType.socket2, 2, ACCTYPE.RING, grade, []).then((res: any) => {
          if(!res){
            // console.log("DEBUG :: db에서 가져오기를 실패했습니다", itemType.socket1, itemType.socket2, ACCTYPE.RING, grade, res);
            return;
          } else {
            // console.log("DEBUG :: db에서 가져오기 성공", itemType.socket1, itemType.socket2, ACCTYPE.RING, grade);
            itemType.ringList = itemType.ringList.concat(res.list);
            return;
          }
        }));

        itemTypeList.push(itemType);
      }

    }
  }
  return Promise.all(promiseList).then((res: any) => {
    console.log('아이템 사전 만들었어요');
    return itemTypeList;
  });
}
interface ItemDictionary {
  grade: number;
  socket1: {
    id: number;
    number: number;
  },
  socket2: {
    id: number;
    number: number;
  },
  necklessList: AccData[],
  earringList: AccData[],
  ringList: AccData[],
}

/**
 * * 소켓 수치 배열을 -> 아이템 각인 리스트로 변환
 * @param socketList 
 * @param caseOne
 * @return [
 *   { socket1: { id: 118, number: 5 }, socket2: { id: 141, number: 3 } },
 *    ...
 * ]
 */
function findSocket(socketList: any[], caseOne: any[]) {
  let itemComposition: any[] = [];
  caseOne.forEach((item: number[]) => {
    let itemSocket = {
      socket1: {
        id: 0,
        number: -1,
      },
      socket2: {
        id: 0,
        number: -1,
      }
    }
    for(let i = 0; i < item.length; ++i) {
      if(item[i] !== 0){
        if(itemSocket.socket1.number === -1){
          itemSocket.socket1.id = socketList[i].id
          itemSocket.socket1.number = item[i];
        } else {
          itemSocket.socket2.id = socketList[i].id
          itemSocket.socket2.number = item[i];
        }
      }
    }
    itemComposition.push(itemSocket);
    // console.log('findSocket', itemSocket);
  })
  return itemComposition;
}