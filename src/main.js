import Alpine from 'alpinejs';
import './styles.css';
import { calculator } from './app.js';
import { headerTemplate } from './templates/header.js';
import { setupTemplate } from './templates/setup.js';
import { withdrawalTemplate } from './templates/withdrawal.js';
import { resultsTemplate } from './templates/results.js';
import { chartsSectionTemplate } from './templates/charts-section.js';
import { tableSectionTemplate } from './templates/table-section.js';
import { footerTemplate } from './templates/footer.js';

window.tplHeader = headerTemplate;
window.tplSetup = setupTemplate;
window.tplWithdrawal = withdrawalTemplate;
window.tplResults = resultsTemplate;
window.tplCharts = chartsSectionTemplate;
window.tplTable = tableSectionTemplate;
window.tplFooter = footerTemplate;

Alpine.data('calculator', calculator);
Alpine.start();
