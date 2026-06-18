/* ============================================
   Banking Analytics Dashboard — App Logic
   Charts, Filters, Animations
   ============================================ */

const CHART_COLORS = ['#3B82F6','#06B6D4','#8B5CF6','#F59E0B','#10B981','#EF4444','#EC4899'];
const charts = {};

// ---- HELPERS ----
function formatCurrency(num) {
  if (Math.abs(num) >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
  if (Math.abs(num) >= 1e6) return '$' + (num / 1e6).toFixed(1) + 'M';
  if (Math.abs(num) >= 1e3) return '$' + (num / 1e3).toFixed(1) + 'K';
  return '$' + num.toFixed(0);
}
function formatNumber(num) { return num.toLocaleString(); }

function countBy(arr, key) {
  const counts = {};
  arr.forEach(d => { counts[d[key]] = (counts[d[key]] || 0) + 1; });
  return counts;
}
function avgBy(arr, groupKey, valueKey) {
  const groups = {};
  arr.forEach(d => {
    if (!groups[d[groupKey]]) groups[d[groupKey]] = { sum: 0, count: 0 };
    groups[d[groupKey]].sum += d[valueKey];
    groups[d[groupKey]].count++;
  });
  const result = {};
  Object.keys(groups).forEach(k => { result[k] = groups[k].sum / groups[k].count; });
  return result;
}

function ageHistogram(data) {
  const bins = ['17-25','26-35','36-45','46-55','56-65','66-75','76-85'];
  const counts = [0,0,0,0,0,0,0];
  data.forEach(d => {
    if (d.age <= 25) counts[0]++;
    else if (d.age <= 35) counts[1]++;
    else if (d.age <= 45) counts[2]++;
    else if (d.age <= 55) counts[3]++;
    else if (d.age <= 65) counts[4]++;
    else if (d.age <= 75) counts[5]++;
    else counts[6]++;
  });
  return { labels: bins, values: counts };
}

// ---- CHART.JS DEFAULTS ----
function setChartDefaults() {
  Chart.defaults.color = '#94A3B8';
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.pointStyle = 'circle';
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.95)';
  Chart.defaults.plugins.tooltip.titleColor = '#F8FAFC';
  Chart.defaults.plugins.tooltip.bodyColor = '#CBD5E1';
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.animation = { duration: 800, easing: 'easeOutQuart' };
}

function gridColor() { return 'rgba(255,255,255,0.06)'; }
function darkScaleOpts(title) {
  return {
    grid: { color: gridColor(), drawBorder: false },
    ticks: { color: '#94A3B8', font: { size: 11 } },
    title: title ? { display: true, text: title, color: '#94A3B8', font: { size: 12 } } : undefined
  };
}

// ---- KPI RENDERING ----
function renderKPIs(data) {
  const totalClients = data.length;
  const avgIncome = data.reduce((s, d) => s + d.income, 0) / totalClients;
  const totalLoans = data.reduce((s, d) => s + d.bankLoans, 0);
  const totalDeposits = data.reduce((s, d) => s + d.bankDeposits, 0);
  const avgRisk = data.reduce((s, d) => s + d.riskWeighting, 0) / totalClients;
  const totalLending = data.reduce((s, d) => s + d.businessLending, 0);

  animateKPI('kpi-clients', totalClients, 'number');
  animateKPI('kpi-income', avgIncome, 'currency-k');
  animateKPI('kpi-loans', totalLoans, 'currency-b');
  animateKPI('kpi-deposits', totalDeposits, 'currency-b');
  animateKPI('kpi-risk', avgRisk, 'decimal');
  animateKPI('kpi-lending', totalLending, 'currency-b');
}

