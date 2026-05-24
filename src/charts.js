import Chart from 'chart.js/auto';

Chart.defaults.font.family = "'Inter',system-ui,sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.color = '#5f6478';

const instances = {};

function destroy(name) {
  if (instances[name]) { instances[name].destroy(); instances[name] = null; }
}

function moneyK(v) {
  if (Math.abs(v) >= 1e6) return '$' + (v / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M';
  if (Math.abs(v) >= 1000) return '$' + Math.round(v / 100) / 10 + 'k';
  return '$' + Math.round(v);
}

function baseOpts(yTitle, yFormat) {
  return {
    responsive: true, maintainAspectRatio: false, animation: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { maxTicksLimit: 10, autoSkip: true } },
      y: { title: { display: true, text: yTitle }, grid: { color: '#eef0f3' }, border: { display: false }, ticks: { callback: v => yFormat(v) } },
    },
    plugins: {
      legend: { labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true, font: { size: 11 } } },
      tooltip: { callbacks: { title: items => 'Retired ' + items[0].label } },
    },
  };
}

export function renderIncome(canvasId, rows) {
  destroy('inc');
  const el = document.getElementById(canvasId);
  if (!el) return;
  instances.inc = new Chart(el, {
    type: 'line',
    data: {
      labels: rows.map(r => r.start),
      datasets: [
        { label: 'Average monthly income', data: rows.map(r => Math.round(r.avgAnnualReal / 12)), borderColor: '#4338ca', backgroundColor: 'rgba(67,56,202,.1)', borderWidth: 1.6, pointRadius: 0, fill: true, tension: .15 },
        { label: 'First-year monthly income', data: rows.map(r => Math.round(r.firstYearReal / 12)), borderColor: '#0a8a5e', backgroundColor: 'rgba(10,138,94,.08)', borderWidth: 1.6, pointRadius: 0, fill: true, tension: .15 },
      ],
    },
    options: baseOpts('Withdrawal ($/month, today\'s $)', moneyK),
  });
}

export function renderPreserve(canvasId, rows, target) {
  destroy('pre');
  const el = document.getElementById(canvasId);
  if (!el) return;
  instances.pre = new Chart(el, {
    type: 'line',
    data: {
      labels: rows.map(r => r.start),
      datasets: [
        {
          label: 'Savings remaining (%)', data: rows.map(r => +(r.endRatio * 100).toFixed(1)),
          borderColor: '#4338ca', backgroundColor: 'rgba(67,56,202,.08)', borderWidth: 1.6,
          fill: true, tension: .15,
          pointRadius: rows.map(r => r.passed ? 0 : 3),
          pointBackgroundColor: rows.map(r => r.passed ? 'transparent' : '#d32f5a'),
          pointBorderColor: rows.map(r => r.passed ? 'transparent' : '#d32f5a'),
        },
        { label: 'Goal (' + Math.round(target * 100) + '%)', data: rows.map(() => target * 100), borderColor: '#9ca0b0', borderWidth: 1.4, borderDash: [6, 4], pointRadius: 0, fill: false },
      ],
    },
    options: baseOpts('Inflation-adjusted savings left', v => v + '%'),
  });
}

export function renderSpotlight(canvasId, traj) {
  destroy('spot');
  const el = document.getElementById(canvasId);
  if (!el) return;
  instances.spot = new Chart(el, {
    type: 'line',
    data: {
      labels: traj.labels,
      datasets: [
        { label: 'Portfolio value', yAxisID: 'y', data: traj.realValue.map(v => Math.round(v)), borderColor: '#4338ca', backgroundColor: 'rgba(67,56,202,.1)', borderWidth: 1.8, pointRadius: 0, fill: true, tension: .15 },
        { label: 'Monthly income', yAxisID: 'y1', data: traj.realWithdrawal.map(v => Math.round(v / 12)), borderColor: '#0a8a5e', borderWidth: 1.6, pointRadius: 0, fill: false, tension: .15 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { maxTicksLimit: 10, autoSkip: true } },
        y: { position: 'left', title: { display: true, text: 'Portfolio value (today\'s $)' }, grid: { color: '#eef0f3' }, border: { display: false }, ticks: { callback: v => moneyK(v) } },
        y1: { position: 'right', title: { display: true, text: 'Income ($/month)' }, grid: { display: false }, border: { display: false }, ticks: { callback: v => moneyK(v) } },
      },
      plugins: { legend: { labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true, font: { size: 11 } } } },
    },
  });
}

export function destroyAll() {
  destroy('inc'); destroy('pre'); destroy('spot');
}
