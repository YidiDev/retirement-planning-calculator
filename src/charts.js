import Chart from 'chart.js/auto';

Chart.defaults.font.family = "'Source Sans 3', sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.color = '#8a7e6f';

const instances = {};
function destroy(k) { if (instances[k]) { instances[k].destroy(); instances[k] = null; } }

function moneyK(v) {
  if (Math.abs(v) >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
  if (Math.abs(v) >= 1000) return '$' + (Math.round(v / 100) / 10) + 'k';
  return '$' + Math.round(v);
}

function opts(yTitle, yFmt) {
  return {
    responsive: true, maintainAspectRatio: false, animation: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { grid: { display: false }, border: { display: false },
        ticks: { maxTicksLimit: 10, autoSkip: true, color: '#8a7e6f', font: { size: 10 } } },
      y: { title: { display: true, text: yTitle, color: '#5a4e3f', font: { size: 11 } },
        grid: { color: '#e2d9cb' }, border: { display: false },
        ticks: { callback: v => yFmt(v), color: '#8a7e6f', font: { size: 10 } } },
    },
    plugins: {
      legend: { labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true,
        font: { size: 11, family: "'Source Sans 3',sans-serif" }, color: '#5a4e3f' } },
      tooltip: { callbacks: { title: items => 'Retired ' + items[0].label } },
    },
  };
}

export function renderIncome(id, rows) {
  destroy('inc');
  const el = document.getElementById(id); if (!el) return;
  instances.inc = new Chart(el, { type: 'line', data: {
    labels: rows.map(r => r.start),
    datasets: [
      { label: 'Average monthly', data: rows.map(r => Math.round(r.avgAnnualReal / 12)),
        borderColor: '#b85c38', backgroundColor: 'rgba(184,92,56,.1)',
        borderWidth: 1.6, pointRadius: 0, fill: true, tension: .15 },
      { label: 'First-year monthly', data: rows.map(r => Math.round(r.firstYearReal / 12)),
        borderColor: '#5a7a4a', backgroundColor: 'rgba(90,122,74,.08)',
        borderWidth: 1.6, pointRadius: 0, fill: true, tension: .15 },
    ],
  }, options: opts("Withdrawal ($/month, today's $)", moneyK) });
}

export function renderPreserve(id, rows, target) {
  destroy('pre');
  const el = document.getElementById(id); if (!el) return;
  instances.pre = new Chart(el, { type: 'line', data: {
    labels: rows.map(r => r.start),
    datasets: [
      { label: 'Savings remaining (%)', data: rows.map(r => +(r.endRatio * 100).toFixed(1)),
        borderColor: '#b85c38', backgroundColor: 'rgba(184,92,56,.08)',
        borderWidth: 1.6, fill: true, tension: .15,
        pointRadius: rows.map(r => r.passed ? 0 : 3),
        pointBackgroundColor: rows.map(r => r.passed ? 'transparent' : '#a0433a'),
        pointBorderColor: rows.map(r => r.passed ? 'transparent' : '#a0433a') },
      { label: 'Goal (' + Math.round(target * 100) + '%)',
        data: rows.map(() => target * 100),
        borderColor: '#8a7e6f', borderWidth: 1.4, borderDash: [6, 4],
        pointRadius: 0, fill: false },
    ],
  }, options: opts('Inflation-adjusted savings left', v => v + '%') });
}

export function renderSpotlight(id, traj) {
  destroy('spot');
  const el = document.getElementById(id); if (!el) return;
  instances.spot = new Chart(el, { type: 'line', data: {
    labels: traj.labels,
    datasets: [
      { label: 'Portfolio value', yAxisID: 'y',
        data: traj.realValue.map(v => Math.round(v)),
        borderColor: '#b85c38', backgroundColor: 'rgba(184,92,56,.1)',
        borderWidth: 1.8, pointRadius: 0, fill: true, tension: .15 },
      { label: 'Monthly income', yAxisID: 'y1',
        data: traj.realWithdrawal.map(v => Math.round(v / 12)),
        borderColor: '#5a7a4a', borderWidth: 1.6, pointRadius: 0,
        fill: false, tension: .15 },
    ],
  }, options: {
    responsive: true, maintainAspectRatio: false, animation: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { grid: { display: false }, border: { display: false },
        ticks: { maxTicksLimit: 10, autoSkip: true, color: '#8a7e6f', font: { size: 10 } } },
      y: { position: 'left', title: { display: true, text: "Portfolio (today's $)", color: '#5a4e3f', font: { size: 11 } },
        grid: { color: '#e2d9cb' }, border: { display: false },
        ticks: { callback: v => moneyK(v), color: '#8a7e6f', font: { size: 10 } } },
      y1: { position: 'right', title: { display: true, text: 'Income ($/mo)', color: '#5a4e3f', font: { size: 11 } },
        grid: { display: false }, border: { display: false },
        ticks: { callback: v => moneyK(v), color: '#8a7e6f', font: { size: 10 } } },
    },
    plugins: { legend: { labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true,
      font: { size: 11, family: "'Source Sans 3',sans-serif" }, color: '#5a4e3f' } } },
  } });
}
