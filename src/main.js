import Alpine from 'alpinejs';
import Chart from 'chart.js/auto';
import './styles.css';

window.Alpine = Alpine;
window.Chart = Chart;

Alpine.data('calculatorShell', () => ({
  ready: true,
  version: __APP_VERSION__,
}));

Alpine.start();

await import('./legacy-calculator.js');
