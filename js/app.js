/* =========================================================================
   Product & UX Analytics — application logic
   All figures are computed live from the six CSV files in /data. Nothing
   in this file is hardcoded from the source spec — every KPI, chart and
   narrative insight is derived at runtime via Papa Parse + plain JS.
   ========================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     CONFIG
     --------------------------------------------------------------------- */
  const DATA_FILES = {
    funnelGeneral:    'data/funnel_general.csv',
    funnelDevice:      'data/funnel_device.csv',
    trafficSources:    'data/traffic_sources.csv',
    productAnomalies:  'data/product_anomalies.csv',
    retentionDays:     'data/retention_days.csv',
    cohortRetention:   'data/cohort_retention.csv'
  };

  const PALETTE = ['#118DFF', '#E66C37', '#744EC2', '#D9B300', '#197278', '#E044A7', '#1AAB40', '#D64550', '#12239E'];
  const COLOR = {
    blue: '#118DFF', blueDark: '#12239E', orange: '#E66C37', purple: '#6B007B',
    violet: '#744EC2', gold: '#D9B300', red: '#D64550', teal: '#197278',
    green: '#1AAB40', gray: '#8A8886', textSecondary: '#605E5C'
  };
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /* ---------------------------------------------------------------------
     STATE
     --------------------------------------------------------------------- */
  const STATE = {
    data: {},
    stats: {},
    charts: {},
    filters: {
      device: 'all',
      sources: null,   // Set of included source_name, populated after load
      buyers: 'all',
      productSort: { key: 'viewers', dir: 'desc' }
    }
  };

  /* ---------------------------------------------------------------------
     UTILITIES
     --------------------------------------------------------------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function formatNumber(n) {
    const v = Number(n) || 0;
    return new Intl.NumberFormat('en-US').format(Math.round(v));
  }
  function formatPercent(n, decimals) {
    const d = decimals === undefined ? 2 : decimals;
    const v = Number(n) || 0;
    return v.toFixed(d) + '%';
  }
  function formatCurrency(n) {
    const v = Number(n) || 0;
    return '$' + new Intl.NumberFormat('en-US').format(Math.round(v));
  }
  function cap(s) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function formatMonth(cohortMonth) {
    // cohortMonth like "2020-11-01" or "2020-11"
    const parts = String(cohortMonth).split('-');
    const y = parts[0], mo = parseInt(parts[1], 10);
    return `${MONTH_NAMES[mo - 1]} ${y}`;
  }
  function colorForSource(name, idx) {
    if (/data deleted/i.test(name) || /not set/i.test(name) || /^\(none\)$/i.test(name)) return COLOR.gray;
    return PALETTE[idx % PALETTE.length];
  }
  function truncateLabel(s, max) {
    max = max || 24;
    if (!s) return s;
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
  }
  function showBanner(message, level) {
    const el = $('#statusBanner');
    el.textContent = message;
    el.hidden = false;
    el.classList.toggle('is-warning', level === 'warning');
  }

  /* ---------------------------------------------------------------------
     DATA LOADING
     --------------------------------------------------------------------- */
  function parseCSV(path) {
    return new Promise((resolve, reject) => {
      Papa.parse(path, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (res) => {
          if (!res || !res.data || !res.data.length) {
            reject(new Error(path));
          } else {
            resolve(res.data);
          }
        },
        error: () => reject(new Error(path))
      });
    });
  }

  function loadDatasets() {
    const entries = Object.entries(DATA_FILES);
    return Promise.all(
      entries.map(([key, path]) =>
        parseCSV(path).then(
          (rows) => ({ key, rows }),
          () => ({ key, error: path })
        )
      )
    ).then((results) => {
      const data = {};
      const missing = [];
      results.forEach((r) => {
        if (r.error) missing.push(r.error);
        else data[r.key] = r.rows;
      });
      if (missing.length) {
        showBanner(
          'Could not load: ' + missing.join(', ') +
          '. Make sure all six CSV files are inside the /data folder and that this page is served over HTTP (not opened directly as a file).'
        );
        throw new Error('missing datasets: ' + missing.join(', '));
      }
      return data;
    });
  }

  /* ---------------------------------------------------------------------
     CHART.JS DEFAULTS  (Power BI–style chart chrome)
     --------------------------------------------------------------------- */
  function configureChartDefaults() {
    if (typeof Chart === 'undefined') return;
    Chart.register(window.ChartDataLabels);
    Chart.defaults.font.family = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.color = COLOR.textSecondary;
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.plugins.legend.labels.boxWidth = 10;
    Chart.defaults.plugins.legend.labels.font = { size: 11 };
    Chart.defaults.plugins.tooltip.backgroundColor = '#252423';
    Chart.defaults.plugins.tooltip.titleColor = '#FFFFFF';
    Chart.defaults.plugins.tooltip.bodyColor = '#FFFFFF';
    Chart.defaults.plugins.tooltip.padding = 9;
    Chart.defaults.plugins.tooltip.cornerRadius = 2;
    Chart.defaults.plugins.tooltip.displayColors = false;
    Chart.defaults.plugins.tooltip.titleFont = { size: 11, weight: '600' };
    Chart.defaults.plugins.tooltip.bodyFont = { size: 11 };
    Chart.defaults.plugins.datalabels.display = false;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.animation.duration = 280;
    Chart.defaults.elements.bar.borderRadius = 1;
  }

  function destroyChart(key) {
    if (STATE.charts[key]) {
      STATE.charts[key].destroy();
      delete STATE.charts[key];
    }
  }

  function createChart(key, ctx, config) {
    destroyChart(key);
    STATE.charts[key] = new Chart(ctx, config);
    return STATE.charts[key];
  }

  const GRID = { color: '#EDEBE9', drawTicks: false };

  /* =========================================================================
     PAGE 1 — EXECUTIVE OVERVIEW
     ========================================================================= */
  function computeFunnelTotals(rows) {
    const sum = (key) => rows.reduce((a, r) => a + (Number(r[key]) || 0), 0);
    const view = sum('view_item_users');
    const cart = sum('add_to_cart_users');
    const checkout = sum('checkout_users');
    const purchase = sum('purchase_users');
    return {
      view, cart, checkout, purchase,
      viewToCart: view ? (cart / view) * 100 : 0,
      cartToCheckout: cart ? (checkout / cart) * 100 : 0,
      checkoutToPurchase: checkout ? (purchase / checkout) * 100 : 0,
      overall: view ? (purchase / view) * 100 : 0
    };
  }

  function renderExecutiveOverview() {
    const totals = computeFunnelTotals(STATE.data.funnelGeneral);
    STATE.stats.overview = totals;

    $('#kpiViewers').textContent = formatNumber(totals.view);
    $('#kpiCart').textContent = formatNumber(totals.cart);
    $('#kpiCheckout').textContent = formatNumber(totals.checkout);
    $('#kpiPurchasers').textContent = formatNumber(totals.purchase);
    $('#kpiConversion').textContent = formatPercent(totals.overall);

    renderFunnel(totals);
    renderDropoffChart(totals);
    renderOverviewInsight(totals);
  }

  function renderFunnel(totals) {
    const stages = [
      { label: 'Product View', value: totals.view },
      { label: 'Add to Cart', value: totals.cart },
      { label: 'Checkout', value: totals.checkout },
      { label: 'Purchase', value: totals.purchase }
    ];
    const rates = [totals.viewToCart, totals.cartToCheckout, totals.checkoutToPurchase];
    const colors = ['#DCEEFF', '#8FC4FF', '#3AA0FF', '#0F62B0'];
    const max = stages[0].value || 1;

    const container = $('#funnelChart');
    container.innerHTML = '';

    stages.forEach((s, i) => {
      const topPct = (s.value / max) * 100;
      const bottomPct = i < stages.length - 1 ? (stages[i + 1].value / max) * 100 : topPct;
      const L1 = (100 - topPct) / 2, R1 = 100 - L1;
      const L2 = (100 - bottomPct) / 2, R2 = 100 - L2;

      const row = document.createElement('div');
      row.className = 'funnel-stage-wrap';

      const bar = document.createElement('div');
      bar.className = 'funnel-stage';
      bar.style.setProperty('--stage-color', colors[i]);
      bar.style.clipPath = `polygon(${L1}% 0%, ${R1}% 0%, ${R2}% 100%, ${L2}% 100%)`;

      const info = document.createElement('div');
      info.className = 'funnel-stage-info';
      info.innerHTML =
        `<span class="funnel-stage-name">${s.label}</span>` +
        `<span class="funnel-stage-value">${formatNumber(s.value)}</span>` +
        `<span class="funnel-stage-pct">${formatPercent(topPct)} of viewers</span>`;

      row.appendChild(bar);
      row.appendChild(info);
      container.appendChild(row);

      if (i < stages.length - 1) {
        const conn = document.createElement('div');
        conn.className = 'funnel-connector';
        conn.innerHTML = `<span class="arrow">↓</span>${formatPercent(rates[i])} converted to next stage`;
        container.appendChild(conn);
      }
    });
  }

  function renderDropoffChart(totals) {
    const ctx = $('#dropoffChart');
    const labels = ['View → Cart', 'Cart → Checkout', 'Checkout → Purchase'];
    const values = [100 - totals.viewToCart, 100 - totals.cartToCheckout, 100 - totals.checkoutToPurchase];

    createChart('dropoff', ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: COLOR.red,
          barThickness: 26,
          datalabels: {
            display: true,
            anchor: 'end',
            align: 'end',
            color: '#252423',
            font: { size: 11, weight: '600' },
            formatter: (v) => formatPercent(v)
          }
        }]
      },
      options: {
        indexAxis: 'y',
        layout: { padding: { right: 46 } },
        scales: {
          x: { min: 0, max: 100, grid: GRID, ticks: { callback: (v) => v + '%' } },
          y: { grid: { display: false } }
        },
        plugins: { tooltip: { callbacks: { label: (c) => formatPercent(c.parsed.x) } } }
      }
    });
  }

  function renderOverviewInsight(totals) {
    const drops = [
      { stage: 'Product View → Add to Cart', value: 100 - totals.viewToCart },
      { stage: 'Add to Cart → Checkout', value: 100 - totals.cartToCheckout },
      { stage: 'Checkout → Purchase', value: 100 - totals.checkoutToPurchase }
    ].sort((a, b) => b.value - a.value);

    STATE.stats.largestDrop = drops[0];

    $('#overviewInsight').innerHTML =
      `The largest drop-off occurs between <b>${drops[0].stage}</b> (${formatPercent(drops[0].value)}). ` +
      `A second relevant loss occurs between <b>${drops[1].stage}</b> (${formatPercent(drops[1].value)}), ` +
      `suggesting that both stages should be prioritized for further UX investigation.`;
  }

  /* =========================================================================
     PAGE 2 — ACQUISITION & DEVICES
     ========================================================================= */
  function renderDeviceAnalysis() {
    const rows = STATE.data.funnelDevice;
    const byName = {};
    rows.forEach((r) => { byName[r.device_category] = r; });

    if (byName.mobile) $('#kpiMobile').textContent = formatPercent(byName.mobile.overall_conversion_rate);
    if (byName.desktop) $('#kpiDesktop').textContent = formatPercent(byName.desktop.overall_conversion_rate);
    if (byName.tablet) $('#kpiTablet').textContent = formatPercent(byName.tablet.overall_conversion_rate);

    const sorted = [...rows].sort((a, b) => b.overall_conversion_rate - a.overall_conversion_rate);
    STATE.stats.deviceTop = sorted[0];

    renderDeviceConversionChart(rows);
    renderDeviceFunnelChart(rows);
    renderDeviceInsight(sorted);
    setupDeviceSlicer(rows);
  }

  function deviceColor(name) {
    if (name === 'mobile') return COLOR.blue;
    if (name === 'desktop') return COLOR.blueDark;
    if (name === 'tablet') return COLOR.purple;
    return COLOR.gray;
  }

  function renderDeviceConversionChart(rows, activeDevice) {
    const ctx = $('#deviceConversionChart');
    const list = activeDevice && activeDevice !== 'all' ? rows.filter((r) => r.device_category === activeDevice) : rows;

    createChart('deviceConversion', ctx, {
      type: 'bar',
      data: {
        labels: list.map((r) => cap(r.device_category)),
        datasets: [{
          data: list.map((r) => r.overall_conversion_rate),
          backgroundColor: list.map((r) => deviceColor(r.device_category)),
          maxBarThickness: 72,
          datalabels: {
            display: true, anchor: 'end', align: 'end',
            color: '#252423', font: { size: 11, weight: '600' },
            formatter: (v) => formatPercent(v)
          }
        }]
      },
      options: {
        layout: { padding: { top: 20 } },
        scales: {
          y: { beginAtZero: true, grid: GRID, ticks: { callback: (v) => v + '%' } },
          x: { grid: { display: false } }
        },
        plugins: { tooltip: { callbacks: { label: (c) => formatPercent(c.parsed.y) } } }
      }
    });
  }

  function renderDeviceFunnelChart(rows, activeDevice) {
    const ctx = $('#deviceFunnelChart');
    const list = activeDevice && activeDevice !== 'all' ? rows.filter((r) => r.device_category === activeDevice) : rows;
    const series = [
      { key: 'view_to_cart_rate', label: 'View → Cart', color: COLOR.blue },
      { key: 'cart_to_checkout_rate', label: 'Cart → Checkout', color: COLOR.orange },
      { key: 'checkout_to_purchase_rate', label: 'Checkout → Purchase', color: COLOR.teal }
    ];

    createChart('deviceFunnel', ctx, {
      type: 'bar',
      data: {
        labels: list.map((r) => cap(r.device_category)),
        datasets: series.map((s) => ({
          label: s.label,
          data: list.map((r) => r[s.key]),
          backgroundColor: s.color,
          maxBarThickness: 26
        }))
      },
      options: {
        scales: {
          y: { beginAtZero: true, grid: GRID, ticks: { callback: (v) => v + '%' } },
          x: { grid: { display: false } }
        },
        plugins: {
          legend: { display: true, position: 'top', align: 'end' },
          tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${formatPercent(c.parsed.y)}` } }
        }
      }
    });
  }

  function renderDeviceInsight(sorted) {
    const top = sorted[0], second = sorted[1];
    const diff = top.overall_conversion_rate - second.overall_conversion_rate;
    $('#deviceInsight').innerHTML =
      `${cap(top.device_category)} shows the highest observed conversion rate at <b>${formatPercent(top.overall_conversion_rate)}</b>, ` +
      `${diff < 0.15 ? 'closely followed by' : 'slightly above'} ${cap(second.device_category)} at ${formatPercent(second.overall_conversion_rate)}. ` +
      `The difference is descriptive and should not be interpreted as statistically significant without user-level funnel data.`;
  }

  function setupDeviceSlicer(rows) {
    const wrap = $('#deviceSlicer');
    $$('.slicer-item', wrap).forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.slicer-item', wrap).forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        STATE.filters.device = btn.dataset.device;
        renderDeviceConversionChart(rows, STATE.filters.device);
        renderDeviceFunnelChart(rows, STATE.filters.device);
      });
    });
  }

  /* ---- Traffic sources ---- */
  function getFilteredTraffic() {
    const rows = STATE.data.trafficSources;
    if (!STATE.filters.sources || STATE.filters.sources.size === 0) return rows;
    return rows.filter((r) => STATE.filters.sources.has(r.source_name));
  }

  function renderTrafficAnalysis() {
    const all = STATE.data.trafficSources;
    if (!STATE.filters.sources) {
      STATE.filters.sources = new Set(all.map((r) => r.source_name));
    }
    const volumeLeader = [...all].sort((a, b) => b.view_item_users - a.view_item_users)[0];
    STATE.stats.trafficVolumeLeader = volumeLeader;

    renderTrafficVolumeChart();
    renderTrafficConversionChart();
    renderTrafficInsight(all, volumeLeader);
    setupSourceSlicer(all);
  }

  function renderTrafficVolumeChart() {
    const rows = [...getFilteredTraffic()].sort((a, b) => b.view_item_users - a.view_item_users);
    const ctx = $('#trafficVolumeChart');
    createChart('trafficVolume', ctx, {
      type: 'bar',
      data: {
        labels: rows.map((r) => truncateLabel(r.source_name, 16)),
        datasets: [{
          data: rows.map((r) => r.view_item_users),
          backgroundColor: rows.map((r, i) => colorForSource(r.source_name, i)),
          maxBarThickness: 56,
          datalabels: {
            display: true, anchor: 'end', align: 'end',
            color: '#252423', font: { size: 10, weight: '600' },
            formatter: (v) => formatNumber(v)
          }
        }]
      },
      options: {
        layout: { padding: { top: 20 } },
        scales: {
          y: { beginAtZero: true, grid: GRID, ticks: { callback: (v) => formatNumber(v) } },
          x: { grid: { display: false } }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (items) => rows[items[0].dataIndex].source_name,
              label: (c) => `Product viewers: ${formatNumber(c.parsed.y)}`
            }
          }
        }
      }
    });
  }

  function renderTrafficConversionChart() {
    const rows = [...getFilteredTraffic()].sort((a, b) => b.overall_conversion_rate - a.overall_conversion_rate);
    const ctx = $('#trafficConversionChart');
    createChart('trafficConversion', ctx, {
      type: 'bar',
      data: {
        labels: rows.map((r) => truncateLabel(r.source_name, 20)),
        datasets: [{
          data: rows.map((r) => r.overall_conversion_rate),
          backgroundColor: rows.map((r, i) => colorForSource(r.source_name, i)),
          barThickness: 22,
          datalabels: {
            display: true, anchor: 'end', align: 'end',
            color: '#252423', font: { size: 10, weight: '600' },
            formatter: (v) => formatPercent(v)
          }
        }]
      },
      options: {
        indexAxis: 'y',
        layout: { padding: { right: 44 } },
        scales: {
          x: { beginAtZero: true, grid: GRID, ticks: { callback: (v) => v + '%' } },
          y: { grid: { display: false } }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (items) => rows[items[0].dataIndex].source_name,
              label: (c) => `Conversion rate: ${formatPercent(c.parsed.x)}`
            }
          }
        }
      }
    });
  }

  function renderTrafficInsight(all) {
    const known = all.filter((r) => !/data deleted/i.test(r.source_name));
    const volumeLeader = [...all].sort((a, b) => b.view_item_users - a.view_item_users)[0];
    const qualityLeaderKnown = [...known].sort((a, b) => b.overall_conversion_rate - a.overall_conversion_rate)[0];
    const globalQualityLeader = [...all].sort((a, b) => b.overall_conversion_rate - a.overall_conversion_rate)[0];

    let text =
      `<b>${volumeLeader.source_name}</b> generates the highest volume of product-interested users ` +
      `(${formatNumber(volumeLeader.view_item_users)}), while <b>${qualityLeaderKnown.source_name}</b> shows the strongest ` +
      `observed conversion rate among identifiable sources (${formatPercent(qualityLeaderKnown.overall_conversion_rate)}). ` +
      `This reflects a difference between <b>traffic volume</b> and <b>traffic quality</b> rather than one channel that leads on both.`;

    if (/data deleted/i.test(globalQualityLeader.source_name) && globalQualityLeader.source_name !== qualityLeaderKnown.source_name) {
      text += ` The <i>(data deleted)</i> record shows an even higher observed rate (${formatPercent(globalQualityLeader.overall_conversion_rate)}), ` +
        `but its origin cannot be identified, so it is treated as a source with unavailable details and excluded from channel-level recommendations.`;
    }
    $('#trafficInsight').innerHTML = text;
  }

  function setupSourceSlicer(all) {
    const wrap = $('#sourceSlicer');
    wrap.innerHTML = '';
    all.forEach((r, i) => {
      const btn = document.createElement('button');
      btn.className = 'slicer-item is-active';
      btn.textContent = r.source_name;
      btn.dataset.source = r.source_name;
      btn.addEventListener('click', () => {
        const name = r.source_name;
        if (STATE.filters.sources.has(name)) {
          if (STATE.filters.sources.size === 1) return; // keep at least one source selected
          STATE.filters.sources.delete(name);
          btn.classList.remove('is-active');
        } else {
          STATE.filters.sources.add(name);
          btn.classList.add('is-active');
        }
        renderTrafficVolumeChart();
        renderTrafficConversionChart();
      });
      wrap.appendChild(btn);
    });
  }

  /* =========================================================================
     PAGE 3 — PRODUCT ANALYSIS
     ========================================================================= */
  function getFilteredProducts() {
    const rows = STATE.data.productAnomalies;
    if (STATE.filters.buyers === 'zero') return rows.filter((r) => Number(r.buyers) === 0);
    if (STATE.filters.buyers === 'some') return rows.filter((r) => Number(r.buyers) > 0);
    return rows;
  }

  function renderProductAnalysis() {
    const all = STATE.data.productAnomalies;
    STATE.stats.flaggedCount = all.length;
    STATE.stats.zeroBuyerCount = all.filter((r) => Number(r.buyers) === 0).length;

    renderProductKPIs();
    renderHighInterestChart();
    renderScatterChart();
    renderRevenueChart();
    renderProductTable();
    renderProductInsight();
    setupBuyerSlicer();
  }

  function renderProductKPIs() {
    const rows = getFilteredProducts();
    $('#kpiFlagged').textContent = formatNumber(rows.length);
    $('#kpiZeroBuyer').textContent = formatNumber(rows.filter((r) => Number(r.buyers) === 0).length);
    const totalRevenue = rows.reduce((a, r) => a + (Number(r.revenue) || 0), 0);
    $('#kpiFlaggedRevenue').textContent = formatCurrency(totalRevenue);
    const avgConv = rows.length ? rows.reduce((a, r) => a + (Number(r.conversion_rate) || 0), 0) / rows.length : 0;
    $('#kpiAvgConversion').textContent = formatPercent(avgConv);
  }

  function renderHighInterestChart() {
    const rows = [...getFilteredProducts()].sort((a, b) => b.viewers - a.viewers).slice(0, 15).reverse();
    const ctx = $('#highInterestChart');
    createChart('highInterest', ctx, {
      type: 'bar',
      data: {
        labels: rows.map((r) => truncateLabel(r.item_name, 28)),
        datasets: [{
          data: rows.map((r) => r.viewers),
          backgroundColor: COLOR.blue,
          barThickness: 14
        }]
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true, grid: GRID, ticks: { callback: (v) => formatNumber(v) } },
          y: { grid: { display: false }, ticks: { font: { size: 10 } } }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (items) => rows[items[0].dataIndex].item_name,
              label: (c) => [
                `Viewers: ${formatNumber(rows[c.dataIndex].viewers)}`,
                `Conversion: ${formatPercent(rows[c.dataIndex].conversion_rate)}`
              ]
            }
          }
        }
      }
    });
  }

  function renderScatterChart() {
    const rows = getFilteredProducts();
    const maxViewers = Math.max(...rows.map((r) => r.viewers), 1);
    const ctx = $('#scatterChart');
    const points = rows.map((r) => ({
      x: r.view_to_cart_rate,
      y: r.conversion_rate,
      r: 4 + Math.sqrt(r.viewers / maxViewers) * 16,
      item: r
    }));

    createChart('scatter', ctx, {
      type: 'bubble',
      data: {
        datasets: [{
          data: points,
          backgroundColor: points.map((p) => (p.item.buyers === 0 ? 'rgba(214,69,80,0.55)' : 'rgba(17,141,255,0.45)')),
          borderColor: points.map((p) => (p.item.buyers === 0 ? COLOR.red : COLOR.blue)),
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          x: { title: { display: true, text: 'View → Cart rate (%)', font: { size: 11 } }, grid: GRID },
          y: { title: { display: true, text: 'Conversion rate (%)', font: { size: 11 } }, grid: GRID }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (items) => points[items[0].dataIndex].item.item_name,
              label: (c) => {
                const it = points[c.dataIndex].item;
                return [
                  `Avg price: $${Number(it.avg_price).toFixed(2)}`,
                  `Viewers: ${formatNumber(it.viewers)}`,
                  `Cart users: ${formatNumber(it.cart_users)}`,
                  `Buyers: ${formatNumber(it.buyers)}`,
                  `Revenue: ${formatCurrency(it.revenue)}`
                ];
              }
            }
          }
        }
      }
    });
  }

  function renderRevenueChart() {
    const rows = [...getFilteredProducts()].sort((a, b) => b.revenue - a.revenue).slice(0, 15).reverse();
    const ctx = $('#revenueChart');
    createChart('revenue', ctx, {
      type: 'bar',
      data: {
        labels: rows.map((r) => truncateLabel(r.item_name, 30)),
        datasets: [{
          data: rows.map((r) => r.revenue),
          backgroundColor: COLOR.green,
          barThickness: 14,
          datalabels: {
            display: true, anchor: 'end', align: 'end',
            color: '#252423', font: { size: 10, weight: '600' },
            formatter: (v) => formatCurrency(v)
          }
        }]
      },
      options: {
        indexAxis: 'y',
        layout: { padding: { right: 60 } },
        scales: {
          x: { beginAtZero: true, grid: GRID, ticks: { callback: (v) => formatCurrency(v) } },
          y: { grid: { display: false }, ticks: { font: { size: 10 } } }
        },
        plugins: { tooltip: { callbacks: { label: (c) => `Revenue: ${formatCurrency(c.parsed.x)}` } } }
      }
    });
  }

  function renderProductTable() {
    const tbody = $('#productTableBody');
    let rows = getFilteredProducts();
    const { key, dir } = STATE.filters.productSort;
    rows = [...rows].sort((a, b) => {
      const av = a[key], bv = b[key];
      if (typeof av === 'string') return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return dir === 'asc' ? av - bv : bv - av;
    });

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="table-loading">No products match the current filter.</td></tr>';
      return;
    }

    tbody.innerHTML = rows.map((r) => `
      <tr class="${Number(r.buyers) === 0 ? 'is-zero-buyer' : ''}">
        <td data-type="text">${r.item_name}</td>
        <td>${formatNumber(r.viewers)}</td>
        <td>${formatNumber(r.cart_users)}</td>
        <td>${formatNumber(r.buyers)}</td>
        <td>$${Number(r.avg_price).toFixed(2)}</td>
        <td>${formatCurrency(r.revenue)}</td>
        <td>${formatPercent(r.view_to_cart_rate)}</td>
        <td>${formatPercent(r.conversion_rate)}</td>
      </tr>
    `).join('');

    $$('#productTable thead th').forEach((th) => {
      th.classList.toggle('is-sorted', th.dataset.key === key);
      th.dataset.arrow = dir === 'asc' ? '▲' : '▼';
    });
  }

  function setupBuyerSlicer() {
    const wrap = $('#buyerSlicer');
    $$('.slicer-item', wrap).forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.slicer-item', wrap).forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        STATE.filters.buyers = btn.dataset.buyers;
        renderProductKPIs();
        renderHighInterestChart();
        renderScatterChart();
        renderRevenueChart();
        renderProductTable();
      });
    });

    $$('#productTable thead th').forEach((th) => {
      th.addEventListener('click', () => {
        const key = th.dataset.key;
        if (STATE.filters.productSort.key === key) {
          STATE.filters.productSort.dir = STATE.filters.productSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          STATE.filters.productSort = { key, dir: th.dataset.type === 'text' ? 'asc' : 'desc' };
        }
        renderProductTable();
      });
    });
  }

  function renderProductInsight() {
    const total = STATE.stats.flaggedCount;
    const zero = STATE.stats.zeroBuyerCount;
    const pct = total ? (zero / total) * 100 : 0;
    $('#productInsight').innerHTML =
      `<b>${formatNumber(zero)}</b> of the <b>${formatNumber(total)}</b> flagged products (${formatPercent(pct)}) recorded zero purchases ` +
      `despite meaningful product views and cart activity. Several other products generate substantial views and cart additions but very few ` +
      `recorded purchases. These patterns warrant further investigation into availability, variants, pricing, analytics instrumentation, or ` +
      `post-cart friction — this view does not attribute the cause to any single factor.`;
  }

  /* =========================================================================
     PAGE 4 — RETENTION & COHORTS
     ========================================================================= */
  function renderRetentionAndCohorts() {
    const rows = STATE.data.retentionDays;
    const byDay = {};
    rows.forEach((r) => { byDay[Number(r.days_since_first)] = r; });

    if (byDay[1]) $('#kpiD1').textContent = formatPercent(byDay[1].retention_rate);
    if (byDay[7]) $('#kpiD7').textContent = formatPercent(byDay[7].retention_rate);
    if (byDay[14]) $('#kpiD14').textContent = formatPercent(byDay[14].retention_rate);
    if (byDay[30]) $('#kpiD30').textContent = formatPercent(byDay[30].retention_rate);
    STATE.stats.d1 = byDay[1] ? byDay[1].retention_rate : 0;

    renderRetentionChart(rows);
    renderCohortMatrix();
    renderCohortInsight();
    renderKeyFindings();
  }

  function renderRetentionChart(rows) {
    const sorted = [...rows].sort((a, b) => a.days_since_first - b.days_since_first);
    const ctx = $('#retentionChart');
    createChart('retention', ctx, {
      type: 'line',
      data: {
        labels: sorted.map((r) => 'D' + r.days_since_first),
        datasets: [{
          data: sorted.map((r) => r.retention_rate),
          borderColor: COLOR.blue,
          backgroundColor: 'rgba(17,141,255,0.12)',
          fill: true,
          tension: 0.25,
          pointBackgroundColor: COLOR.blue,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          datalabels: {
            display: true, align: 'top', offset: 6,
            color: '#252423', font: { size: 10, weight: '600' },
            formatter: (v) => formatPercent(v)
          }
        }]
      },
      options: {
        layout: { padding: { top: 16 } },
        scales: {
          y: { beginAtZero: true, grid: GRID, ticks: { callback: (v) => v + '%' } },
          x: { grid: { display: false } }
        },
        plugins: { tooltip: { callbacks: { label: (c) => `Retention: ${formatPercent(c.parsed.y)}` } } }
      }
    });
  }

  function colorScale(value, min, max) {
    if (max === min) return 'rgba(17,141,255,0.18)';
    const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const c1 = [222, 238, 255], c2 = [15, 98, 176];
    const rgb = c1.map((c, i) => Math.round(c + (c2[i] - c) * t));
    return { bg: `rgb(${rgb.join(',')})`, textLight: t > 0.55 };
  }

  function renderCohortMatrix() {
    const rows = STATE.data.cohortRetention;
    const months = [...new Set(rows.map((r) => r.cohort_month))].sort();
    const maxMonthNumber = Math.max(...rows.map((r) => Number(r.month_number)));
    const cols = Array.from({ length: maxMonthNumber + 1 }, (_, i) => i);

    const nonBase = rows.filter((r) => Number(r.month_number) > 0);
    const vals = nonBase.map((r) => Number(r.retention_rate));
    const min = Math.min(...vals), max = Math.max(...vals);

    const get = (m, mn) => rows.find((r) => r.cohort_month === m && Number(r.month_number) === mn);

    let html = '<table class="matrix"><thead><tr><th>Cohort</th>';
    cols.forEach((c) => { html += `<th>M${c}</th>`; });
    html += '</tr></thead><tbody>';

    months.forEach((m) => {
      html += `<tr><th>${formatMonth(m)}</th>`;
      cols.forEach((c) => {
        const entry = get(m, c);
        if (!entry) {
          html += `<td class="is-empty">–</td>`;
        } else if (c === 0) {
          html += `<td class="is-base">${formatPercent(entry.retention_rate, 0)}</td>`;
        } else {
          const { bg, textLight } = colorScale(Number(entry.retention_rate), min, max);
          html += `<td style="background:${bg}; color:${textLight ? '#fff' : '#12233F'}">${formatPercent(entry.retention_rate)}</td>`;
        }
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    $('#cohortMatrix').innerHTML = html;
  }

  function renderCohortInsight() {
    const rows = STATE.data.cohortRetention;
    const months = [...new Set(rows.map((r) => r.cohort_month))].sort();
    const get = (m, mn) => rows.find((r) => r.cohort_month === m && Number(r.month_number) === mn);

    const first = months[0], second = months[1], last = months[months.length - 1];
    const firstM1 = get(first, 1), firstM2 = get(first, 2), secondM1 = second ? get(second, 1) : null;

    let text = '';
    if (firstM1) {
      text += `The ${formatMonth(first)} cohort retained <b>${formatPercent(firstM1.retention_rate)}</b> of users in the following month`;
      if (firstM2) text += ` and <b>${formatPercent(firstM2.retention_rate)}</b> two months later`;
      text += secondM1 ? `, while the ${formatMonth(second)} cohort retained <b>${formatPercent(secondM1.retention_rate)}</b> in M1.` : '.';
    }

    const lastHasM1 = !!get(last, 1);
    if (!lastHasM1) {
      text += ` ${formatMonth(last)} does not have an M1 value because the dataset ends in ${formatMonth(last)}. This absence should not be interpreted as 0% retention.`;
    }

    // best observed cohort retention (month_number > 0) for Key Findings
    const nonBase = rows.filter((r) => Number(r.month_number) > 0);
    const best = nonBase.reduce((a, r) => (Number(r.retention_rate) > Number(a.retention_rate) ? r : a), nonBase[0]);
    STATE.stats.bestCohort = best ? { month: best.cohort_month, monthNumber: best.month_number, rate: best.retention_rate } : null;

    $('#cohortInsight').innerHTML = text;
  }

  function renderKeyFindings() {
    const s = STATE.stats;
    const items = [];

    if (s.overview) {
      items.push(`Overall Product View → Purchase conversion is <b>${formatPercent(s.overview.overall)}</b> ` +
        `(${formatNumber(s.overview.purchase)} purchasers out of ${formatNumber(s.overview.view)} product viewers).`);
    }
    if (s.largestDrop) {
      items.push(`The largest funnel drop-off occurs between <b>${s.largestDrop.stage}</b> (${formatPercent(s.largestDrop.value)}).`);
    }
    if (s.deviceTop) {
      items.push(`<b>${cap(s.deviceTop.device_category)}</b> is the best-performing device, with an overall conversion rate of ${formatPercent(s.deviceTop.overall_conversion_rate)}.`);
    }
    if (s.trafficVolumeLeader) {
      items.push(`<b>${s.trafficVolumeLeader.source_name}</b> is the highest-volume traffic source, driving ${formatNumber(s.trafficVolumeLeader.view_item_users)} product viewers.`);
    }
    if (s.flaggedCount !== undefined) {
      items.push(`<b>${formatNumber(s.flaggedCount)}</b> products were flagged for combining high interest with unusually low conversion.`);
    }
    if (s.d1 !== undefined) {
      items.push(`D1 retention stands at <b>${formatPercent(s.d1)}</b> of first-time users returning the day after their first visit.`);
    }
    if (s.bestCohort) {
      items.push(`The strongest observed monthly cohort retention is <b>${formatPercent(s.bestCohort.rate)}</b>, recorded for the ${formatMonth(s.bestCohort.month)} cohort at M${s.bestCohort.monthNumber}.`);
    }

    $('#keyFindingsList').innerHTML = items.map((t) => `<li>${t}</li>`).join('');
  }

  /* =========================================================================
     PAGE NAVIGATION
     ========================================================================= */
  function setupPageNav() {
    $$('.page-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.target;
        $$('.page-tab').forEach((t) => t.classList.toggle('is-active', t === tab));
        $$('.report-page').forEach((p) => { p.hidden = p.dataset.page !== target; });
      });
    });
  }

  function setupResetFilters() {
    $('#resetFiltersBtn').addEventListener('click', () => {
      STATE.filters.device = 'all';
      STATE.filters.sources = new Set(STATE.data.trafficSources.map((r) => r.source_name));
      STATE.filters.buyers = 'all';
      STATE.filters.productSort = { key: 'viewers', dir: 'desc' };

      $$('#deviceSlicer .slicer-item').forEach((b) => b.classList.toggle('is-active', b.dataset.device === 'all'));
      $$('#sourceSlicer .slicer-item').forEach((b) => b.classList.add('is-active'));
      $$('#buyerSlicer .slicer-item').forEach((b) => b.classList.toggle('is-active', b.dataset.buyers === 'all'));

      renderDeviceConversionChart(STATE.data.funnelDevice, 'all');
      renderDeviceFunnelChart(STATE.data.funnelDevice, 'all');
      renderTrafficVolumeChart();
      renderTrafficConversionChart();
      renderProductKPIs();
      renderHighInterestChart();
      renderScatterChart();
      renderRevenueChart();
      renderProductTable();
    });
  }

  function setRefreshStamp() {
    const now = new Date();
    const opts = { year: 'numeric', month: 'short', day: 'numeric' };
    $('#refreshStamp').textContent = 'Last refresh: ' + now.toLocaleDateString('en-US', opts);
  }

  /* =========================================================================
     BOOT
     ========================================================================= */
  function renderAll() {
    renderExecutiveOverview();
    renderDeviceAnalysis();
    renderTrafficAnalysis();
    renderProductAnalysis();
    renderRetentionAndCohorts();
  }

  document.addEventListener('DOMContentLoaded', () => {
    configureChartDefaults();
    setupPageNav();
    setupResetFilters();
    setRefreshStamp();

    loadDatasets()
      .then((data) => {
        STATE.data = data;
        renderAll();
      })
      .catch((err) => {
        console.error(err);
      });
  });
})();
