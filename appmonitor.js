var request = require('sync-request');
var MHIFuture = "http://zycp.gwecaopan.com/futuresquote/getFuturesQuote.json?commodityNo=MHI&type=minute"
var moment = require('moment');
var childProcess = require('child_process');
var Utils = require("./class/helper.js");
const SMA = require('technicalindicators').SMA;
var http = require('http');

const TelegramBot = require('node-telegram-bot-api');
const token = '461075900:AAGqfVgK6XmhKfb1S1etS-e8HfRjdEltMYQ';
const bot = new TelegramBot(token, {polling: false});

function GetFuture(Url){
  var ReturnVal = {};
  var res = request('GET', ""+Url);
  var data = JSON.parse(res.getBody('utf8'));
  var item = data['data'].split(";");

  const SMA = require('technicalindicators').SMA;

  for(var i=0;i<data['data'].split(";").length;i++){
      var tmp = item[i];
      var AllVal = tmp.split(",");
      ReturnVal[parseInt(AllVal[0]/1000)+8*60*60] = parseFloat(AllVal[1])
  }
  return ReturnVal;
}


function runScript(scriptPath, callback) {

      // keep track of whether callback has been invoked to prevent multiple invocations
      var invoked = false;
  
      var process = childProcess.fork(scriptPath);
  
      // listen for errors as they may prevent the exit event from firing
      process.on('error', function (err) {
          if (invoked) return;
          invoked = true;
          callback(err);
      });
  
      // execute the callback once the process has finished running
      process.on('exit', function (code) {
          if (invoked) return;
          invoked = true;
          var err = code === 0 ? null : new Error('exit code ' + code);
          callback(err);
      });
  
  }
  
  

var BuyList = {};



var minutes = 1, the_interval = minutes * 60 * 1000;

setInterval(function() {
  var time = moment(); 
  if(time.minute()%2==1){
    performForOneMins();
    console.log("I am doing 1 minutes check");
  }else{
    console.log("I am doing 2 minutes check");
    performForTwoMins();
  }
}, the_interval);





function performForTwoMins(){
  runScript('./apprealtime.js', function (err) {
    console.log("can data from ib");
    if (err) throw err;
    performForOneMins();
    console.log("can data from ib complete");
  });
}

function performForOneMins(){
  CheckIsBuylist();
}

function CheckIsBuylist(){

  var geno = {
    Fir_MA:3,
    Sec_Ma:1,
    Fir_Ra:1.0010593463322641,
    Sec_Ra:1.001013127294255,
    Score:0,
    bet:0
}

  var StockArr = Utils.getDataForRealTimeTrade("./realtime/real.txt");
  var closeArr =[];
  var data = StockArr[0].data;
  for(var i=0;i<data.length;i++){
      var str = data[i];
      var arr = str.split(",");
      closeArr.push(parseInt(arr[4]));
  }

  var MA1 = SMA.calculate({period : geno.Fir_MA, values : closeArr});
  var MA2 = SMA.calculate({period : geno.Sec_Ma, values : closeArr});

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
  for(var i=Math.max(0,itemArr.length-6);i<itemArr.length;i++){
  //for(var i=0;i<itemArr.length;i++){
    var item = itemArr[i];
    if(item.MA1/item.MA2>=1 && item.MA1/item.MA2>geno.Fir_Ra){
      var str = data[item.idx];
      str = str.split(",");
      var date = str[0].split("  ")[0] + "-" + str[0].split("  ")[1];
      var closePrice = str[4];
      var msg = closePrice+"("+date+")"+"  buy";
      bot.sendMessage("-251497331", msg);
    }else if(item.MA1/item.MA2<=1 && item.MA2/item.MA1>geno.Sec_Ra){
      var str = data[item.idx];
      str = str.split(",");
      var date = str[0].split("  ")[0] + "-" + str[0].split("  ")[1];
      var closePrice = str[4];
      var msg = closePrice+"("+date+")"+"  sell";
      bot.sendMessage("-251497331", msg);
    }
  }
}


CheckIsBuylist();


/*
var MHIFutureArr = GetFuture(MHIFuture);
for (var k in MHIFutureArr){
  var time = moment(k*1000).utc(0);
  var min = time.minute();
  var hour = time.hour();
  console.log("%s %s %s",hour,min,MHIFutureArr[k]);
  if (MHIFutureArr.hasOwnProperty(k) && time.minute()%3 == 0) {

  }
}*/
