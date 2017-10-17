var getData = require("./class/getData.js");
var Utils = require("./class/helper.js");
var ga = require("./class/ga.js");

var testingData = 250 ; 
var dateData = Utils.getDataForTraining();


//10,1,1.001083771566609,1.001213254939259,1410,328

var dateData = dateData.slice(dateData.length-testingData, dateData.length);
var geno = {
    Fir_MA:3,
    Sec_Ma:1,
    Fir_Ra:1.0010593463322641,
    Sec_Ra:1.001013127294255,
    Score:0,
    bet:0
}
for(var i=0;i<dateData.length;i++){
    geno = ga.backTest(dateData[i].data,geno);
}
console.log(geno);


/*
var dateData = dateData.slice(0, dateData.length-testingData);
var pp_size = 85;
var parent_size = 5;
var initPop = ga.initPopulation(pp_size);

var generation = 20000;
var miniBet = 7;
var randomDate = 10;
var keepParent = 2;
var fsNormal = require('fs');
var pp = initPop;
var fileName = "./result/r_"+generation+"_"+Date.now()+".txt";
fsNormal.writeFileSync(fileName,"")
for(var i=0;i<generation;i++){
   var datePick = dateData.length-randomDate-1;
   var start = Math.floor((Math.random() * datePick))
   var testData = dateData.slice(start, start+randomDate)
   pp = ga.countFitness(testData,pp);
   var Str = "----Generation "+i+"--------";
   console.log(Str);
   fsNormal.appendFileSync(fileName,Str+"\n");
   for(var j=0;j<5;j++){
    Str = pp[j].Fir_MA +","+pp[j].Sec_Ma +","+pp[j].Fir_Ra +","+pp[j].Sec_Ra +","+pp[j].Score+","+pp[j].bet;
    fsNormal.appendFileSync(fileName,Str+"\n");
    console.log(Str);
   }
  
   pp = ga.NextGeneration(pp,miniBet,pp_size,parent_size,keepParent);

}
*/


