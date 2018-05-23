## Agamari

[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](http://agamari.herokuapp.com) [![Jenkins](https://img.shields.io/jenkins/s/https/jenkins.qa.ubuntu.com/precise-desktop-amd64_default.svg)]() [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/quirkycorgi/Agamari/blob/master/LICENSE)

### Physics-based 3D Multiplayer Browser Game
Inspired by [Katamari Damacy](https://en.wikipedia.org/wiki/Katamari_Damacy) and [Agar.io](http://agar.io), this is Agamari, an online multiplayer game where players compete to roll up the largest ball on a tiny planet. Along the way they might roll up each other, or even the moon.

![](https://github.com/quirkycorgi/Agamari/blob/master/public/gameplay.gif)

### Live Demo
A playable online build of Agamari can be found [here](https://agamari.herokuapp.com).

### Gameplay Mechanics
Agamari is designed to be a simple-to-understand game that relies on intuitive physics for its gameplay mechanics. Players join each game as small spherical rocks with one purpose for existence: to roll up everything they can on the planet.
Rocks are able to only pick up objects smaller than themselves. However, each object added increases a rock's size, allowing for larger and larger things to be rolled up as the game progresses. Items rolled up affect the mass and shape of a rock, bringing challenges and strategy to picking up different objects. Eventually, players may encounter other players, and if they are larger, can roll them up as well.

### Architecture
Agamari is built on [Node.js](https://nodejs.org/) using [Socket.IO](http://socket.io/) for client-server interaction, [Three.js](https://threejs.org/) for 3D graphics rendering, [Cannon.js](http://www.cannonjs.org/) for the physics engine, [React](https://facebook.github.io/react/) for HTML rendering, and [Redux](http://redux.js.org/) for both client and server app state and game state management.

![alt text](https://github.com/quirkycorgi/Agamari/blob/master/public/architecture.gif)

Handling of the game logic is distributed between the client and the server. Clients run their own physics calculations to compute their next position and orientation, while the server manages and modifies the master game state according to game logic and client events such as collisions with objects or other players.

### How to Play
- Use the arrow keys (or <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>) to move your rock.
- Roll over objects or players smaller than your rock to pick them up and grow.
- Avoid being rolled up by larger players.
- Hold & release the spacebar while holding down an arrow key to launch yourself in that direction.

### More Tips
- Your volume determines what you can or can not roll up. You can only roll up objects or players with less volume than yourself.
- Objects spawn randomly across the planet. They are usually scaled to the size of the smaller players, although occasionally large spawns occur.
- Players farther ahead in volume gain volume from objects at a slower rate. To keep their lead, hunting other players is a more efficient tactic.
- The larger you are, the heavier and more unwieldly you become, making movement more cumbersome. Be aware of what and how you pick up different objects and players.

### Installation
To install Agamari on your computer, you will need [Node.js with NPM](https://nodejs.org/en/download/) and [PostgreSQL](http://postgresguide.com/setup/install.html).

Once you have Node.js with NPM, install the game's dependencies with the following command:

```js
npm install
```

When the dependencies have been installed, open PostgreSQL and create a database with the following command:

```SQL
CREATE DATABASE agamari;
```

Then start the server with the following command:

```js
npm start
```

The game will then be accessible at `http://localhost:8000`.

### Help
Create an [issue](https://github.com/quirkycorgi/Agamari/issues) if you need help.

### Credits
Thanks to [p0ss](http://opengameart.org/users/p0ss) for the "eating" sound.
