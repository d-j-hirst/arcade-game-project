# Project Features

This project has been created to fulfil the requirements of the Udacity Classic Arcade Game Clone specification, as well as some additional features detailed below.

## Required Features

* The page displays an arcade game with a player moving across some terrain trying to dodge enemies and move to the water to win.
* Three kinds of terrain are displayed: grass (safe), stone (dangerous, enemies are found here), water (player wins); these are represented on screen in a tiled fashion.
* The player character moves in discrete increments across the screen, starting on the grass and aiming to reach the water. The player cannot move off the visible screen.
* Enemies cross the screen from one side to the other.
* If the player character touches an enemy, a "game over" screen is shown and then the game is reset to its initial state for the player to try again.
* If the player reaches the water, they win and a screen appears to show that they completed the level.

## Additional Features

* Instead of simply winning when reaching the water, the player progresses to the next level. There are 6 levels of increasing difficulty: more rows of stone blocks, and more frequent and faster enemies per row. If the player successfully completes the final level then it is repeated until they hit an enemy. The level system is designed to flexibly allow levels to be added or modified without having to make widespread changes to code.
* Gems are distributed in a randomised fashion on the stone blocks of the level. The player may move to the gems to pick them up for score points. the score is displayed when progressing to the next level, and also when the game is over.
* The player character blinks for the first two seconds of a level and cannot be moved during this time. This is to allow enemies to enter the screen, so that the player character cannot simply run past them immediately.

# Contained Files

The project should contain the following other files:
* index.html - containing the HTML detailing used stylesheets and scripts
* css\style.css - containing minimal CSS for canvas placement
* js\engine.js - contains the Javascript that defines the core game processes. Note this has been extensively reworked from the provided starter file
* js\entities.js - contains the Javascript that defines the behaviour of game entities (players, enemies, gems) and input handling
* js\levels.js - contains definitions for the levels that the game progresses through
* images folder - contains various images for the game. Not all of these are presently used, but are kept for future additions.
