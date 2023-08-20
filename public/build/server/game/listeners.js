const Promise = require('bluebird');
const swearjar = require('swearjar');
const chalk = require('chalk');
const { initPos, uuid } = require('./utils');
const store = require('../store');
const { playerIsLeading } = require('../game/engine');
const worldNames = require('../world-names');
const { forOwn, size, pickBy, random, find } = require('lodash');
const { clearFoodEaten, clearPlayersEaten, addPlayer, playerEatsPlayer, playerLeaves, eatFood } = require('../reducers/players');
const { addWorld } = require('../reducers/worlds');
const { updatePlayer, updateVolume, changePlayerScale, clearDiet } = require('../reducers/players');
const World = {};
const getWorld = () => {
    let { worlds, players } = store.getState();
    for (let world of worlds) {
        let playerCount = size(pickBy(players, player => player.world === world.id));
        if (playerCount < 20) {
            return world;
        }
    }
    return null;
};
const setUpListeners = (io, socket) => {
    Promise.promisifyAll(socket);
    console.log('A new client has connected');
    console.log(chalk.yellow('socket id: ', socket.id));
    // Player requests to start game as guest
    socket.on('start_as_guest', data => {
        let { players, food } = store.getState();
        let foundWorld = getWorld();
        let playerWorld = foundWorld || { id: uuid(), name: worldNames[random(worldNames.length - 1)] };
        store.dispatch(addWorld(playerWorld));
        let world = playerWorld.id;
        // Create new player with db info, initial position and world
        let player = Object.assign({}, initPos(), { socketId: socket.id, id: uuid(), nickname: data.nickname, world });
        // Log player out of all current worlds (async, stored in array of promises)
        let leavePromises = [];
        forOwn(socket.rooms, currentRoom => {
            leavePromises.push(socket.leaveAsync(currentRoom));
        });
        // Add player to server game state
        store.dispatch(addPlayer(socket.id, player));
        // Tell all players in world to create object for new player
        io.sockets.in(world).emit('add_player', socket.id, player);
        console.log(chalk.green(`adding ${player.nickname} (${socket.id}) to world ${world}`));
        Promise.all(leavePromises)
            .then(() => {
            // Find all players in world and tell new player to add to game state
            let worldPlayers = pickBy(players, currentPlayer => currentPlayer.world === world);
            worldPlayers[socket.id] = player;
            // here we pass the entire players store (incl. diet arrays)
            socket.emitAsync('player_data', worldPlayers);
        })
            .then(() => {
            // Find all food in world and tell new player to add to game state
            let worldFood = pickBy(food, currentFood => currentFood.world === world);
            // let worldFood = food.filter(({ world }) => world === world);
            socket.emitAsync('food_data', worldFood);
        })
            .then(() => socket.joinAsync(world)) // Join world
            .then(() => socket.emit('start_game')); // Tell player to initialize game
    });
    // For every frame of animation, players are emitting their current position
    socket.on('update_position', data => {
        let { players, worlds } = store.getState();
        let player = players[socket.id];
        if (player) {
            if ((data.x > -1600 && data.y > -1600 && data.z > -1600) && (data.x < 1600 && data.y < 1600 && data.z < 1600)) {
                // update game state with current position
                store.dispatch(updatePlayer(socket.id, data));
            }
            else {
                // if player's coordinates are too far from planet center, they are respawned
                io.sockets.in(player.world).emit('remove_player', socket.id);
                store.dispatch(updatePlayer(socket.id, initPos()));
                store.dispatch(clearDiet(socket.id));
                store.dispatch(clearFoodEaten(socket.id));
                store.dispatch(clearPlayersEaten(socket.id));
                io.sockets.in(player.world).emit('add_player', socket.id, Object.assign({}, initPos(), { nickname: player.nickname }), true);
                let world = find(worlds, { id: player.world });
                socket.emit('you_fell', world);
            }
        }
    });
    // When players collide with food objects, they emit the food's id
    socket.on('eat_food', (id, volume) => {
        let { food, players } = store.getState();
        let eaten = food[id];
        let player = players[socket.id];
        // First, verify that food still exists.
        // Then increase player size and tell other players to remove food object
        if (eaten) {
            let numberPeople = size(pickBy(players, ({ world }) => world === player.world));
            let place = playerIsLeading(socket.id);
            // increase vol and scale of player based on number of people in world and position in leaderboard
            store.dispatch(eatFood(player, id, numberPeople, place, volume));
            io.sockets.in(eaten.world).emit('remove_food', id, socket.id, player);
        }
    });
    // Verify client disconnect
    socket.on('disconnect', () => {
        let player = store.getState().players[socket.id];
        if (player) {
            let { world } = player;
            // Remove player from server game state and tell players to remove player object
            // store.dispatch(removePlayer(socket.id));
            store.dispatch(playerLeaves(player));
            io.sockets.in(world).emit('remove_player', socket.id);
        }
        console.log(chalk.grey(`socket id ${socket.id} has disconnected.`));
    });
    // Verify client disconnect
    socket.on('leave', () => {
        let { players, worlds } = store.getState();
        let player = players[socket.id];
        if (player) {
            // Remove player from server game state and tell players to remove player object
            store.dispatch(playerLeaves(player));
            let world = worlds[player.world] ? worlds[player.world].name : player.world;
            io.sockets.in(player.world).emit('remove_player', socket.id);
            console.log(chalk.cyan(`${player.nickname} has left ${world}.`));
        }
    });
    socket.on('got_eaten', (id, volume) => {
        let { players } = store.getState();
        let eaten = players[socket.id];
        let eater = players[id];
        if (eaten && eater && Date.now() - (eaten.eatenCooldown || 0) > 5000) {
            let { world } = eaten;
            let respawnedPlayer = Object.assign({}, eaten, initPos());
            store.dispatch(playerEatsPlayer(eater, eaten, volume));
            io.sockets.in(world).emit('remove_player', socket.id, id, eater, eaten);
            io.sockets.in(world).emit('add_player', socket.id, respawnedPlayer, true);
            socket.emit('you_got_eaten', eater.nickname);
            io.sockets.in(world).emit('casualty_report', eater.nickname, eaten.nickname);
        }
    });
    socket.on('launched', (launchMult) => {
        let { players } = store.getState();
        let player = players[socket.id];
        let percentageRemainingVol = 1 - 0.01 * launchMult;
        console.log(launchMult, percentageRemainingVol);
        store.dispatch(updateVolume(socket.id, player.volume * percentageRemainingVol));
        store.dispatch(changePlayerScale(socket.id, -1 * player.volume * (1 - percentageRemainingVol) / player.volume));
    });
    socket.on('new_message', message => {
        let player = store.getState().players[socket.id];
        if (player) {
            let { world, nickname } = player;
            let text = swearjar.censor(message);
            io.sockets.in(world).emit('add_message', { nickname, text });
        }
    });
};
// override swearjar asterisks with rice balls
swearjar.censor = function (text) {
    let censored = text;
    this.scan(text, function (word, index) {
        censored = censored.substr(0, index) +
            word.replace(/\S/g, '🍙') +
            censored.substr(index + word.length);
    });
    return censored;
};
module.exports = setUpListeners;
//# sourceMappingURL=listeners.js.map