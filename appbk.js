var getData = require("./class/getData.js");
var Utils = require("./class/helper.js");

var d3_peaks = require('d3-peaks');
var plot = require('plotter').plot;
var StockCode = "00700";
var M18Url = "http://money18.on.cc/chartdata/full/price/"+StockCode+"_price_full.txt"
var M18UrlCurr = "http://money18.on.cc/securityQuote/genStockXMLHK.php?t=1506072569226&coding=big5-hkscs&stockcode="+StockCode

var HSI = getData.StockDaily(M18Url,'HSI');
var Cur = getData.getCur(M18UrlCurr,'HSI');

var weekIdx = Utils.getSupport(HSI);

