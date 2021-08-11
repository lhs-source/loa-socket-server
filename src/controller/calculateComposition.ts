
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