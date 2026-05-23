import Alpine from 'alpinejs';
import './styles.css';
import { calculator } from './app.js';

Alpine.data('calculator', calculator);
Alpine.start();
