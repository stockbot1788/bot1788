var MaxMA = 50;
var MaxRatio = 900;
const EMA = require('technicalindicators').EMA;
const SMA = require('technicalindicators').SMA;

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
    //return 1.00000001
}
exports.initPopulation = function(p_size){
    var ReturnPP = [];
    for(var i=0;i<p_size;i++){
        var geno = {
            Fir_MA:Math.floor((Math.random() * MaxMA) + 1),
            Sec_Ma:Math.floor((Math.random() * MaxMA) + 1),
            Fir_Ra:getRandomArbitrary(1.001,1.009),
            Sec_Ra:getRandomArbitrary(1.001,1.009),
            Score:0,
            bet:0
        }
        ReturnPP.push(geno);
    }
   // console.log(ReturnPP);
    return ReturnPP;
}

exports.countFitness = function(data, population){
    for(var j=0;j<population.length;j++){
        for(var i=0;i<data.length;i++){
            var singlePP = population[j];
            singlePP = countSingleDateFitness(data[i].data,singlePP);
            population[j] = singlePP;
        }
    }

    population.sort(compare);
    /*
    for(var j=0;j<population.length;j++){
            var singlePP = population[j];
            console.log(singlePP);
    }*/
    population = population.reverse();
    return population;
}

function compare(a,b) {
    if (a.Score < b.Score)
      return -1;
    if (a.Score > b.Score)
      return 1;
    return 0;
  }

exports.NextGeneration=function(population,betCount,pp_size,parent_size,keepParent){
    var newPp =[];
    for(var i=0;i<keepParent;i++){
        population[i].Score = 0;
        population[i].bet = 0;
        newPp.push(population[i]);
    }
    for(var i=0;i<pp_size-keepParent;i++){
        var geno = {
            Fir_MA:Math.floor((Math.random() * MaxMA) + 1),
            Sec_Ma:Math.floor((Math.random() * MaxMA) + 1),
            Fir_Ra:getRandomArbitrary(1.001,1.009),
            Sec_Ra:getRandomArbitrary(1.001,1.009),
            Score:0,
            bet:0
        }
        var allBetZeroParent = true;
        
        for(k=0;k<parent_size;k++){
           if(population[k].Score>0){
            allBetZeroParent = true
            break;
           }
        }

        if(allBetZeroParent==true){
                    var parent1 = Math.floor((Math.random() * parent_size));
                    var parent2 = Math.floor((Math.random() * parent_size));

                    var par1 = population[parent1];
                    var par2 = population[parent2];
                    
                    /*
                    while(par1.Score<=0){
                        parent1 = Math.floor((Math.random() * parent_size));
                        par1 = population[parent1];
                    }

                    while(par2.Score<=0){
                        parent2 = Math.floor((Math.random() * parent_size));
                        par2 = population[parent2];
                    }*/

                    var par1Geno = Math.floor((Math.random() * 4));
                    
                    if(par1Geno==0){
                        geno.Fir_MA = par1.Fir_MA
                    }if(par1Geno==1){
                        geno.Sec_Ma = par1.Sec_Ma
                    }if(par1Geno==2){
                        geno.Fir_Ra = par1.Fir_Ra
                    }if(par1Geno==3){
                        geno.Sec_Ra = par1.Sec_Ra
                    }
                    var par2Geno = Math.floor((Math.random() * 4));
                    while(par2Geno==par1Geno){
                        par2Geno = Math.floor((Math.random() * 4));
                    }

                    if(par2Geno==0){
                        geno.Fir_MA = par2.Fir_MA
                    }if(par2Geno==1){
                        geno.Sec_Ma = par2.Sec_Ma
                    }if(par2Geno==2){
                        geno.Fir_Ra = par2.Fir_Ra
                    }if(par2Geno==3){
                        geno.Sec_Ra = par2.Sec_Ra
                    }

                    var par3Geno = Math.floor((Math.random() * 4));
                    while(par3Geno==par1Geno || par3Geno==par2Geno){
                        par3Geno = Math.floor((Math.random() * 4));
                    }

                    if(par3Geno==0){
                        geno.Fir_MA = par1.Fir_MA
                    }if(par3Geno==1){
                        geno.Sec_Ma = par1.Sec_Ma
                    }if(par3Geno==2){
                        geno.Fir_Ra = par1.Fir_Ra
                    }if(par3Geno==3){
                        geno.Sec_Ra = par1.Sec_Ra
                    }
        }
        newPp.push(geno);
    }

    return newPp;
}