function animateKPI(id, target, format) {
  const el = document.querySelector('#' + id + ' .kpi-value');
  if (!el) return;
  const duration = 1500;
  const start = performance.now();
  const from = 0;

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = from + (target - from) * ease;

    if (format === 'number') el.textContent = formatNumber(Math.round(current));
    else if (format === 'currency-k') el.textContent = formatCurrency(current);
    else if (format === 'currency-b') el.textContent = formatCurrency(current);
    else if (format === 'decimal') el.textContent = current.toFixed(2);

    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ---- CHART RENDERING ----
function destroyCharts() {
  Object.keys(charts).forEach(k => { if (charts[k]) { charts[k].destroy(); delete charts[k]; } });
}

function renderAllCharts(data) {
  destroyCharts();
  renderAgeChart(data);
  renderNationalityChart(data);
  renderGenderChart(data);
  renderIncomeChart(data);
  renderScatterChart(data);
  renderFinNationalityChart(data);
  renderFinLoyaltyChart(data);
  renderLoyaltyChart(data);
  renderFeeChart(data);
  renderRiskChart(data);
}

function renderAgeChart(data) {
  const hist = ageHistogram(data);
  const ctx = document.getElementById('chart-age');
  charts.age = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: hist.labels,
      datasets: [{
        label: 'Clients',
        data: hist.values,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: '#3B82F6',
        borderWidth: 1, borderRadius: 6, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: darkScaleOpts('Age Group'), y: darkScaleOpts('Count') }
    }
  });
}

function renderNationalityChart(data) {
  const counts = countBy(data, 'nationality');
  const labels = Object.keys(counts);
  const values = Object.values(counts);
  charts.nationality = new Chart(document.getElementById('chart-nationality'), {
    type: 'doughnut',
    data: {
      labels, datasets: [{
        data: values,
        backgroundColor: CHART_COLORS.slice(0, labels.length),
        borderWidth: 0, hoverOffset: 8
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '60%',
      plugins: { legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } } }
    }
  });
}

