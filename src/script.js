import {ScreenSwitcher} from './elements/n-screen-switcher/index.js';
import {Menu} from './elements/n-menu/index.js';
import {Game} from './elements/n-game/index.js';
import {Stat} from './elements/n-statistics/index.js';
import {Settings} from './elements/n-settings/index.js';

Settings.register();
Menu.register();
ScreenSwitcher.register();
Game.register();
Stat.register();

const screenSwitcher = document.getElementById('app');
const menuScreen = document.getElementById('menu');
const game = document.getElementById('game');
const settings = document.getElementById('settings');
const stat = document.getElementById('stat');

screenSwitcher.addEventListener('activeScreenSet', event => {
    if (event.fromScreen === 'game') {
        game.endGame();
    }
});

menuScreen.addEventListener('play', () => {
    screenSwitcher.setActiveScreen('game');

    game.startGame(settings.getSettings());
});

game.addEventListener('gameEndedProperly', () => {
    stat.render();
    settings.saveSettings();
});


const idleId = requestIdleCallback(() => {
    root.classList.remove('initing');
    cancelIdleCallback(idleId);
});
