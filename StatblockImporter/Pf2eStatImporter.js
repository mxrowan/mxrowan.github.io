/*
Original 5E script by Jean-Francois in 2015: https://app.roll20.net/forum/post/1612177/script-statblock-import-for-5e-character-sheet/?pagenum=1
This script allows personal importing of SRD statblocks into roll20 for ease of GM use. It does not reproduce any proprietary content.

Major changes from original JF script:
    Most syntax had to be updated for major Roll20 system changes; e.g. repeating sections didn't exist yet
    Every regex and attribute call had to be replaced for PF2e formatting
Added NPC Sheet Inline Rolls by Liam (line 841)

Substantive sections added entirely by Rowan:
    417 thru 440: function getRepeating 
    551 thru 623: function parseReactions 
    662 thru 829: function addStrikes 
*/

(function(jf, undefined) {

  /*
  insert check to make sure chatSetAttr, SelectManager, Messenger installed
  */

    /* Options */
    jf.createAbilityAsToken = true; //make abilities token action
    jf.critroll = 'none'; //'auto' to auto-roll crit damage; 'button' to show chat button; 'none' for none    
    jf.addactions = false; //added this to control for errors in creating repeating action sections in the same call as creating the NPC sheet
    
    var standardcreature ={
      //list of standard creature abilities that are only listed by keyword, in order to expand them
        names: ["All-Around Vision","Aquatic Ambush","Attack of Opportunity","At-Will Spells","Aura","Buck","Catch Rock","Change Shape","Constant Spells","Constrict","Coven","Darkvision","Disease","Engulf","Fast Healing","Ferocity","Form Up","Frightful Presence","Grab","Greater Constrict","Improved Grab","Improved Knockdown","Improved Push","Knockdown","Lifesense","Light Blindness","Low-Light Vision","Negative Healing","Poison","Push","Regeneration","Rend","Retributive Strike","Scent","Shield Block","Sneak Attack","Swallow Whole","Swarm Mind","Telepathy","Throw Rock","Trample","Tremorsense","Troop Defenses", "Wavesense"],
        descriptions: ["This monster can see in all directions simultaneously, and therefore can’t be flanked.","Requirements The monster is hiding in water and a creature that hasn’t detected it is within the listed number of feet. Effect The monster moves up to its swim Speed + 10 feet toward the triggering creature, traveling on water and on land. Once the creature is in reach, the monster makes a Strike against it. The creature is flat-footed against this Strike.","Trigger A creature within the monster’s reach uses a manipulate action or a move action, makes a ranged attack, or leaves a square during a move action it’s using. Effect The monster attempts a melee Strike against the triggering creature. If the attack is a critical hit and the trigger was a manipulate action, the monster disrupts that action. This Strike doesn’t count toward the monster’s multiple attack penalty, and its multiple attack penalty doesn’t apply to this Strike.","The monster can cast its at-will spells any number of times without using up spell slots.","A monster’s aura automatically affects everything within a specified emanation around that monster. The monster doesn’t need to spend actions on the aura; rather, the aura’s effects are applied at specific times, such as when a creature ends its turn in the aura or when creatures enter the aura.If an aura does nothing but deal damage, its entry lists only the radius, damage, and saving throw. Such auras deal this damage to a creature when the creature enters the aura and when a creature starts its turn in the aura. A creature can take damage from the aura only once per round.The GM might determine that a monster’s aura doesn’t affect its own allies. For example, a creature might be immune to a monster’s frightful presence if they have been around each other for a long time.","Most monsters that serve as mounts can attempt to buck off unwanted or annoying riders, but most mounts will not use this reaction against a trusted creature unless the mounts are spooked or mistreated. Trigger A creature Mounts or uses the Command an Animal action while riding the monster. Effect The triggering creature must succeed at a Reflex saving throw against the listed DC or fall off the creature and land prone. If the save is a critical failure, the triggering creature also takes 1d6 bludgeoning damage in addition to the normal damage for the fall.","Requirements The monster must have a free hand but can Release anything it’s holding as part of this reaction. Trigger The monster is targeted with a thrown rock Strike or a rock would fall on the monster. Effect The monster gains a +4 circumstance bonus to its AC against the triggering attack or to any defense against the falling rock. If the attack misses or the monster successfully defends against the falling rock, the monster catches the rock, takes no damage, and is now holding the rock.","(concentrate, [magical tradition], polymorph, transmutation) The monster changes its shape indefinitely. It can use this action again to return to its natural shape or adopt a new shape. Unless otherwise noted, a monster cannot use Change Shape to appear as a specific individual. Using Change Shape counts as creating a disguise for the Impersonate use of Deception. The monster’s transformation automatically defeats Perception DCs to determine whether the creature is a member of the ancestry or creature type into which it transformed, and it gains a +4 status bonus to its Deception DC to prevent others from seeing through its disguise. Change Shape abilities specify what shapes the monster can adopt. The monster doesn’t gain any special abilities of the new shape, only its physical form. For example, in each shape, it replaces its normal Speeds and Strikes, and might potentially change its senses or size. Any changes are listed in its stat block.","A constant spell affects the monster without the monster needing to cast it, and its duration is unlimited. If a constant spell gets counteracted, the monster can reactivate it by spending the normal spellcasting actions the spell requires. ","The monster deals the listed amount of damage to any number of creatures grabbed or restrained by it. Each of those creatures can attempt a basic Fortitude save with the listed DC.","(divination, mental, occult) This monster can form a coven with two or more other creatures who also have the coven ability. This involves performing an 8-hour ceremony with all prospective coven members. After the coven is formed, each of its members gains elite adjustments, adjusting their levels accordingly. Coven members can sense other members’ locations and conditions by spending a single action, which has the concentrate trait, and can sense what another coven member is sensing as a two-action activity, which has the concentrate trait as well.Covens also grant spells and rituals to their members, but these can be cast only in cooperation between three coven members who are all within 30 feet of one another. A coven member can contribute to a coven spell with a single-action spellcasting activity that has a single verbal component. If two coven members have contributed these actions within the last round, a third member can cast a coven spell on her turn by spending the normal spellcasting actions. A coven can cast its coven spells an unlimited number of times but can cast only one coven spell each round. All covens grant the 8th-level baleful polymorph spell and all the following spells, which the coven can cast at any level up to 5th: augury, charm, clairaudience, clairvoyance, dream message, illusory disguise, illusory scene, prying eye, and talking corpse. Individual creatures with the coven ability also grant additional spells to any coven they join. A coven can also cast the control weather ritual, with a DC of 23 instead of the standard DC.If a coven member leaving the coven or the death of a coven member brings the coven below three members, the remaining members keep their elite adjustments for 24 hours, but without enough members to contribute the necessary actions, they can’t cast coven spells.","A monster with darkvision can see perfectly well in areas of darkness and dim light, though such vision is in black and white only. Some forms of magical darkness, such as a 4th-level darkness spell, block normal darkvision. A monster with greater darkvision, however, can see through even these forms of magical darkness.","When a creature is exposed to a monster’s disease, it attempts a Fortitude save or succumbs to the disease. The level of a disease is the level of the monster inflicting the disease. The disease follows the rules for afflictions.","The monster Strides up to double its Speed and can move through the spaces of any creatures in its path. Any creature of the monster’s size or smaller whose space the monster moves through can attempt a Reflex save with the listed DC to avoid being engulfed. A creature unable to act automatically critically fails this save. If a creature succeeds at its save, it can choose to be either pushed aside (out of the monster’s path) or pushed in front of the monster to the end of the monster’s movement. The monster can attempt to Engulf the same creature only once in a single use of Engulf. The monster can contain as many creatures as can fit in its space.A creature that fails its save is pulled into the monster’s body. It is grabbed, is slowed 1, and has to hold its breath or start suffocating. The creature takes the listed amount of damage when first engulfed and at the end of each of its turns while it’s engulfed. An engulfed creature can get free by Escaping against the listed escape DC. An engulfed creature can attack the monster engulfing it, but only with unarmed attacks or with weapons of light Bulk or less. The engulfing creature is flat-footed against the attack. If the monster takes piercing or slashing damage equaling or exceeding the listed Rupture value from a single attack or spell, the engulfed creature cuts itself free. A creature that gets free by either method can immediately breathe and exits the swallowing monster’s space.If the monster dies, all creatures it has engulfed are automatically released as the monster’s form loses cohesion.","A monster with this ability regains the given number of Hit Points each round at the beginning of its turn.","Trigger The monster is reduced to 0 HP. Effect The monster avoids being knocked out and remains at 1 HP, but its wounded value increases by 1. When it is wounded 3, it can no longer use this ability.","The troop chooses one of the squares it currently occupies and redistributes its squares to any configuration in which all squares are contiguous and within 15 feet of the chosen square. The troop can't share its space with other creatures.","(aura, emotion, fear, mental) A creature that first enters the area must attempt a Will save. Regardless of the result of the saving throw, the creature is temporarily immune to this monster’s Frightful Presence for 1 minute.Critical Success The creature is unaffected by the presence.Success The creature is frightened 1.Failure The creature is frightened 2.Critical Failure The creature is frightened 4.","Requirements The monster's last action was a success with a Strike that lists Grab in its damage entry, or it has a creature grabbed using this action. Effect The monster automatically Grabs the target until the end of the monster's next turn. The creature is grabbed by whichever body part the monster attacked with, and that body part can't be used to Strike creatures until the grab is ended.Using Grab extends the duration of the monster's Grab until the end of its next turn for all creatures grabbed by it. A grabbed creature can use the Escape action to get out of the grab, and the Grab ends for a grabbed creatures if the monster moves away from it.","The monster deals the listed amount of damage to any number of creatures grabbed or restrained by it. Each of those creatures can attempt a basic Fortitude save with the listed DC. A creature that fails this save falls unconscious, and a creature that succeeds is then temporarily immune to falling unconscious from Greater Constrict for 1 minute.","The monster can use Grab as a free action triggered by a hit with its initial attack. A monster with Improved Grab still needs to spend an action to extend the duration for creatures it already has grabbed.","The monster can use Knockdown as a free action triggered by a hit with its initial attack.","The monster can use Push as a free action triggered by a hit with its initial attack.","Requirements The monster’s last action was a success with a Strike that lists Knockdown in its damage entry. Effect The monster knocks the target prone.","Lifesense allows a monster to sense the vital essence of living and undead creatures within the listed range. The sense can distinguish between the positive energy animating living creatures and the negative energy animating undead creatures, much as sight distinguishes colors.","When first exposed to bright light, the monster is blinded until the end of its next turn. After this exposure, light doesn’t blind the monster again until after it spends 1 hour in darkness. However, as long as the monster is in an area of bright light, it’s dazzled.","The monster can see in dim light as though it were bright light, so it ignores the concealed condition due to dim light.","A creature with negative healing draws health from negative energy rather than positive energy. It is damaged by positive damage and is not healed by positive healing effects. It does not take negative damage, and it is healed by negative effects that heal undead.","When a creature is exposed to a monster’s poison, it attempts a Fortitude save to avoid becoming poisoned. The level of a poison is the level of the monster inflicting the poison. The poison follows the rules for afflictions.","Requirements The monster’s last action was a success with a Strike that lists Push in its damage entry. Effect The monster automatically knocks the target away from the monster. Unless otherwise noted in the ability description, the creature is pushed 5 feet. If the attack was a critical hit, this distance is doubled.","This monster regains the listed number of Hit Points each round at the beginning of its turn. Its dying condition never increases beyond dying 3 as long as its regeneration is active. However, if it takes damage of a type listed in the regeneration entry, its regeneration deactivates until the end of its next turn. Deactivate the regeneration before applying any damage of a listed type, since that damage might kill the monster by bringing it to dying 4.","A Rend entry lists a Strike the monster has. Requirements The monster hit the same enemy with two consecutive Strikes of the listed type in the same round. Effect The monster automatically deals that Strike’s damage again to the enemy.","Trigger An enemy damages the monster’s ally, and both are within 15 feet of the monster. Effect The ally gains resistance to all damage against the triggering damage equal to 2 + the monster’s level. If the foe is within reach, the monster makes a melee Strike against it.","Scent involves sensing creatures or objects by smell, and is usually a vague sense. The range is listed in the ability, and it functions only if the creature or object being detected emits an aroma (for instance, incorporeal creatures usually do not exude an aroma).If a creature emits a heavy aroma or is upwind, the GM can double or even triple the range of scent abilities used to detect that creature, and the GM can reduce the range if a creature is downwind.","Trigger The monster has its shield raised and takes damage from a physical attack. Effect The monster snaps its shield into place to deflect a blow. The shield prevents the monster from taking an amount of damage up to the shield’s Hardness. The monster and the shield each take any remaining damage, possibly breaking or destroying the shield.","When the monster Strikes a creature that has the flat-footed condition with an agile or finesse melee weapon, an agile or finesse unarmed attack, or a ranged weapon attack, it also deals the listed precision damage. For a ranged attack with a thrown weapon, that weapon must also be an agile or finesse weapon.","(attack) The monster attempts to swallow a creature of the listed size or smaller that it has grabbed in its jaws or mouth. If a swallowed creature is of the maximum size listed, the monster can’t use Swallow Whole again. If the creature is smaller than the maximum, the monster can usually swallow more creatures; the GM determines the maximum. The monster attempts an Athletics check opposed by the grabbed creature’s Reflex DC. If it succeeds, it swallows the creature. The monster’s mouth or jaws no longer grab a creature it has swallowed, so the monster is free to use them to Strike or Grab once again. The monster can’t attack creatures it has swallowed.A swallowed creature is grabbed, is slowed 1, and has to hold its breath or start suffocating. The swallowed creature takes the listed amount of damage when first swallowed and at the end of each of its turns while it’s swallowed. If the victim Escapes this ability’s grabbed condition, it exits through the monster’s mouth. This frees any other creature grabbed in the monster’s mouth or jaws. A swallowed creature can attack the monster that has swallowed it, but only with unarmed attacks or with weapons of light Bulk or less. The engulfing creature is flat-footed against the attack. If the monster takes piercing or slashing damage equaling or exceeding the listed Rupture value from a single attack or spell, the engulfed creature cuts itself free. A creature that gets free by either Escaping or cutting itself free can immediately breathe and exits the swallowing monster’s space.If the monster dies, a swallowed creature can be freed by creatures adjacent to the corpse if they spend a combined total of 3 actions cutting the monster open with a weapon or unarmed attack that deals piercing or slashing damage.","This monster doesn’t have a single mind (typically because it’s a swarm of smaller creatures), and is immune to mental effects that target only a specific number of creatures. It is still subject to mental effects that affect all creatures in an area.","(aura, divination, magical) A monster with telepathy can communicate mentally with any creatures within the listed radius, as long as they share a language. This doesn’t give any special access to their thoughts, and communicates no more information than normal speech would.","The monster picks up a rock within reach or retrieves a stowed rock and throws it, making a ranged Strike.","The monster Strides up to double its Speed and can move through the spaces of creatures of the listed size, Trampling each creature whose space it enters. The monster can attempt to Trample the same creature only once in a single use of Trample. The monster deals the damage of the listed Strike, but trampled creatures can attempt a basic Reflex save at the listed DC (no damage on a critical success, half damage on a success, double damage on a critical failure).","Tremorsense allows a monster to feel the vibrations through a solid surface caused by movement. It is an imprecise sense with a limited range (listed in the ability). Tremorsense functions only if the monster is on the same surface as the subject, and only if the subject is moving along (or burrowing through) the surface.","Troops are composed of many individuals, and over the course of enough attacks and downed comrades, troops shrink in size. Most troops start with 16 squares (4 by 4), and their Hit Points have two listed thresholds, typically the first is at 2/3 their maximum Hit Points and the second is at 1/3 their maximum Hit Points. Once the troop drops below the first threshold, it loses 4 squares, leaving 12 squares remaining, and the first threshold becomes the troop's new maximum Hit Points. Once the troop falls below the second threshold, it loses another 4 squares, leaving 8 squares remaining, and the second threshold becomes the troop's new maximum Hit Points. In order to restore its size and maximum Hit Points, a troop needs to spend downtime to use long-term treatment on casualties or recruit new members to replace the fallen. At 0 Hit Points, the troop is reduced down to 4 squares, which is too few to sustain the troop, so it disperses entirely, with the few remaining members surrendering, fleeing, or easily dispatched, depending on their nature.A damaging single-target effect, such as a Strike, can't force a troop to pass through more than one threshold at once. For instance, if a troop had 60 Hit Points, with thresholds at 40 and 20, a Strike for 50 damage would leave the troop at 21 Hit Points, just above the second threshold. A damaging area effect or multi-target effect can cross multiple thresholds at once and could potentially destroy the entire troop in one shot.Non-damaging effects with an area or that target all creatures in a certain proximity affect a troop normally if they affect the entire area occupied by the troop. If an effect has a smaller area or numbers of targets, it typically has no effect on the troop. However, if the effect can target at least four creatures or cover at least four squares in the troop, and if it would prevent its targets from acting, cause them to flee, or otherwise make them unable to function as part of the troop for a round or more, the troop loses a number of Hit Points equal to the amount required to bring it to the next threshold, removing 4 squares. If an effect would both deal damage and automatically cross a threshold due to incapacitating some of the creatures in the troop, apply the damage first. If the damage wasn't enough to cross a threshold on its own, then reduce the Hit Points to cross the threshold for the incapacitating effect.","This sense allows a monster to feel vibrations caused by movement through a liquid. It’s an imprecise sense with a limited range (listed in the ability). Wavesense functions only if monster and the subject are in the same body of liquid, and only if the subject is moving through the liquid."]
    }
    
    jf.statblock = {
        version: "Rowan",
        RegisterHandlers: function() {
            on('chat:message', HandleInput);
          
            log("JF Statblock ready");
        }
    }

    var status = ''; // To display in chat
    var errors = []; // To log error
    var characterId = null;
    var callbase = ''; //this is for using chatSetAttr to create repeating items, filled when charid created

    function HandleInput(msg) {

        if(msg.type !== "api") {
            return;
        }
        
        //quit if character sheet (not npc)
        var selectedCharacterSheetIds = (msg.selected || []).map(obj => getObj("graphic", obj._id))
			.filter(x => !!x)
			.map(token => token.get("represents"))
			.filter(id => getObj("character", id || ""));
        selectedCharacterSheetIds.forEach(function (characterSheetId) {
            if(getAttrByName(characterSheetId, 'sheet_type') === 'character') {
                return;
            };
        });

        
            let chartype = findObjs({
                _type: 'attribute', 
                _characterid: characterId,
                name: 'sheet_type'
            })[0];
            

        args = msg.content.split(/\s+/);
        switch(args[0]) {
            case '!build-statblock':
            case '!jf-parse':
                jf.getSelectedToken(msg, jf.ImportStatblock);
                break;
        }
    }

    jf.getSelectedToken = jf.getSelectedToken || function(msg, callback, limit) {
        try {
            if(msg.selected == undefined || msg.selected.length == undefined)
                throw('No token selected');

            limit = parseInt(limit, 10) | 0;

            if(limit == undefined || limit > msg.selected.length + 1 || limit < 1)
                limit = msg.selected.length;

            for(i = 0; i < limit; i++) {
                if(msg.selected[i]._type == 'graphic') {
                    var obj = getObj('graphic', msg.selected[i]._id);
                    if(obj !== undefined && obj.get('subtype') == 'token') {
                        callback(obj);
                    }
                }
            }
        } catch(e) {
            log(e);
            log('Exception: ' + e);
            sendChat('GM', '/w GM ' + e);
        }
    }

    jf.capitalizeEachWord = function(str) {
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    jf.setCharacter = function(name, gmnotes, bio) {
        if(name == undefined)
            throw("Name require to get or create character");
        name = jf.capitalizeEachWord(name);

        var obj = findObjs({
            _type: "character",
            name: name
        });

        if(obj.length == 0) {
            obj = createObj('character', {
                name: name
            });
            jf.addactions = false;
            status = 'Character ' + name + ' created. %NEWLINE%%NEWLINE%<div style="color:blue;text-decoration-line:underline;">[**Open the character sheet**](http://journal.roll20.net/character/'+obj.id+')</div> to load. %NEWLINE%%NEWLINE%Then [**run !build-statblock**](`!build-statblock) again to add actions & items.';
        } else {
            obj = getObj('character', obj[0].id);
            status = 'Character ' + name + ' updated. %NEWLINE%%NEWLINE%Remember to add **number of actions** for additional abilities, if applicable.';
            if(args[1] !== 'only') jf.addactions = true;
        }

        if(obj == undefined)
            throw("Something prevent script to create or find character " + name);
        log("obj exists");

        if(gmnotes != undefined)
            log("setting gm notes");
            obj.set({
                gmnotes: gmnotes
            });

        if(bio != undefined)
            log("setting bio");
            obj.set({
                bio: bio
            });
            
        characterId = obj.id;
        log("set charid: "+characterId);
        callbase = '!setattr --silent --sel'; //req's selectmanager + messenger


        setAttribut('npc', 1);
        log("set NPC");
        setAttribut('npc_name',name);
        setAttribut('sheet_type','npc');
        setAttribut('roll_option_critical_damage',jf.critroll);

        return obj;
    }

    jf.ImportStatblock = function(token) {
        status = 'Nothing modified';
        errors = [];
        try {
            var statblock = token.get('gmnotes').trim();

            if(statblock == '')
                throw("Selected token GM Notes was empty.");

            var name = jf.parseStatblock(statblock);
            if(characterId != null) {
                token.set("represents", characterId);
                log("represents character!");
                token.set("name", name);
            }
        } catch(e) {
            status = "Parsing was incomplete due to error(s)";
            log(e);
            errors.push(e);
        }

        log(status);
        sendChat('NPCImporter', '/w GM ' + status);
        if(jf.addactions) setTimeout(function() {
            sendChat('NPCImporter', '!parse-inline');
        }, 1000);
        if(jf.addactions) setTimeout(function() {
            sendChat('NPCImporter', '!parse-inline');
        }, 1000);

        if(errors.length > 0) {
            log(errors.join('\n'));
            sendChat('NPCImporter', '/w GM Error(s):\n/w GM ' + errors.join('\n/w GM '));
        }
    }

    function setAttribut(name, currentVal, max) {

        if(name == undefined)
            throw("Name required to set attribut");

        max = max || '';

        if(currentVal == undefined) {
            log("Error setting empty value: " + name);
            return;
        }

        var attr = findObjs({
            _type: 'attribute',
            _characterid: characterId,
            name: name
        })[0];

        if(attr == undefined) {
            log("Creating attribut " + name + ' with current value: '+currentVal);
            createObj('attribute', {
                name: name,
                current: currentVal,
                max: max,
                characterid: characterId
            });
        } else if(attr.get('current') == undefined || attr.get('current').toString() != currentVal) {
            log("Updating attribut " + name + ' to current value: '+currentVal);
            attr.set({
                current: currentVal,
                max: max
            });
        }
    }

    function setAbility(name, description, action, istokenaction) {
        if(name == undefined)
            throw("Name required to set ability");

        var ability = findObjs({
            _type: "ability",
            _characterid: characterId,
            name: name
        });

        if(ability == undefined)
            throw("Something prevent script to create or find ability " + name);

        if(ability.length == 0) {
            ability = createObj('ability', {
                _characterid: characterId,
                name: name,
                description: description,
                action: action,
                istokenaction: istokenaction
            });
            log("Ability " + name + " created");
        } else {
            ability = getObj('ability', ability[0].id);
            if(ability.get('description') != description || ability.get('action') !== action || ability.get('istokenaction') != istokenaction) {
                ability.set({
                    description: description,
                    action: action,
                    istokenaction: istokenaction
                });
                log("Ability " + name + " updated");
            }
        }
    }

    jf.parseStatblock = function(statblock) {

        log("---- Parsing statblock ----");

        texte = clean(statblock);
        var keyword = findKeyword(texte);
        var section = splitStatblock(texte, keyword);
        jf.setCharacter(section.attr.name, texte.replace(/#/g, '<br>'), section.bio);
        processSection(section);
        return section.attr.name;
    }
    
    function clean(statblock) {
        log('ugly statblock: '+statblock);
        statblock = unescape(statblock);
        statblock = statblock.replace(/–/g, '-');
        statblock = statblock.replace(/<br[^>]*>/g, '#').replace(/(<([^>]+)>)/ig, "");
        statblock = statblock.replace(/\s+#\s+/g, '#');
        statblock = statblock.replace(/#(?=[a-z])/g, ' ');
        statblock = statblock.replace(/\s+/g, ' ');

        log('clean statblock: '+statblock)  ;
        return statblock;
    }

    function findKeyword(statblock) { 
//reworked entirely to fit pf2e statblock structure
        var keyword = {
            attr: {},
            melee: {},
            ranged: {}
        };
        var indexMelee = 0;
        var indexRanged = statblock.length;
        var countMelee = 0;
        var countRanged = 0;
        
        // Standard keyword
        var regex = /#\s*(creature|uncommon|rare|unique|lg|ng|cg|ln|n|cn|le|ne|ce|source|perception|languages|skills|str|dex|con|int|wis|cha|items|ac|hp|immunities|weaknesses|resistances|speed|melee|ranged)(?=\s|#)/gi;
        while(match = regex.exec(statblock)) {
            key = match[1].toLowerCase();
            
            if(key == 'hp' && !keyword.attr.ac) {
                var ac = statblock.match(/AC \d/);
                if(ac) keyword.attr.ac = ac.index;
                log('pulled ac before hp');
            }

            if(key == 'melee') { //change actions to melee
                if(!keyword.attr.speed) {
                    var speed = statblock.match(/Speed \d/)
                    if(speed) keyword.attr.speed = speed.index;
                    log('pulled speed before melee');
                }
                if(!indexMelee) {
                    indexMelee = match.index;
                    keyword.melee.Melee = match.index;
                }
                countMelee++;
            } else if(key == 'ranged') {
                if(!keyword.attr.speed) {
                    var speed = statblock.match(/Speed \d/)
                    if(speed) keyword.attr.speed = speed.index;
                    log('pulled speed before ranged; no melee?');
                }
                if(!indexRanged) {
                    log("First ranged!");
                    indexRanged = match.index;
                    keyword.ranged.Ranged = match.index;
                } 
                countRanged++;
            } else {
                keyword.attr[key] = match.index;
            }
        }
        if(!countMelee && !countRanged) {
            log('ERROR - no melee or ranged to catch other abilities');
            if(!keyword.attr.speed) {
                var speed = statblock.match(/Speed \d/)
                if(speed) keyword.attr.speed = speed.index;
            }
        }
        return keyword;
    }

    function splitStatblock(statblock, keyword) {
        // Check for bio (flavor texte) at the end, separated by at least 3 line break.
        var bio;
        if((pos = statblock.indexOf('###')) != -1) {
            bio = statblock.substring(pos + 3).replace(/^[#\s]/g, "");
            bio = bio.replace(/#/g, "<br>").trim();
            statblock = statblock.slice(0, pos);
        }

        var debut = 0;
        var fin = 0;
        var keyName = 'name';
        var sectionName = 'attr';
        
        //obj = keyword.attr   section = attr    key = perception   obj[key] = keyword.attr.perception
        for(var section in keyword) {
            var obj = keyword[section]; //keyword[attr]; section = attr
            for(var key in obj) { //keyword[attr][perception]; key = perception
                var fin = parseInt(obj[key], 10); //fin = index where 'perception' matched
                keyword[sectionName][keyName] = extractSection(statblock, debut, fin, keyName); //text between the two indices
                keyName = key;
                debut = fin;
                sectionName = section;
            }
        }
        keyword[sectionName][keyName] = extractSection(statblock, debut, statblock.length, keyName);

        if(bio != null) keyword.bio = bio;

        var abilitiesName = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        var abilities = '';
        for(i = 0, len = abilitiesName.length; i < len; ++i) {
            if(keyword.attr[abilitiesName[i]] != undefined) {
                abilities += keyword.attr[abilitiesName[i]] + ' ';
                delete keyword.attr[abilitiesName[i]]
            }
        }
        keyword.attr.abilities = abilities;
        log("abilities: "+abilities);

        //PF2e updated - Alignment attribute: include rarity trait if present
        var alignment = ['lg','ng','cg','ln','n','cn','le','ne','ce', 'uncommon', 'rare', 'unique'];
        for(i = 0, len = alignment.length; i < len; ++i) {
            if(keyword.attr[alignment[i]] != undefined) {
                keyword.attr.alignment = keyword.attr[alignment[i]];
                delete keyword.attr[alignment[i]];
                break
            }
        }
        log('alignment: '+keyword.attr.alignment);

        return keyword;
    }

    function extractSection(texte, debut, fin, title) {
        section = texte.substring(debut, fin);
        section = section.replace(/&nbsp;/g, ' ');
        return section;
    }

  //needed to add all repeating structure
    function getRepeating(section, property) {
        var attrs = findObjs({
            _type: "attribute",
            characterid: characterId,
        });
        //repeating_[section]_[rowid]_[property]
        var regex = /^repeating_(.*?)_(.*?)_(.*?)$/;
        var repeating = attrs.filter(entry => regex.test(entry.get('name')));
        log('repeating attributes found: '+repeating.length);
        
        var rowids = [];
    
        for(i=0; i<repeating.length; i++){
            var name = repeating[i].get('name');
            var match = name.match(regex);
            if(match[1] == section && match[3] == property) {
                log('rowid: '+match[2]);
                var test = rowids.includes(match[2]);
                if(!test) rowids.push(match[2]);
                else log('already included in rowid');
            }
        }
        return rowids;
    };

    function processSection(section) {
        if('creature' in section.attr) parseCreature(section.attr.creature);
        if('abilities' in section.attr) parseAbilities(section.attr.abilities);
        if('alignment' in section.attr) parseAlignment(section.attr.alignment);
        if('ac' in section.attr) parseArmorClass(section.attr['ac']);
        if('hp' in section.attr) parseHp(section.attr['hp']);
        if('speed' in section.attr) var othercheck = parseSpeed(section.attr.speed);
        if('skills' in section.attr) parseSkills(section.attr.skills);
        if('perception' in section.attr) parseSenses(section.attr.perception);
        
        if(jf.addactions && 'items' in section.attr) parseItems(section.attr.items);

        if('languages' in section.attr) setAttribut('languages', section.attr['languages'].replace(/#Languages /i, ''));

        if(jf.addactions) parseActions(section.melee.Melee, section.ranged.Ranged);
    } // Section parsing function
  
    function parseCreature(creature) {
        log("parsing creature: "+creature);
        var match = creature.match(/([-\d]+)/i);
        setAttribut('level',match[1]);
    } //done
    
    function parseAbilities(abilities) {
        log("parsing abilities: "+abilities);
        var regex = /([-\d]+)/g;   //include negative mod
        var match = [];

        while(matches = regex.exec(abilities)) {
            match.push(matches[1]);
        }

        setAttribut('strength_modifier', match[0]);
        setAttribut('dexterity_modifier', match[1]);
        setAttribut('constitution_modifier', match[2]);
        setAttribut('intelligence_modifier', match[3]);
        setAttribut('wisdom_modifier', match[4]);
        setAttribut('charisma_modifier', match[5]);
        
        if(jf.addactions || !jf.addactions) { //not hitting errors with setting interaction abilities in same call as creation
            log('abilities: '+abilities);
            var interaction = abilities.match(/#([A-Z][a-z]+(?:\s[a-z]*?\s[a-z]*?\s|\s[a-z]*?\s|\s)[A-Z][a-z-]*)\s(?=[A-Z][a-z]*\s|\()(.*)/);
            log('interaction: '+interaction);

            if(interaction) {
                log('match name: '+interaction[1]);
                log('match desc: '+interaction[2]);
                var rowids = getRepeating('interaction-abilities', 'name');
                log('rowids: '+rowids);
                if(rowids.length){
                    for(i=0; i< rowids.length; i++) {
                        //could make it interaction[2*i+1] and [2*i+2]
                        if(interaction[1]) setAttribut('repeating_interaction-abilities_'+rowids[i]+'_name', interaction[1]);
                        if(interaction[2]) setAttribut('repeating_interaction-abilities_'+rowids[i]+'_description', interaction[2]);
                    }
                } else {
                    sendChat("Repeating Interaction",callbase+ " --repeating_interaction-abilities_-CREATE_name|"+interaction[1]+" --repeating_interaction-abilities_-CREATE_description|"+interaction[2].trim());
                };
            }
        };
    }//consider breaking parseInteraction into its own function

    function parseAlignment(alignment) {
        log('parsing alignment: '+alignment);
        var match = alignment.match(/(uncommon\s|rare\s|unique\s)?\b(\w{1,2})\b\s(\w+)\b([\w\s,]*)/i);
        setAttribut('alignment',match[2].toUpperCase());
        setAttribut('size',match[3].trim());
        if(match[4]) {
            var traitlist = match[4].trim();
            if(match[1]) traitlist = match[1].trim()+' '+traitlist;
            setAttribut('traits',traitlist.replaceAll(" ",", "));
        }
        setAttribut('npc_type','Creature');
    }//done

    function parseArmorClass(ac) {
        log("parsing AC: "+ac);
        var match = ac.match(/(\d+)([^)]*?)?; Fort \+?(\d+), Ref \+(\d+), Will \+(\d+)[,;]?(.*)/);
        setAttribut('armor_class', match[1]);
        if(match[2]) setAttribut('armor_class_notes', match[2]);
        setAttribut('saving_throws_fortitude', match[3]);
        setAttribut('saving_throws_reflex', match[4]);
        setAttribut('saving_throws_will', match[5]);
        if(match[5]) setAttribut('saving_throws_notes', match[6].trim());
        log('upcoming HP: '+section.attr['hp']);
    }//done

    function parseHp(hp) {
        log("parsing HP: "+hp);
        var match = hp.match(/(\d+)(?:;|\s\((.*?)\))?([^#]*)#?(.*)/i);
        if(match[1]) setAttribut('hit_points', match[1], match[1]);
        if(match[2]) setAttribut('hit_points_notes', match[2].trim());
        if(match[3]) {
            var immunities = match[3].match(/(?<=immunities)(.+?)(?=weaknesses|resistances|#|$)/i);
            var weaknesses = match[3].match(/(?<=weaknesses)(.+?)(?=resistances|#|$)/i);
            var resistances = match[3].match(/(?<=resistances)(.+?)(?=#|$)/i);
            
            if(immunities) setAttribut('immunities', immunities[1]);
            if(weaknesses) setAttribut('weaknesses', weaknesses[1]);
            if(resistances) setAttribut('resistances', resistances[1]);
            
        }
        if(match[4] && jf.addactions) {
            log('additional free actions and reactions found!');
            parseReactions(match[4]);
        }
        
    }//done - immunities etc in main call
    
    function parseReactions(text) {
        log('parsing free & reactions: '+text);

        var standardreactions = {
          //these standard creature reactions are usually listed by name only
            "Attack of Opportunity": "Trigger A creature within the monster’s reach uses a manipulate action or a move action, makes a ranged attack, or leaves a square during a move action it’s using. Effect The monster attempts a melee Strike against the triggering creature. If the attack is a critical hit and the trigger was a manipulate action, the monster disrupts that action. This Strike doesn’t count toward the monster’s multiple attack penalty, and its multiple attack penalty doesn’t apply to this Strike.",
            "Buck": "Most monsters that serve as mounts can attempt to buck off unwanted or annoying riders, but most mounts will not use this reaction against a trusted creature unless the mounts are spooked or mistreated. Trigger A creature Mounts or uses the Command an Animal action while riding the monster. Effect The triggering creature must succeed at a Reflex saving throw against the listed DC or fall off the creature and land prone. If the save is a critical failure, the triggering creature also takes 1d6 bludgeoning damage in addition to the normal damage for the fall.",
            "Catch Rock": "Requirements The monster must have a free hand but can Release anything it’s holding as part of this reaction. Trigger The monster is targeted with a thrown rock Strike or a rock would fall on the monster. Effect The monster gains a +4 circumstance bonus to its AC against the triggering attack or to any defense against the falling rock. If the attack misses or the monster successfully defends against the falling rock, the monster catches the rock, takes no damage, and is now holding the rock.",
            "Ferocity": "Trigger The monster is reduced to 0 HP. Effect The monster avoids being knocked out and remains at 1 HP, but its wounded value increases by 1. When it is wounded 3, it can no longer use this ability.",
            "Retributive Strike": "Trigger An enemy damages the monster’s ally, and both are within 15 feet of the monster. Effect The ally gains resistance to all damage against the triggering damage equal to 2 + the monster’s level. If the foe is within reach, the monster makes a melee Strike against it.",
            "Shield Block": "Trigger The monster has its shield raised and takes damage from a physical attack. Effect The monster snaps its shield into place to deflect a blow. The shield prevents the monster from taking an amount of damage up to the shield’s Hardness. The monster and the shield each take any remaining damage, possibly breaking or destroying the shield."
        }
        
        for(var key in standardreactions){
            text = text.replace(key, key+" "+standardreactions[key]);
        }
        log('text parsed for standard reactions: '+text);

        var rowids = getRepeating('free-actions-reactions', 'name');
        
        var titles = { };
        var regex = /(?<!D)(?!Trigger|Effect|Requirements?)(([A-Z][a-z]*?[\s-])+)(?<!(?:Trigger|Requirements)\s)(?:[A-Z][a-z]*\s|\()/g
        while(match = regex.exec(text)) {
            titles[match[1]] = match.index; //match[1] = 'Chill Breath'
        }
        var exclude = ['Trigger','Effect','Requirement'];


        //delete repeats and capture indices
        var indices = [];
        for(var key in titles) { //key = 'Chill Breath'
            if(exclude.some( (element) => text.startsWith(element, titles[key]) ) ) {
                log('deleting repeated title: '+key)
                delete titles[key];
            } else {
                indices.push(titles[key])
            }
            exclude.push(key.trim());
        }
        indices.push(text.length);

        //add to sheet
        var i = 0;
        for(var key in titles) {
            var description = text.substring(indices[i]+key.length, indices[i+1]).trim();

            var traits = description.match(/^\((.*?)\)/);
            if(traits) description = description.substring(2+traits[1].length);

            var trigger = description.match(/Trigger (.*)Effect/);
            if(trigger) description = description.replace(trigger[0],'');
            if(trigger) log('trigger[0]: '+trigger[0]);

            
            log('text of '+key+': '+description);

            if(rowids[i]) {
                setAttribut('repeating_free-actions-reactions_'+rowids[i]+'_name', key.trim())
                setAttribut('repeating_free-actions-reactions_'+rowids[i]+'_npc_description', description.trim());
                if(traits) setAttribut('repeating_free-actions-reactions_'+rowids[i]+'_rep_traits', traits[1].trim());
                if(trigger) {
                    setAttribut('repeating_free-actions-reactions_'+rowids[i]+'_trigger', trigger[1].trim());
                    setAttribut('repeating_free-actions-reactions_'+rowids[i]+'_reaction', 'reaction');
                }
            } else {
                call = callbase+ " --repeating_free-actions-reactions_-CREATE_name|"+key.trim()+" --repeating_free-actions-reactions_-CREATE_npc_description|"+description.trim();
                if(traits) call += " --repeating_free-actions-reactions_-CREATE_rep_traits|"+traits[1].trim();
                if(trigger) call += " --repeating_free-actions-reactions_-CREATE_trigger|"+trigger[1].trim()+' --repeating_free-actions-reactions_-CREATE_reaction|reaction';
                sendChat("Repeating Reaction",call);
            }
            i++;
        }

    }

    function parseSpeed(speed) { 
        log("parsing speed: "+speed);
        var match = speed.match(/(\d{1,3}) feet[,;]?(.*)#?/i);
        setAttribut('speed',match[1]);
        setAttribut('speed_notes',match[2].trim());
    } //done

    function parseSkills(skills) {
        log("parsing skills: "+skills);

        var regex = /([\w\s]+).*?(\d+)\s*(\((.*)\))?/gi; //match[1] = acrobatics; match[2] = 5
        while(match = regex.exec(skills.replace(/Skills\s+/i, ''))) {
            var skill = match[1].trim().toLowerCase();
            setAttribut(skill, match[2]);
            if(match[3]) setAttribut(skill+'_notes',match[4].trim());
        }
    }//done - handled skill and notes

    function parseSenses(senses) {
        log("parsing senses: "+senses);
        
        var match = senses.match(/(\d+);?(.*)$/);
        setAttribut('perception', match[1]);
        if(match[2]) setAttribut('senses', match[2].trim());
    }//done
    
    function parseItems(items) {        //items = item 1, item 2, item 3
        var itemlist = items.replace('#Items ','').replace(/AC \d.*/, '').split(', ');
        log('itemlist: '+itemlist);
        var rowids = getRepeating('items-worn', 'worn_item');
        for(i = 0; i < itemlist.length; i++){
            if(rowids[i]) setAttribut('repeating_items-worn_'+rowids[i]+'_worn_item', itemlist[i]);
            else sendChat('Repeating Item', callbase + ' --repeating_items-worn_-CREATE_worn_item|'+itemlist[i]);
        }
    };
    
    function addStrikes(text, section) {
        log("called "+section+" strikes for number of abilities: "+text.length);
        if(text.length === 0) return;
        var i = 0;
        var base = 'repeating_'+section+'-strikes_';
        var rowids = getRepeating(section+'-strikes', 'weapon');
        
        _.each(text, function(value) {
            log("Action value: "+value);
            var match = value.match(/([^\+]*)\+(\d{1,2}).*?\((.*?)\), Damage ([d\d+-]*?)\s(.*)/);
            if(match) {
                var repeats = {
                    weapon: match[1].trim(),
                    npc_weapon_strike: match[2].trim(),
                    weapon_traits: match[3].trim(),
                    npc_weapon_strike_damage: match[4],
                };
                if(match[3].includes('agile')) repeats.weapon_agile = 1;
                if(section == 'ranged') {
                    var range = repeats.weapon_traits.match(/.*?range (?:increment )?(\d* feet)/i);
                    if(range[1]) repeats.weapon_range = range[1];
                }
                //match[5] is catchall after damage, includes type + additional
                if(match[5].includes('plus')) {
                    var additional = match[5].match(/(.*?)plus((?:[^A-Z]|(?<![a-z])[A-Z])*)/);
                    repeats.weapon_strike_damage_type = additional[1].trim();
                    repeats.weapon_strike_damage_additional = additional[2].trim().replaceAll(/(Grab|Knockdown|Push)/g, "$& (1 action)").replaceAll(/Improved (Grab|Knockdown|Push) \(1 action\)/g, "Improved $1 (free)");
                } else if(match[5]) {
                    var damagetype = match[5].match(/(?:[^A-Z]|(?<![a-z])[A-Z])*/);
                    log('damage type: '+damagetype);
                    log('dmage type 0: '+damagetype[0]);
                    repeats.weapon_strike_damage_type = damagetype[0];
                }

                // Add strike action
                if(rowids[i]) {
                    for(var key in repeats) {
                        setAttribut(base+rowids[i]+'_'+key, repeats[key]);
                    }
                }  else {
                    var call = callbase;
                    for(var key in repeats) {
                        call = call.concat(' --',base, '-CREATE_', key, '|', repeats[key]);
                    }
                    sendChat("repeating "+section, call);
                }; 
                // Create token action
                var abilitytext = "@{whispertype} &{template:rolls} {{limit_height=@{roll_limit_height}}} {{charactername=@{character_name}}} {{header=@{repeating_"+section+"-strikes_$"+i+"_weapon}}} {{subheader=^{"+section+"_strike}}} {{notes_show=@{roll_show_notes}}} {{notes=@{repeating_"+section+"-strikes_$"+i+"_weapon_notes}}} @{repeating_"+section+"-strikes_$"+i+"_weapon_roll_npc} @{repeating_"+section+"-strikes_$"+i+"_damage_roll_npc} @{repeating_"+section+"-strikes_$"+i+"_roll_critical_damage_npc} @{repeating_"+section+"-strikes_$"+i+"_damage_additional_roll_npc}";
                if(section == 'ranged'&&range[1]) abilitytext += "{{info01_name=^{range}}} {{info01=@{repeating_ranged-strikes_$"+i+"weapon_range}}}";
                setAbility(jf.capitalizeEachWord(repeats.weapon), "", abilitytext, jf.createAbilityAsToken);
                i++;
            } else log('no matches of type '+section+' found in action.');
        }); 
    }

    function parseActions(melee, ranged) {
        log("ranged: "+ranged);
        if(!ranged) {
            if(!melee) {
                log('no melee or ranged abilities.');
                return;
            }
            var i = melee.indexOf("Ranged ");
            log('index of ranged in melee: '+i);
            if(i != -1) {
                ranged = melee.slice(i);
                melee = melee.slice(0,i); log('melee fixed: '+melee);
            }
        }

        if(melee) addStrikes(melee.split("Melee "), 'melee');
        if(ranged) addStrikes(ranged.split("Ranged "), 'ranged')
        else ranged = melee; //if no ranged, pull melee forward so other can still parse
        
        var other = ranged;

        other = other.split(/Melee |Ranged /).pop();
        other = other.replace('#',' ')

        var other = other.replace(/.*Damage ([\dd+-]*?)\s([a-z]*)(\splus [\dd+-]*\s\w[a-z]*)?/,'');
        parseOther(other);
}

    function parseOther(other) {
        log('parsing other: '+other);
        var standardother = {
            "Aquatic Ambush": "Requirements The monster is hiding in water and a creature that hasn’t detected it is within the listed number of feet. Effect The monster moves up to its swim Speed + 10 feet toward the triggering creature, traveling on water and on land. Once the creature is in reach, the monster makes a Strike against it. The creature is flat-footed against this Strike.",
            "Change Shape": "(concentrate, [magical tradition], polymorph, transmutation) The monster changes its shape indefinitely. It can use this action again to return to its natural shape or adopt a new shape. +4 status bonus to Deception DC to identify ancestry/type.",
            "Constrict": "The monster deals the listed amount of damage to any number of creatures grabbed or restrained by it. Each of those creatures can attempt a basic Fortitude save with the listed DC.",
            "Form Up": "The troop chooses one of the squares it currently occupies and redistributes its squares to any configuration in which all squares are contiguous and within 15 feet of the chosen square. The troop can't share its space with other creatures.",
            "Greater Constrict": "The monster deals the listed amount of damage to any number of creatures grabbed or restrained by it. Each of those creatures can attempt a basic Fortitude save with the listed DC. A creature that fails this save falls unconscious, and a creature that succeeds is then temporarily immune to falling unconscious from Greater Constrict for 1 minute.",
            "Rend": "Requirements The monster hit the same enemy with two consecutive Strikes of the listed type in the same round. Effect The monster automatically deals that Strike’s damage again to the enemy.",
            "Throw Rock": "The monster picks up a rock within reach or retrieves a stowed rock and throws it, making a ranged Strike.",
            "Engulf": "The monster Strides up to double its Speed and can move through the spaces of any creatures in its path. Any creature of the monster’s size or smaller whose space the monster moves through can attempt a Reflex save with the listed DC to avoid being engulfed. A creature unable to act automatically critically fails this save. If a creature succeeds at its save, it can choose to be either pushed aside (out of the monster’s path) or pushed in front of the monster to the end of the monster’s movement. The monster can attempt to Engulf the same creature only once in a single use of Engulf. The monster can contain as many creatures as can fit in its space.#A creature that fails its save is pulled into the monster’s body. It is grabbed, is slowed 1, and has to hold its breath or start suffocating. The creature takes the listed amount of damage when first engulfed and at the end of each of its turns while it’s engulfed. An engulfed creature can get free by Escaping against the listed escape DC. An engulfed creature can attack the monster engulfing it, but only with unarmed attacks or with weapons of light Bulk or less. The engulfing creature is flat-footed against the attack. If the monster takes piercing or slashing damage equaling or exceeding the listed Rupture value from a single attack or spell, the engulfed creature cuts itself free. A creature that gets free by either method can immediately breathe and exits the swallowing monster’s space.#If the monster dies, all creatures it has engulfed are automatically released as the monster’s form loses cohesion.",
            "Trample": "The monster Strides up to double its Speed and can move through the spaces of creatures of the listed size, Trampling each creature whose space it enters. The monster can attempt to Trample the same creature only once in a single use of Trample. The monster deals the damage of the listed Strike, but trampled creatures can attempt a basic Reflex save at the listed DC (no damage on a critical success, half damage on a success, double damage on a critical failure)."
        }

        for(var key in standardother){
            other = other.replace(key, key+" "+standardother[key]);
        }
        log('text parsed for standard reactions: '+other);

        var rowids = getRepeating('actions-activities', 'name');
        
        var titles = { };

        var regex = /(?<!D|DC\s\d*\s|\.\s)(?!Trigger|Effect|Requirements?)([A-Z][a-z]*(?:\s(?:of|in|to|for)\sthe\s[A-Z]|\s(?:the|of|in|to|for)\s[A-Z]|\s[A-Z]){0,1}[a-z]*\s)(?<!Trigger\s|Requirements?)(?=[A-Z][a-z]*\s|\()/g;

        while(match = regex.exec(other)) {
            titles[match[1].trim()] = match.index; //match[1] = 'Chill Breath'
        }
        var exclude = ['Trigger','Requirement','Effect','Hit Points', 'Saving Throw', 'Maximum Duration', 'Stage', 'Constant', 'Critical Success', 'Success', 'Failure', 'Critical Failure', 'Heightened', 'Administer First Aid', 'Drop Prone', 'Sense Motive', 'Avert Gaze', 'Cast a Spell', 'Grab an Edge', 'Raise a Shield','Aid'];
//        var compare = '';

        //delete repeats and accidental captures; capture indices of real abilities
        var indices = [];
        for(var key in titles) { //key = 'Chill Breath'
            if(exclude.some( (element) => other.startsWith(element, titles[key]) ) ) {
                log('deleting repeated title: '+key)
                delete titles[key];
            } else {
                indices.push(titles[key])
                exclude.push(key.trim());
            }
        }
        indices.push(other.length);

        //add to sheet
        var i = 0;
        for(var key in titles) {
            
            var description = other.substring(indices[i]+key.length, indices[i+1]).trim();

            var traits = description.match(/^\((.*?)\)/);
            if(traits) description = description.substring(2+traits[1].length);

            var actions = 0;
            if(key.trim() in standardother) {
                actions = 1;
                if(key.trim() == "Engulf") actions = 2;
                if(key.trim() == "Trample") actions = 3;
            }
            
            if(key.trim() == "Swallow Whole") {
                if(!traits) traits[1] = 'attack';
                else if(!traits[1].includes('attack')) traits[1] = 'attack, '+traits[1];
                description += ". Athletics vs Reflex DC, swallow on success.";
            }

            if(key.includes('Innate'||'Focus') && description.startsWith('Spells')) {
                key = key.trim()+' Spells';
                description = description.substring('Spells '.length);
            }

            log('text of '+key+': '+description);

            if(rowids[i]) {
                setAttribut('repeating_actions-activities_'+rowids[i]+'_name', key.trim())
                setAttribut('repeating_actions-activities_'+rowids[i]+'_npc_description', description.trim());
                if(traits) setAttribut('repeating_actions-activities_'+rowids[i]+'_rep_traits', traits[1].trim())
                if(actions != 0) setAttribut('repeating_actions-activities_'+rowids[i]+'_actions', actions);
            } else {
                call = callbase+ " --repeating_actions-activities_-CREATE_name|"+key.trim()+" --repeating_actions-activities_-CREATE_npc_description|"+description.trim();
                if(traits) call += " --repeating_actions-activities_-CREATE_rep_traits|"+traits[1].trim();
                if(actions != 0) call += " --repeating_actions-activities_-CREATE_actions|"+actions;
                sendChat("Repeating Action",call);
            }
            i++;
        }
    }
    
}(typeof jf === 'undefined' ? jf = {} : jf));

on("ready", function() {
    'use strict';
    jf.statblock.RegisterHandlers();
    log("completed successfully!");
});


//from Liam: NPC Sheet Inline Rolls https://app.roll20.net/forum/post/11074560/npc-sheet-inline-rolls
on('ready',()=>{

    on('chat:message', (msg) => {
        if(msg.type === 'api' && /^!parse-inline\b/i.test(msg.content)){

            var selectedCharacterSheetIds = (msg.selected || []).map(obj => getObj("graphic", obj._id))
				.filter(x => !!x)
				.map(token => token.get("represents"))
				.filter(id => getObj("character", id || ""));
				
			var dc = /(?<!\*\*)(Escape )?DC\s\d{1,2}((\sbasic)?\s(Reflex|Will|Fortitude)(\ssave)?)?(?!\*\*)/g
			var damage = /(?<!\[\[)\d+?d\d{1,3}(\s*\+\s*\d+)?(?!\]\])/g
			var keyword = /(?<!\*\*)(?:Trigger|Effect|Requirements?)(?!\*\*)/g

            selectedCharacterSheetIds.forEach(function (characterSheetId) {
    		    let attributes = findObjs({ type: 'attribute', characterid: characterSheetId })
                    .filter(attribute => /^repeating_([^_]*?)_([^_]*?)_description$/g.test(attribute.get('name')))
                    .filter(attribute => damage.test(attribute.get('current'))||dc.test(attribute.get('current'))||keyword.test(attribute.get('current')));
                
    		    let additional = findObjs({ type: 'attribute', characterid: characterSheetId })
                    .filter(attribute => /^repeating_([^_]*?)_([^_]*?)_weapon_strike_damage_additional$/g.test(attribute.get('name')))
                    .filter(attribute => damage.test(attribute.get('current')));
                    
                attributes = attributes.concat(additional);
                
                attributes.forEach(attribute => attribute.set('current', attribute.get('current').replace(damage, "[[$&]]").replace(dc, "**$&**").replace(keyword,"**$&**")))
                    
                let character = getObj("character", characterSheetId || "");
                let characterName = character.get('name');
                log(`${characterName}** had ${attributes.length} abilities changed to use inline rolls.`);
			});

        }
    });

});

