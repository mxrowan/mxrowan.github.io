# mxrowan.github.io

This repository currently holds an archive of past scripts written on the Roll20 API using Javascript. For a more recent & more comprehensive project, please see [Known Shores Name Generator](https://github.com/mxrowan/knownshores).


## CatVillage
Archive of initial scripts writting March 2020 in the Roll20 API for a custom oneshot with automated puzzles.
- [LanternMarch.js](/CatVillage/LanternMarch.js) controlled the automated movement of two lantern tokens on two different tracks, as well as handling chat messages with on-the-fly adjustments to their rotations, tracks, and 'light' (aura) radius.
- [LaserPointer.js](/CatVillage/LaserPointer.js) controlled the movement of a cat's token in response to change in position of a laser pointer token, including flip and alteration of the token image. Also included catch-all for other chat commands.
- [PlatePuzzle.js](/CatVillage/PlatePuzzle.js) controlled the automation of a puzzle involving moving multiple stone blocks by stepping on connected pressure plates. The goal was to free up the flow of water through a canal, so this script also handled the responsive movement of the water level depending on the block state.

