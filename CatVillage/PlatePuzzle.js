/*
FIRST SCRIPT - MARCH 2020

This script was one of the first I wrote, and as such took various shortcuts including hardcoding IDs and not considering variable scope.

This script handled a plate puzzle where the players had to position their characters on various pressure pads that raised & lowered blocks in order to unblock the flow of water into an arcane compound.
*/

const plate = "-MW1oPQJbj6JkQoFjj3I"; //plate puzzle page ID
const cavern = "-MWpkFtKVvgyeqtoucZ9"; //cavern page ID
var walls;
var pads;
var levels;
var water;
var waterLevel;
var waterFull;
var orb;

on("ready", function() {
    walls = findObjs({_type: "graphic", _pageid: plate, gmnotes: "%3Cp%3EWall%3Cbr%3E%3C/p%3E"});
    walls.sort((a,b) => {
        if (a.get("name")<b.get("name")) return -1;
        if (a.get("name")>b.get("name")) return 1;
        return 0;
        });
//    walls.forEach(x=>log(x.get("name")));
    pads = findObjs({_type: "graphic", _pageid: plate, gmnotes: "%3Cp%3EPad%3Cbr%3E%3C/p%3E"});
    pads.sort((a,b) => {
        if (a.get("name")<b.get("name")) return -1;
        if (a.get("name")>b.get("name")) return 1;
        return 0;
        });
    waterLevel = findObjs({_type: "graphic",_pageid: plate,layer:"map",name:"WaterLevel"})[0];
    waterFull = findObjs({_type: "graphic",_pageid: plate,name:"WaterFull"})[0];
//    log(waterFull.get("name"));
//    log(waterLevel.get("name"));
    water = findObjs({_type: "graphic", _pageid: cavern, gmnotes: "%3Cp%3EWater%3Cbr%3E%3C/p%3E"});
    water.sort((a,b) => {
        if (a.get("name")<b.get("name")) return -1;
        if (a.get("name")>b.get("name")) return 1;
        return 0;
        });
//    water.forEach(x=>log(x.get("name")));
    orb = findObjs({_type: "graphic", _pageid: plate, name: "Lock Orb"})[0];
});

const checkWater = () => {
//returns -1 if no blocks remain on map layer (puzzle complete)
    levels = walls.map(x=>x.get("layer")).lastIndexOf("map");
    log(levels);
    if(levels===-1) {
        waterFull.set("top",123);
        waterLevel.set("top",walls[0].get("top")+105);
        log("Solved!");
//        water.forEach(x=>x.set("layer","map"));
    } else {
        waterFull.set("top",walls[4].get("top")+175);
        waterLevel.set("top",walls[levels].get("top")+140);
        log("Water at "+levels);
//        water.forEach(x=>x.set("layer","gmlayer"));
    }
}

const fillWater = (status) => {
//        water.forEach(x=>log(x.get("name")+": "+x.get('left')+", "+x.get("top")));
    if(status) {
        log("true");
        log(water.length);
        setTimeout(function() {water[0].set("left",560)},300);
        setTimeout(function() {water[1].set("top",1540)},600);
        setTimeout(function() {water[2].set("left",700)},900);
        setTimeout(function() {water[3].set("top",1120)},1200);
        setTimeout(function() {water[4].set("left",595)},1500);
        setTimeout(function() {water[5].set("top",630)},1800);
        setTimeout(function() {water[6].set("left",700)},1950);
        setTimeout(function() {water[7].set("left",770)},2100);
        setTimeout(function() {water[8].set("top",560)},2100);
        setTimeout(function() {water[9].set("layer","map")},2400);
    }
    else {
        log("false");
        water[0].set("left", -700);
        water[1].set("top",2240);
        water[2].set("left",1540);
        water[3].set("top",2240);
        water[4].set("left",-35);
        water[5].set("top",2240);
        water[6].set("left",1400);
        water[7].set("left",1400);
        water[8].set("top",2240);
        water[9].set("layer","gmlayer");
    }
}
on("chat:message", function(msg){
    if(msg.content === "!fill"){
        log("fill");
//        water.forEach(x=>log(x.get("name")+": "+x.get('left')+", "+x.get("top")));
        fillWater(true);
    }
    if(msg.content === "!empty") fillWater(false);
    if(msg.content!=="!toggleLock") return;
    switch(orb.get("tint_color")){
        case "transparent":
            orb.set("tint_color","#00ff00");
            spawnFx(orb.get("left"),orb.get("top"),"burst-slime");
            break;
        case "#00ff00":
            orb.set("tint_color","transparent");
            spawnFx(orb.get("left"),orb.get("top"),"burst-smoke");
            break;
   }
});

const toggleLayer=(toMove)=>{
    switch (toMove.get("layer")) { //pick things up
        case "map":
            toMove.set("layer","gmlayer"); //put them down
            break;
        case "gmlayer":
            toMove.set("layer","map"); //put them down here
            break;
    }
}

on("change:graphic", function(obj,prev) { //when a graphic item changes
    if(Campaign().get("playerpageid")!==plate ||
    [obj.get("left"),obj.get("top")]===[prev["left"],prev["top"]]) {
        return; //if not on puzzle, or didn't move position
    }
    const checkPlate = (pInd,wInd) => {
        var padL=pads[pInd].get("left");
        var padT=pads[pInd].get("top"); //find the pad
        if((obj.get("left")===padL&&obj.get("top")===padT)
        || (prev["left"]===padL&&prev["top"]===padT)) {
            log(pads[pInd].get("name")+" pressed!");
            if(orb.get("tint_color")==="#00ff00") return;
            for(i=0;i<wInd.length;i++){
                toggleLayer(walls[wInd[i]]); //toggle walls
            }
            checkWater();
        } else return;
    }
    checkPlate(0,[0,2,4]);  //pad 1: 1,3,5
    checkPlate(1,[3,4]);    //pad 2: 4,5
    checkPlate(2,[0,1,3]);  //pad 3: 1,2,4
    checkPlate(3,[0,3]);    //pad 4: 1,4
    checkPlate(4,[0,1]);    //pad 5: 1,2
    checkPlate(5,[0,1,4]);  //pad 6: 1,2,5
    checkPlate(6,[0,4]);    //pad 7: 1,5
    checkPlate(7,[1,4]);    //pad 8: 2,5
});
