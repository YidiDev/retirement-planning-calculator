import './sentry.js';
import Alpine from 'alpinejs';
import PineconeRouter from 'pinecone-router';
import './styles.css';
import { calculator } from './app.js';
import { privacyPage } from './pages/privacy.js';
import { termsPage } from './pages/terms.js';
import { donatePage } from './pages/donate.js';

// GA4
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

// Page content on window for x-html
window.privacyPage = privacyPage;
window.termsPage = termsPage;
window.donatePage = donatePage;

Alpine.plugin(PineconeRouter);
Alpine.data('calculator', calculator);
Alpine.start();
