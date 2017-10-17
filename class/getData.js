var request = require('sync-request');
var parser = require('xml2json');
var regression = require('regression');

exports.getCur = function(url){
    var res = request('GET', ""+url);
    var json = parser.toJson(res.getBody('utf8'));
}

exports.StockRealTime = function(url,code){
    var res = request('GET', ""+url);
    var data = JSON.parse(res.getBody('utf8'));

    var KeyValDict = {};
    var Arr = [];
    var dateR = [];
    var volR = [];

    if(url.includes("money18")){
        var price = data["price"].values;
        var date = data["x_axis"].labels;
        var vol = data["vol"].values;
        
        for(var i=0; i < date.length; i ++){
            dateR.push(date[i]);
            volR.push(vol[i]);
            var temp = {
                p:price[i],
                v:vol[i],
                d:date[i]
            }
            KeyValDict[date[i]] = temp;
            Arr.push(temp);
        }
        
    }
        
    return {
        stockCode :code,
        url:url,
        Dict:KeyValDict,
        Arr:Arr,
        date:dateR,
        vol:volR
    }
}
exports.StockDaily = function(url,code){
    var res = request('GET', ""+url);
    var data = JSON.parse(res.getBody('utf8'));

    var KeyValDict = {};
    var Arr = [];
    var dateR = [];
    var volR = [];
    
    if(url.includes("money18")){
        var high = data["high"].values;
        var low  = data["low"].values;
        var open = data["open"].values;
        var close = data["price"].values;
        date = data["x_axis"].labels;
        vol = data["vol"].values

        for(var i=open.length-30; i < open.length; i ++){
            dateR.push(date[i]);
            volR.push(vol[i]);
            var temp = {
                h:high[i],
                l:low[i],
                o:open[i],
                c:close[i],
                v:vol[i],
                d:date[i]
            }
            KeyValDict[date[i]] = temp;
            Arr.push(temp);
        }
    }
    
    return {
        stockCode :code,
        url:url,
        Dict:KeyValDict,
        Arr:Arr,
        date:dateR,
        vol:volR
    }
}

exports.getInstantTrendWithLinearRegression = function(stockCode){
    var returnVal = [];
    var M18Url = "http://money18.on.cc/chartdata/d1/price/"+stockCode+"_price_d1.txt"
    var DataArr = this.StockRealTime(M18Url,stockCode);
    var V = DataArr['Arr'].reverse();

    var OutArr =[];
    for(var i=0;i<DataArr['Arr'].length;i++){
        var tmp = V[i].d; 
        tmp = tmp.split(":");
        if(tmp[1]%3==0){
            OutArr.push(V[i]);
        }
    }

    //console.log(OutArr);
    var RegressionData = [];
    var idx = 0;
    //console.log("---------")
    for(var i=5;i>0;i--){
        var diff = (OutArr[i].p-OutArr[OutArr.length-1].p)/OutArr[OutArr.length-1].p;
        diff = diff * 100;
        tmp = [idx,diff];
        //console.log("price : "+diff+ " date :"+OutArr[i].d);
        idx = idx + 1;
        RegressionData.push(tmp);
    }
    //console.log("---------")
    
    
    var result = regression.linear(RegressionData,{ precision: 10});
    returnVal['slope'] = result.equation[0];
    returnVal['y'] = result.equation[1];
    returnVal['stock'] = stockCode

    return returnVal;
}

exports.getTrendWithLinearRegression = function(stockCode){
    var returnVal = [];
    var M18Url = "http://money18.on.cc/chartdata/full/price/"+stockCode+"_price_full.txt"
    var DataArr = this.StockDaily(M18Url,stockCode);
    var V = DataArr['Arr'].reverse();
 
    var RegressionData = [];
    var idx = 0;
    for(var i=V.length-4;i>0;i--){
        //console.log(V[i].c);
        tmp = [idx,V[i].c];
        idx = idx + 1;
        RegressionData.push(tmp);
    }
    var result = regression.linear(RegressionData);

    returnVal['slope'] = result.equation[0];
    returnVal['y'] = result.equation[1];
    returnVal['stock'] = stockCode
    
    return returnVal;
}