# mxrowan.github.io

This repository currently holds an archive of past scripts written on the Roll20 API using Javascript. For a more recent & more comprehensive project of mine, please see [Known Shores Name Generator](https://github.com/mxrowan/knownshores).

## StatblockImporter
[PF2eStatImporter.js](/StatblockImporter/PF2eStatImporter.js) was a project in 2023 to update and expand a script by another user, [Jean Francois R.](https://app.roll20.net/forum/post/1612177/script-statblock-import-for-5e-character-sheet/?pagenum=1). The original script from 2015 allowed GMs to import 5E statblocks to roll20 by pasting them into the GMNotes of a token.

My update involved: 
1. updating the original to be compatible with 8 years of Roll20 system updates
2. replacing every regex and attribute call to follow the Pathfinder Second Edition by Roll20 sheet rather than 5E
3. writing wholesale the code to handle repeating sections, which did not exist in 2015, using the original script as a model 

Working on this project was a great exercise in working in collaboration with someone else's work, because it required me to fully understand Jean-Francois' script in order to even tell what needed to be updated. It also gave me a great structure to understand the relationships between different character sheets, as I had to work through every individual element of the Pathfinder Second Edition sheet to understand the correct syntax and convention.

## CatVillage
Archive of initial scripts writting March 2020 in the Roll20 API for a custom oneshot with automated puzzles. These were the first scripts I ever wrote in Javascript, so include a number of shortcuts and inadvisable practices, including hardcoding element IDs and gratuitous use of global variables. But they did work!
- [LanternMarch.js](/CatVillage/LanternMarch.js) controlled the automated movement of two lantern tokens on two different tracks, as well as handling chat messages with on-the-fly adjustments to their rotations, tracks, and 'light' (aura) radius.
- [LaserPointer.js](/CatVillage/LaserPointer.js) controlled the movement of a cat's token in response to change in position of a laser pointer token, including flip and alteration of the token image. Also included catch-all for other chat commands.
- [PlatePuzzle.js](/CatVillage/PlatePuzzle.js) controlled the automation of a puzzle involving moving multiple stone blocks by stepping on connected pressure plates. The goal was to free up the flow of water through a canal, so this script also handled the responsive movement of the water level depending on the block state.

