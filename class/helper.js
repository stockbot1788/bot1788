var fs = require('fs-sync');
var fsNormal = require('fs');

exports.peakToPlotData = function(peak,stock){
    var ReturnVal = {};
    for(var i=0;i<peak.length;i++){
       // ReturnVal.push(stock.vol[peak[i].index]);
       var date = DayToUnix(stock.date[peak[i].index]);
       ReturnVal[date] = stock.vol[peak[i].index];
    }
    return ReturnVal;
}

exports.mapDateAndVol = function(stock){
    var ReturnVal = {};
    for(var i=0;i<stock.vol.length;i++){
       // ReturnVal.push(stock.vol[peak[i].index]);
       var date = DayToUnix(stock.date[i]);
       ReturnVal[date] = stock.vol[i];
    }
    return ReturnVal;
}

exports.sortByWeek=function(stock){
    var ReturnArr = [];

    var WeekEnd = [];
    for(var i=0;i<stock.vol.length;i++){
        var date = DayToDate(stock.date[i]);
        WeekEnd.push(i);
        if(date.getDay()==5 && i!=stock.vol.length-1){
            ReturnArr.push(WeekEnd);
            WeekEnd = [];
        }
     }
     ReturnArr.push(WeekEnd);
     return ReturnArr;
}

exports.LongTailsDetector=function(stockVal){

    var body = (stockVal.o-stockVal.c);
    var topLeg = 0;
    var bottomLeg = 0;
    if(body>0){
        topLeg = Math.abs(stockVal.h-stockVal.o);
        bottomLeg =  Math.abs(stockVal.c - stockVal.l);
    }else{
        topLeg = Math.abs(stockVal.h-stockVal.c);
        bottomLeg = Math.abs(stockVal.o - stockVal.l);
    }

    var topRatio = 0;
    var bottomRatio = 0;
    if(body!=0){
        topRatio = topLeg/body
    }
    if(body!=0){
        bottomRatio = bottomLeg/body
    }

    //console.log("%s %s",topRatio,bottomRatio);
    return {
        tR:Math.abs(topRatio),
        bR:Math.abs(bottomRatio),
        body:body,
        topTails:topRatio,
        bottomTails:bottomRatio
    };
}

exports.readFile=function(fileName){
    var txt = "";
    if(fs.exists(fileName)){
        txt = fs.read(fileName);   
        return txt;
    }
}

exports.getSupport = function(Stock){
    var weekIdx = this.sortByWeek(Stock);
    var WeekMaxArr = [];
    var MaxVol = 0;
    for(var i=0;i<weekIdx.length;i++){
        var Max = {
            pos:0,
            val:0
        }
        for(var j=0;j<weekIdx[i].length;j++){
            var idx = weekIdx[i][j];
            if(Stock.vol[idx]>Max.val){
                Max.val = Stock.vol[idx];
                Max.pos = idx;
            }
            if(Stock.vol[idx]>MaxVol){
                MaxVol = Stock.vol[idx];
            }
        }
        WeekMaxArr.push(Max);
    }

    var PredictedBoard = [];
    for(var i=0;i<WeekMaxArr.length;i++){
        var idx = WeekMaxArr[i].pos;
        var Ratio = this.LongTailsDetector(Stock.Arr[idx]);
        if(Ratio.bR>4 || Ratio.tR>4){
            var Result = AnalysisTails(Ratio,Stock.Arr[idx]);
            if(Result.IsFind){
               var cfl =  idx/Stock.Arr.length * 0.4 +
               Stock.vol[idx]/MaxVol * 0.6
               if(cfl>0.6){
                PredictedBoard.push(Result);
               }
            }
        }
    }
    
    var Sum = 0;
    for(var i=Stock.Arr.length-15;i<Stock.Arr.length;i++){
        var changePercentage = (Stock.Arr[i].h-Stock.Arr[i].l)/Stock.Arr[i].o;
        //console.log(data);
        Sum = Sum +  changePercentage;
    }
    var total = Sum/15;
    console.log(total);
 
}

