import {ServiceWorkerUtility} from './utils/serviceWorker.js';
import {ScreenSwitcher} from './elements/n-screen-switcher/index.js';
import {Menu} from './elements/n-menu/index.js';
import {Game} from './elements/n-game/index.js';
import {Stat} from './elements/n-statistics/index.js';
import {GameSettings} from './elements/n-game-settings/index.js';
import {Settings} from './elements/n-settings/index.js';
import {Storage} from './utils/storage.js';

const {isEnabled: isSwEnabled} = Storage.getServiceWorkerSettings();
if (isSwEnabled) {
    ServiceWorkerUtility.register();
}

GameSettings.register();
Menu.register();
ScreenSwitcher.register();
Game.register();
Stat.register();
Settings.register();

const screenSwitcher = document.getElementById('app');
const menuScreen = document.getElementById('menu');
const game = document.getElementById('game');
const gameSettings = document.getElementById('game-settings');
const stat = document.getElementById('stat');
const settings = document.getElementById('settings');

screenSwitcher.addEventListener('activeScreenSet', event => {
    if (event.fromScreen === 'game') {
        game.endGame();
    }
});

menuScreen.addEventListener('play', () => {
    screenSwitcher.setActiveScreen('game');

    game.startGame(gameSettings.getSettings());
});

settings.addEventListener('reloadAssets', () => {
    ServiceWorkerUtility.reloadAssets();
});

settings.addEventListener('statCleaned', () => {
    stat.render();
}) 

settings.addEventListener('gameSettingsCleaned', () => {
    gameSettings.render();
}) 

game.addEventListener('gameEndedProperly', () => {
    stat.render();
    gameSettings.saveSettings();
});

document.addEventListener('beforeinstallprompt', console.log.bind(null, 'beforeinstallprompt!'));

const idleId = requestIdleCallback(() => {
    root.classList.remove('initing');
    cancelIdleCallback(idleId);
});