exports.backTest = function(data,singlePP){
    return countSingleDateFitness(data,singlePP);
}
function countSingleDateFitness(data,singlePP){

   
    var Score = 0;
    var Bet = 0;
    var firstMA = parseInt(singlePP.Fir_MA);
    var secMa = parseInt(singlePP.Sec_Ma);
    
    var closeArr =[];
    for(var i=0;i<data.length;i++){
        var str = data[i];
        var arr = str.split(",");
        closeArr.push(parseInt(arr[4]));
    }
    var MA1 = SMA.calculate({period : firstMA, values : closeArr});
    var MA2 = SMA.calculate({period : secMa, values : closeArr});
    //console.log("%s   %s   %s     %s     %s",MA1.length,MA2.length,firstMA,secMa,closeArr.length);

    var ma1Idx = MA1.length-1;
    var ma2Idx = MA2.length-1;
    var itemArr = [];
    for(var i=data.length-1;i>0;i--){
        if(ma1Idx>=0 && ma2Idx>=0){
            var str = data[i];
            var arr = str.split(",");
            var close = parseInt(arr[4]);
            closeArr.push(parseInt(arr[4]));
            var item = {
                MA1:MA1[ma1Idx],
                MA2:MA2[ma2Idx],
                idx:i
            }
            ma1Idx--;
            ma2Idx--;
            itemArr.push(item);
        }
    }
    itemArr = itemArr.reverse();
  
    for(var i=0;i<itemArr.length;i++){
        if(i<itemArr.length-7){
            var item = itemArr[i];
            var StockDateIdx = item.idx;
            var buyPrice = data[StockDateIdx].split(",")[4];
            if(item.MA1/item.MA2>=1 && item.MA1/item.MA2>singlePP.Fir_Ra){
                Bet ++;
                for(var j = StockDateIdx; j<StockDateIdx+7;j++){
                    var high = data[j].split(",")[2];
                    var low = data[j].split(",")[3];
                    if(buyPrice-low>10 ){
                        i = i+ (j-StockDateIdx);
                        Score = Score -15;
                        break;
                    }
                    if(high-buyPrice>30 ){
                        i = i+ (j-StockDateIdx);
                        Score = Score + 30;
                        break;
                    }
                    if(StockDateIdx+6 == j){
                        var close = data[StockDateIdx].split(",")[4];
                        Score = Score + (close-buyPrice);
                        i = i+6;
                    }
                }
            }else if(item.MA1/item.MA2<=1 && item.MA2/item.MA1>singlePP.Sec_Ra){
                Bet ++;
                for(var j = StockDateIdx; j<StockDateIdx+7;j++){
                    var high = data[j].split(",")[2];
                    var low = data[j].split(",")[3];
                    if(high-buyPrice>15 ){
                        i = i+ (j-StockDateIdx);
                        Score = Score - 20;
                        break;
                    }
                    if(buyPrice-low>30 ){
                        i = i+ (j-StockDateIdx);
                        Score = Score + 30;
                        break;
                    }
                    if(StockDateIdx+6 == j){
                        var close = data[StockDateIdx].split(",")[4];
                        Score = Score - (close-buyPrice);
                        i = i+6;
                    }
                }
            }
        }
    }

    singlePP.Score = singlePP.Score + Score;
    singlePP.bet = singlePP.bet + Bet;
    return singlePP;
}