exports.saveCSV = function(Stock){
    var s = Stock[0].date.split(" ");
    var date = s[0];
    fsNormal.writeFileSync("./data/"+date+".txt","")
    for(var i=0;i<Stock.length;i++){
        var SingleItem = Stock[i];
        var Str = "";
        for (var k in SingleItem){
           // console.log("print item "+SingleItem[k]);
           Str += SingleItem[k]+",";
        }
        Str = Str.substring(0, Str.length - 1);
        fsNormal.appendFileSync("./data/"+date+".txt",Str+"\n");
        //console.log("print str "+Str);
    }
}

exports.saveCSVWithFileName = function(Stock,file){
    var s = Stock[0].date.split(" ");
    var date = s[0];
    fsNormal.writeFileSync(file,"")
    for(var i=0;i<Stock.length;i++){
        var SingleItem = Stock[i];
        var Str = "";
        for (var k in SingleItem){
           // console.log("print item "+SingleItem[k]);
           Str += SingleItem[k]+",";
        }
        Str = Str.substring(0, Str.length - 1);
        fsNormal.appendFileSync(file,Str+"\n");
        //console.log("print str "+Str);
    }
}

exports.getDataForRealTimeTrade = function(path){
    var StockDataArr = [];
    var data = fsNormal.readFileSync(path);
    var dataArr = (data+"").split("\n");
    var date = "";
    var item;
    for(var i=0;i<dataArr.length;i++){
        var itemDate = dataArr[i].split(",")[0].split("  ")[0];
        if(itemDate!=date){
            date = itemDate;
            item = {
                date:date,
                data:[]
            }
            StockDataArr.push(item)
        }
        item.data.push(dataArr[i])
    }
    return StockDataArr;
}

exports.getDataForTraining = function(){
    var fileArr =[];
    var StockDataArr = [];

    fsNormal.readdirSync("./data").forEach(file => {
        //console.log(file);
        fileArr.push("./data/"+file);
        var data = fsNormal.readFileSync(fileArr[fileArr.length-1]);
        var dataArr = (data+"").split("\n");
        var date = "";
        var item;
        for(var i=0;i<dataArr.length;i++){
            var itemDate = dataArr[i].split(",")[0].split("  ")[0];
            if(itemDate!=date){
                date = itemDate;
                item = {
                    date:date,
                    data:[]
                }
                StockDataArr.push(item)
            }
            item.data.push(dataArr[i])
        }
    });  
    return StockDataArr;  
}

function AnalysisTails(Ratio,Stock){
    var Diff = (Ratio.tR - Ratio.bR);
    var RatioR = 0;
    if(Diff > 0){
        RatioR =  Diff /Ratio.tR * 100;
    }else{
        RatioR =  Diff /Ratio.bR * 100;
    }
    RatioR = Math.abs(RatioR);
    if(RatioR>70){
        var topB = -999;
        var bottomB = -999;
        
        if(Diff>0){
            topBord = Stock.h
        }else{
            bottomB = Stock.c
        }
        return {
            IsFind:true,
            topB:topB,
            bottomB:bottomB
        }
    }else{
        return {IsFind:false}
    }
      
}

function DayToUnix(date){
    var ReturnVal = "";
    var y = date.substring(0, 4);
    var m = date.substring(4, 6);
    var d = date.substring(6, 8);
    var dd = new Date(y, m-1, d, 0, 0, 0, 0).getTime() / 1000 + 8*60*60
    ReturnVal = dd;
    return ReturnVal;
}
function DayToDate(date){
    var ReturnVal = "";
    var y = date.substring(0, 4);
    var m = date.substring(4, 6);
    var d = date.substring(6, 8);
    var dd = new Date(y, m-1, d, 0, 0, 0, 0).getTime() / 1000 + 8*60*60
    var date = new Date(dd*1000);
    return date;
}