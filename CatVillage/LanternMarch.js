/*
FIRST SCRIPT - MARCH 2020

This script was one of the first I wrote, and as such took various shortcuts including hardcoding IDs and not considering variable scope.

This script handled the automated movement of two lantern tokens on two different tracks, as well as handling chat messages with on-the-fly adjustments to their rotations, tracks, and 'light' (aura) radius. If I'd planned to have more than two lanterns I would have used a constructor instead of manually declaring the objects and their loops, but this worked for my purposes.
*/

var lanternPage = "-MWL8G8rzkjdRo01_fKk"
//figure out namespaces?

var lanternA;
var lanternB;
var loopA = {
    target: {},
    shape: 'rect',
    horiz: false,
    steps: 0,
    dir: -35,
    stepsMax: 1,
    pass: [],
    speed:800,
    burst: "bomb-water"
}
var loopB = {
    target: {},
    shape: 'corner',
    horiz: false,
    steps: 0,
    dir: -35,
    stepsMax: 21,
    pass: [],
    speed:800,
    burst: "bomb-blood"
}
var argObj;

var pedestal;
var ans;

goMarch = function(patrol) { //patrol is obj holding march
    patrol.march = setInterval(function(){
      //handle turns at the corners of given shape, i.e. when # steps exceeds max steps
        if(patrol.shape==='rect'){
            if(patrol.steps > patrol.stepsMax){
                if(!patrol.horiz) patrol.dir = patrol.dir*-1;
                patrol.horiz = !patrol.horiz;
                patrol.steps=0;
            }
       } else if(patrol.shape==='corner'){
           if(patrol.steps > patrol.stepsMax){
               if(patrol.dir<0) patrol.horiz=!patrol.horiz;
               patrol.dir = patrol.dir*-1;
               patrol.steps=0;
           }
       } else {
           log("Error: shape undefined");
           return;
       }
       if(patrol.horiz){
            patrol.target.set("left", patrol.target.get("left")+patrol.dir);
         //apply steps to tokens riding on the lantern
            if(patrol.pass) patrol.pass.forEach(x=>{
                getObj("graphic",x).set("left",
                getObj("graphic",x).get("left")+patrol.dir);
            });
        } else {
            patrol.target.set("top",patrol.target.get("top")+patrol.dir);
            if(patrol.pass) patrol.pass.forEach(x=>{
                getObj("graphic",x).set("top",
                getObj("graphic",x).get("top")+patrol.dir);
            });
        }
        patrol.steps++;
   },patrol.speed);
}

on("ready", function(){
  //find lantern objects
    lanternA = findObjs({_type:"graphic", _pageid: lanternPage, name:"Lantern A"})[0];
    lanternB = findObjs({_type:"graphic", _pageid: lanternPage, name:"Lantern B"})[0];
    toFront(lanternB);
    toFront(lanternA);
    loopA.target = lanternA;
    loopB.target = lanternB;
    pedestal = findObjs({_type:"graphic", _pageid: lanternPage, name:"Cat Pedestal"})[0];
//    log(loopA.target);
});

on("change:campaign:playerpageid",function(){
  //start rotating when players move to the lantern page
    if(Campaign().get("playerpageid")===lanternPage) sendChat("Spoopy","!blue start");
});

on("change:graphic:bar2_value", function(obj){
  //test riddle answer in pedestal token bar 2
    if(obj!==pedestal) return;
    ans = pedestal.get("bar2_value");
    if(ans<14){
        sendChat("Error","Not enough cats!");
    }
    if(ans>14){
        sendChat("Error","You can never have too many cats. However that is more cats than we have.");
    }
    if(ans==14){
        sendChat("???","We honor the warriors who saved us from certain doom.")
        pedestal.set("showplayers_aura1",true);
        pedestal.set("light_radius",100);
    }
});

on("chat:message", function(msg){
    if(Campaign().get("playerpageid")!==lanternPage) return;
    if(msg.type!=='api') return;

    let args = msg.content.split(' ');
    if(args[0]==="!blue") argObj = loopA;
    else if(args[0]==="!red") argObj = loopB;
    else return;
  
    var selID;
    if(msg.selected) selID = msg.selected[0]._id.padStart(20,"-");
    log(msg.selected);
    log(selID);
    
    switch(args[1]) {
        case "start":
            if(!argObj.march) log("first");
            else if(!argObj.march._destroyed) { //prevent redundancy
                log("Already going.");
                return;
            }
            goMarch(argObj);
            break;
        
        case "stop":
            log("attempting to stop");
            if(!argObj.march) return;
            else if(argObj.march._destroyed) {
                log("That lantern is already stopped!");
                return;
            } else clearInterval(argObj.march);
            break;
        
      case "reset":
        //reset to defaults
            argObj.steps=0;
            argObj.pass=[];
            if(argObj===loopA){
                loopA.horiz=false;
                loopA.dir= -35;
                loopA.stepsMax=1;
                loopA.speed=800;
            } else if(argObj===loopB){
                loopB.horiz=false;
                loopB.dir=-35;
                loopB.stepsMax=21;
                loopB.speed=400;
            }
            break;
        
      case "pass":
        //add selected as passenger to move with lantern
            if(!msg.selected) return;
            argObj.pass.push(selID);
            log(argObj.pass);
            break;
        
      case "off":
        //remove passenger(s)
            if(!msg.selected) argObj.pass = [];
            else {
                log(argObj.pass.indexOf(selID));
                argObj.pass.splice(argObj.pass.indexOf(selID),1);
            }
            break;
        
      case "mod": //!blue mod stepsMax 10
            if(args[2]==='shape') return; //this is the only non-number essential to not change
            argObj[args[2]] = parseInt(args[3]);
            log(argObj[args[2]]);
            break;
        
      case "push": //!blue push 2
        //shorthand to increase stepsMax specifically
            argObj.stepsMax = argObj.stepsMax+2*parseInt(args[2]);
            argObj.steps = argObj.steps+parseInt(args[2]);
            log(argObj.stepsMax+', '+argObj.steps);
            break;
        
      case "radius": //!blue radius 15
            if(!args[2]) (argObj.target).set("aura1_radius",'');
            else (argObj.target).set("aura1_radius", parseInt(args[2]));
            spawnFx((argObj.target).get("left"),(argObj.target).get("top"),
                argObj.burst);
            log((argObj.target).get("aura1_radius"));
            break;
        
      case "light": //!red light 20 10
            log("light change:");
            if(!args[2]) (argObj.target).set("light_radius","");
            else {
                (argObj.target).set("light_radius", parseInt(args[2]));
                if(args[3]) (argObj.target).set("light_dimradius", parseInt(args[3]));
            }
            log((argObj.target).get("light_radius"));
            break;
        default:
            log("Lantern command not found.");
        }
});
