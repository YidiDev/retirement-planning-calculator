import './sentry.js';
import Alpine from 'alpinejs';
import './styles.css';
import { calculator } from './app.js';

// Load GA4 if measurement ID is configured
const gaId = typeof __GA_MEASUREMENT_ID__ !== 'undefined' ? __GA_MEASUREMENT_ID__ : '';
if (gaId) {
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', gaId, { send_page_view: false });
}

Alpine.data('calculator', calculator);
Alpine.start();
