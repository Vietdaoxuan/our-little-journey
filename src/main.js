import Phaser from 'phaser';
import { gameConfig } from './gameConfig.js';
import { bindPageVisibility } from './runtime/gamePresentation.js';
import { addSoundControls } from './ui/SoundControls.js';
import './style.css';

const game = new Phaser.Game(gameConfig);
const root = document.getElementById(gameConfig.parent);
addSoundControls(game, root);
bindPageVisibility(game, root);
