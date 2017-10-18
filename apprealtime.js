var getData = require("./class/getData.js");
var Utils = require("./class/helper.js");

var d3_peaks = require('d3-peaks');
var plot = require('plotter').plot;
var tto = require('terminal-table-output').create();
var moment = require('moment');
var async = require('async');


/*
var stock_numberFile="fulllist.json";
var returnTxt = Utils.readFile("fulllist.json");
var StockCodeArr = returnTxt.split(",");

var slopeSum = 0;
for(var i=0;i<StockCodeArr.length;i++){
    var val = getData.getInstantTrendWithLinearRegression(StockCodeArr[i]);
    tto.pushrow([val['stock'], val['slope']]);

}

tto.print(true);

var StockCode = "00700";
var M18Url = "http://money18.on.cc/chartdata/full/price/"+StockCode+"_price_full.txt"
var M18UrlCurr = "http://money18.on.cc/securityQuote/genStockXMLHK.php?t=1506072569226&coding=big5-hkscs&stockcode="+StockCode
*/


var _ = require('lodash');
var chalk = require('chalk');
var StockArr = [];

var count = 0;
var ib = new (require('ib'))({
  // clientId: 0,
  // host: '127.0.0.1',
  port: 7497
}).on('error', function (err) {
  console.error(chalk.red(err.message));
}).on('historicalData', function (reqId, date, open, high, low, close, volume, barCount, WAP, hasGaps) {
  if (_.includes([-1], open)) {
    if (StockArr.length > 0) {
      Utils.saveCSVWithFileName(StockArr,"./realtime/real.txt");
    }
  } else {
    count++;
    var stock = {
      date: date,
      open: open,
      high: high,
      low: low,
      close: close,
      volume: volume
    };

    StockArr.push(stock)
    /*
    console.log(
    '%s %s%d %s%s %s%d %s%d %s%d %s%d %s%d %s%d %s%d %s%d',
    chalk.cyan('[historicalData]'),
    'reqId='.bold, reqId,
    'date='.bold, date,
    'open='.bold, open,
    'high='.bold, high,
    'low='.bold, low,
    'close='.bold, close,
    'volume='.bold, volume,
    'barCount='.bold, barCount,
    'WAP='.bold, WAP,
    'hasGaps='.bold, hasGaps
    );
    */
  }
});




// tickerId, contract, endDateTime, durationStr, barSizeSetting, whatToShow, useRTH, formatDate


var date = "20171030"
ib.connect();
ib.reqHistoricalData(1, ib.contract.future("MHI", date, "HKD", "HKFE"), "20171018" + ' 18:00:00', durationStr = '1 D', barSizeSetting = '3 mins', whatToShow = 'TRADES', useRTH = 1, formatDate = 1, false);
ib.on('historicalData', function (reqId, date, open, high, low, close, volume, barCount, WAP, hasGaps) {
  if (_.includes([-1], open)) {
    ib.disconnect();
  }
})

/*
var makeFuction = function(date) {
  return function(callback) {
    ib.connect();
    ib.reqHistoricalData(1, ib.contract.future("MHI", "20170928", "HKD", "HKFE"), date + ' 18:00:00', durationStr = '1 D', barSizeSetting = '3 mins', whatToShow = 'TRADES', useRTH = 1, formatDate = 1, false);
    ib.on('historicalData', function (reqId, date, open, high, low, close, volume, barCount, WAP, hasGaps) {
      if (_.includes([-1], open)) {
        ib.disconnect();
        callback(null);
      }
    })
  } 
}

var counter = 0
function getData(date) {
  return makeFuction(date)
}

array = []
var dateString = "20170901";
var m = moment(dateString, "YYYYMMDD");

for (var ii = 0; ii < 10; ii++) {
  m.add(1, 'days')
  var newDateString = m.format('YYYYMMDD')
  array.push(makeFuction(newDateString))
}

async.series(array, function (err, result) {
  if (err != null) {
    console.log('something wrong')
    return
  }

  console.log('well done.')

})
*/

