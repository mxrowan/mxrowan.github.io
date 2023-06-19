/*
FIRST SCRIPT - MARCH 2020

This script was one of the first I wrote, and as such took various shortcuts including hardcoding IDs and not considering variable scope.

This script handled automating the motion of a baby cat the players found in a cave. The players couldn't control the cat, but they could control mystical electrical sparks in the area, which the baby cat promptly followed like a laser pointer. This script handled flipping the image and moving the cat accordingly.

This script was also a catch-all for other one-off commands I added ad-hoc.
*/

const foyer = "-MWqBOEZgae0OhGn8dzJ"; //pageID
const nimru = "-MWk-VPM33Thm18Q9rYM"; //charID
const laser = "-MWq_3QmuRhkW_V5ZRBP"; //charID
const babyCat = "-MWqjQELsu-Z5YcV8Qs2"; //charID

var nimruSparkle = false;

var cat;
var spark;
var ping;

const findSpark = function(){
    cat = findObjs({_type: "graphic",name: "Baby Cat", pageid: Campaign().get("playerpageid")})[0];
    spark = findObjs({_type: "graphic", name: 'Laser Pointer', pageid: Campaign().get("playerpageid")})[0];
    if(!spark || !cat) sendChat("API","/w gm Missing cat or spark! use !findSpark");
    else log("Laser is on: "+getObj("page",spark.get("_pageid")).get("name"));
}

on("ready", function(){
    findSpark();
})

on("change:campaign:playerpageid", function(){
  //ping and focus anchor object on new page
    ping = findObjs({_type: "graphic",pageid:Campaign().get("playerpageid"),name:"Anchor"})[0];
    setTimeout(function(){
        sendPing(ping.get("left"),ping.get("top"),Campaign().get("playerpageid"),null,true);
    },1500);
    findSpark();
});


on("change:graphic", function(obj,prev){
    if(obj===spark) {
        if(!cat) return;
        if(spark.get("left")>cat.get("left")) { //spark to the right
            cat.set("fliph",true);
            spark.set("fliph",true);
        } else if(spark.get("left")<cat.get("left")) { // to the left
            cat.set("fliph",false);
            spark.set("fliph",false);
        }
        if(spark.get("top")>cat.get("top")) {       //spark below
            cat.set("flipv",true);
            spark.set("flipv",true);
        } else if(spark.get("top")<cat.get("top")){ //spark above
            cat.set("flipv",false);
            spark.set("flipv",false);
        }
        cat.set("left",spark.get("left"));
        cat.set("top",spark.get("top"));
    }
    if(!obj.get("represents")) return;
    if(obj.get("represents")===nimru) {
        if(!nimruSparkle) return;
        if([obj.get("left"),obj.get("top")]!==[prev["left"],prev["top"]]) {
        spawnFx(obj.get("left"),obj.get("top"),"bubbling-holy");
        }
    }
});

var selObj;
var dance;

on("chat:message", function(msg){
    if(msg.content==="!pingAll"){
      //ping and move players to focus anchor object
        ping = findObjs({_type: "graphic",pageid:Campaign().get("playerpageid"),
            name:"Anchor"})[0];
        if(!ping) return;
        setTimeout(function(){
            sendPing(ping.get("left"),ping.get("top"),Campaign().get("playerpageid"),null,true);
        },1500);
    }
    if(msg.content==="!findSpark") findSpark();
    
    if(!msg.selected) return;
    selObj = getObj("graphic",msg.selected[0]["_id"]);

    if(msg.content==="!dance") {
      //apply Irresistable Dance by making a token flip repeatedly
        if(!selObj) return;
        if(!dance || dance._destroyed) dance = setInterval(function(){
            selObj.set("fliph",!selObj.get("fliph"));
        },500)
        else clearInterval(dance);
    }
    if(msg.content!=="!nimruSparkle") return;
      //activate Nimru's cloak of sparkles
    nimruSparkle = !nimruSparkle;
    if(nimruSparkle) spawnFx(selObj.get("left"),selObj.get("top"),"bomb-holy");
    else spawnFx(selObj.get("left"),selObj.get("top"),"burn-smoke");
    log(getObj("graphic",msg.selected[0]["_id"]).get("name"));
});