function renderGenderChart(data) {
  const counts = countBy(data, 'gender');
  charts.gender = new Chart(document.getElementById('chart-gender'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(counts),
      datasets: [{ data: Object.values(counts), backgroundColor: ['#3B82F6','#EC4899'], borderWidth: 0, hoverOffset: 8 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function renderIncomeChart(data) {
  const counts = countBy(data, 'incomeBand');
  const order = ['Low','Mid','High'];
  const colors = ['#F59E0B','#3B82F6','#10B981'];
  charts.income = new Chart(document.getElementById('chart-income'), {
    type: 'bar',
    data: {
      labels: order,
      datasets: [{
        label: 'Clients',
        data: order.map(k => counts[k] || 0),
        backgroundColor: colors.map(c => c + 'B3'),
        borderColor: colors, borderWidth: 1, borderRadius: 6, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: darkScaleOpts('Income Band'), y: darkScaleOpts('Count') }
    }
  });
}

function renderScatterChart(data) {
  const sampled = data.length > 500 ? data.sort(() => 0.5 - Math.random()).slice(0, 500) : data;
  charts.scatter = new Chart(document.getElementById('chart-scatter'), {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Deposits vs Savings',
        data: sampled.map(d => ({ x: d.bankDeposits, y: d.savingAccounts })),
        backgroundColor: 'rgba(59, 130, 246, 0.35)',
        borderColor: 'rgba(59, 130, 246, 0.6)',
        borderWidth: 1, pointRadius: 3, pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `Deposits: ${formatCurrency(ctx.parsed.x)} | Savings: ${formatCurrency(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        x: { ...darkScaleOpts('Bank Deposits'), ticks: { callback: v => formatCurrency(v) } },
        y: { ...darkScaleOpts('Saving Accounts'), ticks: { callback: v => formatCurrency(v) } }
      }
    }
  });
}

function renderFinNationalityChart(data) {
  const nations = ['European','Asian','American','Australian','African'];
  const avgLoans = nations.map(n => { const f = data.filter(d => d.nationality === n); return f.length ? f.reduce((s,d) => s+d.bankLoans,0)/f.length : 0; });
  const avgDeps = nations.map(n => { const f = data.filter(d => d.nationality === n); return f.length ? f.reduce((s,d) => s+d.bankDeposits,0)/f.length : 0; });
  const avgInc = nations.map(n => { const f = data.filter(d => d.nationality === n); return f.length ? f.reduce((s,d) => s+d.income,0)/f.length : 0; });

  charts.finNat = new Chart(document.getElementById('chart-fin-nationality'), {
    type: 'bar',
    data: {
      labels: nations,
      datasets: [
        { label: 'Avg Loans', data: avgLoans, backgroundColor: '#3B82F6B3', borderColor: '#3B82F6', borderWidth: 1, borderRadius: 4 },
        { label: 'Avg Deposits', data: avgDeps, backgroundColor: '#06B6D4B3', borderColor: '#06B6D4', borderWidth: 1, borderRadius: 4 },
        { label: 'Avg Income', data: avgInc, backgroundColor: '#10B981B3', borderColor: '#10B981', borderWidth: 1, borderRadius: 4 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: { x: darkScaleOpts(), y: { ...darkScaleOpts(), ticks: { callback: v => formatCurrency(v) } } }
    }
  });
}

function renderFinLoyaltyChart(data) {
  const tiers = ['Jade','Silver','Gold','Platinum'];
  const avgLoans = tiers.map(t => { const f = data.filter(d => d.loyalty === t); return f.length ? f.reduce((s,d) => s+d.bankLoans,0)/f.length : 0; });
  const avgDeps = tiers.map(t => { const f = data.filter(d => d.loyalty === t); return f.length ? f.reduce((s,d) => s+d.bankDeposits,0)/f.length : 0; });
  const avgInc = tiers.map(t => { const f = data.filter(d => d.loyalty === t); return f.length ? f.reduce((s,d) => s+d.income,0)/f.length : 0; });

  charts.finLoy = new Chart(document.getElementById('chart-fin-loyalty'), {
    type: 'bar',
    data: {
      labels: tiers,
      datasets: [
        { label: 'Avg Loans', data: avgLoans, backgroundColor: '#8B5CF6B3', borderColor: '#8B5CF6', borderWidth: 1, borderRadius: 4 },
        { label: 'Avg Deposits', data: avgDeps, backgroundColor: '#F59E0BB3', borderColor: '#F59E0B', borderWidth: 1, borderRadius: 4 },
        { label: 'Avg Income', data: avgInc, backgroundColor: '#EC4899B3', borderColor: '#EC4899', borderWidth: 1, borderRadius: 4 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: { x: darkScaleOpts(), y: { ...darkScaleOpts(), ticks: { callback: v => formatCurrency(v) } } }
    }
  });
}

function renderLoyaltyChart(data) {
  const counts = countBy(data, 'loyalty');
  const order = ['Jade','Silver','Gold','Platinum'];
  charts.loyalty = new Chart(document.getElementById('chart-loyalty'), {
    type: 'polarArea',
    data: {
      labels: order,
      datasets: [{ data: order.map(k => counts[k] || 0), backgroundColor: ['#10B98180','#94A3B880','#F59E0B80','#8B5CF680'], borderWidth: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
      scales: { r: { grid: { color: gridColor() }, ticks: { display: false } } }
    }
  });
}

function renderFeeChart(data) {
  const counts = countBy(data, 'feeStructure');
  const order = ['High','Mid','Low'];
  const colors = ['#EF4444','#F59E0B','#10B981'];
  charts.fee = new Chart(document.getElementById('chart-fee'), {
    type: 'bar',
    data: {
      labels: order,
      datasets: [{
        label: 'Clients', data: order.map(k => counts[k] || 0),
        backgroundColor: colors.map(c => c + 'B3'), borderColor: colors,
        borderWidth: 1, borderRadius: 6, borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: darkScaleOpts('Count'), y: darkScaleOpts() }
    }
  });
}

function renderRiskChart(data) {
  const counts = countBy(data, 'riskWeighting');
  const levels = ['1','2','3','4','5'];
  const colors = ['#10B981','#06B6D4','#F59E0B','#EF4444','#DC2626'];
  charts.risk = new Chart(document.getElementById('chart-risk'), {
    type: 'bar',
    data: {
      labels: levels.map(l => 'Risk ' + l),
      datasets: [{
        label: 'Clients', data: levels.map(l => counts[parseInt(l)] || 0),
        backgroundColor: colors.map(c => c + 'B3'), borderColor: colors,
        borderWidth: 1, borderRadius: 6, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: darkScaleOpts('Risk Level'), y: darkScaleOpts('Count') }
    }
  });
}

// ---- CORRELATION HEATMAP ----
function renderCorrelationHeatmap() {
  const matrix = BANKING_DATA.correlationMatrix;
  const container = document.getElementById('heatmap-container');
  container.innerHTML = '';

  const n = matrix.labels.length;
  const grid = document.createElement('div');
  grid.className = 'heatmap-grid';
  grid.style.gridTemplateColumns = `100px repeat(${n}, 1fr)`;
  grid.style.gridTemplateRows = `32px repeat(${n}, 1fr)`;

  // Top-left empty cell
  grid.appendChild(createCell('', 'heatmap-label'));

  // Column headers
  matrix.labels.forEach(label => {
    grid.appendChild(createCell(label, 'heatmap-label'));
  });

  // Rows
  for (let i = 0; i < n; i++) {
    // Row label
    grid.appendChild(createCell(matrix.labels[i], 'heatmap-label heatmap-label-left'));
    for (let j = 0; j < n; j++) {
      const val = matrix.values[i][j];
      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      cell.textContent = val.toFixed(2);
      cell.style.backgroundColor = heatmapColor(val);
      cell.style.color = Math.abs(val) > 0.5 ? '#F8FAFC' : '#94A3B8';
      cell.title = `${matrix.labels[i]} × ${matrix.labels[j]}: ${val.toFixed(2)}`;
      grid.appendChild(cell);
    }
  }
  container.appendChild(grid);
}

function createCell(text, className) {
  const cell = document.createElement('div');
  cell.className = className;
  cell.textContent = text;
  return cell;
}

function heatmapColor(value) {
  // -1 = blue, 0 = dark, +1 = warm amber/red
  if (value >= 0) {
    const t = Math.min(value, 1);
    const r = Math.round(30 + t * 215);  // 30 → 245
    const g = Math.round(41 + t * 117);  // 41 → 158
    const b = Math.round(59 - t * 48);   // 59 → 11
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = Math.min(Math.abs(value), 1);
    const r = Math.round(30 + t * 29);   // 30 → 59
    const g = Math.round(41 + t * 89);   // 41 → 130
    const b = Math.round(59 + t * 187);  // 59 → 246
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// ---- FILTER LOGIC ----
function getFilteredData() {
  let data = BANKING_DATA.clients;
  const nat = document.getElementById('filter-nationality').value;
  const gen = document.getElementById('filter-gender').value;
  const loy = document.getElementById('filter-loyalty').value;
  const fee = document.getElementById('filter-fee').value;

  if (nat !== 'all') data = data.filter(d => d.nationality === nat);
  if (gen !== 'all') data = data.filter(d => d.gender === gen);
  if (loy !== 'all') data = data.filter(d => d.loyalty === loy);
  if (fee !== 'all') data = data.filter(d => d.feeStructure === fee);
  return data;
}

function applyFilters() {
  const data = getFilteredData();
  renderKPIs(data);
  renderAllCharts(data);
}

function initFilters() {
  ['filter-nationality','filter-gender','filter-loyalty','filter-fee'].forEach(id => {
    document.getElementById(id).addEventListener('change', applyFilters);
  });
  document.getElementById('filter-reset').addEventListener('click', () => {
    ['filter-nationality','filter-gender','filter-loyalty','filter-fee'].forEach(id => {
      document.getElementById(id).value = 'all';
    });
    applyFilters();
  });
}

// ---- SCROLL ANIMATIONS ----
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ---- SMOOTH SCROLL ----
function initSmoothScroll() {
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  setChartDefaults();
  const data = BANKING_DATA.clients;
  renderKPIs(data);
  renderAllCharts(data);
  renderCorrelationHeatmap();
  initFilters();
  initScrollAnimations();
  initSmoothScroll();
});
