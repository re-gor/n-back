import {ServiceWorkerUtility} from './utils/serviceWorker.js';
import {ScreenSwitcher} from './elements/n-screen-switcher/index.js';
import {Menu} from './elements/n-menu/index.js';
import {Game} from './elements/n-game/index.js';
import {Stat} from './elements/n-statistics/index.js';
import {GameSettings} from './elements/n-game-settings/index.js';
import {Settings} from './elements/n-settings/index.js';
import {Button} from './elements/n-button/index.js';
import {Storage} from './utils/storage.js';

const {isEnabled: isSwEnabled} = Storage.getServiceWorkerSettings();
if (isSwEnabled) {
    ServiceWorkerUtility.register();
}

Button.register();
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
    const settings = gameSettings.getSettings();

    if (settings.invalid) {
        return;
    }

    screenSwitcher.setActiveScreen('game');

    game.startGame(settings);
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


const idleId = requestIdleCallback(() => {
    root.classList.remove('initing');
    cancelIdleCallback(idleId);
});
