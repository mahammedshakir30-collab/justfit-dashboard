// ApexCharts Configuration & Initialization Manager for telemetry
export function initCharts(state) {
  // 1. Weekly Steps Chart (Bar Chart)
  const stepsOptions = {
    series: [{
      name: 'Steps Logged',
      data: state.history.steps
    }],
    chart: {
      type: 'bar',
      height: 220,
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: ['#A1FA0A'], // Fit Green
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '55%',
        distributed: false,
        dataLabels: { position: 'top' }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val;
      },
      offsetY: -20,
      style: {
        fontSize: '10px',
        colors: ["#FEF9F5"] // Off-White text
      }
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.05)',
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    theme: { mode: 'dark' },
    xaxis: {
      categories: state.history.dates,
      labels: {
        style: { colors: '#FEF9F5', fontSize: '10px' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#FEF9F5', fontSize: '10px' },
        formatter: (val) => (val / 1000).toFixed(0) + 'k'
      }
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val) => val + " steps" }
    }
  };

  const stepsChartEl = document.getElementById('dash-weekly-chart');
  if (stepsChartEl) {
    stepsChartEl.innerHTML = '';
    const stepsChart = new window.ApexCharts(stepsChartEl, stepsOptions);
    stepsChart.render();
  }

  // 2. Health radial indicator gauge
  const healthScore = 84; // Fixed telemetry score
  const healthRadialOptions = {
    series: [healthScore],
    chart: {
      type: 'radialBar',
      height: 240,
      background: 'transparent'
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          size: '72%',
          background: 'transparent',
          dropShadow: { enabled: false }
        },
        track: {
          background: 'rgba(255, 255, 255, 0.05)',
          strokeWidth: '97%'
        },
        dataLabels: {
          name: {
            show: true,
            color: '#FEF9F5', // Off-White
            fontSize: '11px',
            offsetY: 65,
            fontWeight: 600
          },
          value: {
            offsetY: -5,
            color: '#A1FA0A', // Fit Green
            fontSize: '34px',
            fontWeight: 800,
            show: true,
            formatter: (val) => val + '%'
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        gradientToColors: ['#CFED89'], // Light Green
        stops: [0, 100]
      }
    },
    stroke: { lineCap: 'round' },
    labels: ['RECOVERY INDEX'],
    theme: { mode: 'dark' }
  };

  const healthRadialChartEl = document.getElementById('health-score-radial-chart');
  if (healthRadialChartEl) {
    healthRadialChartEl.innerHTML = '';
    const healthRadialChart = new window.ApexCharts(healthRadialChartEl, healthRadialOptions);
    healthRadialChart.render();
  }

  // 3. Macros Donut Chart (Nutrition View)
  const macrosData = state.daily.macros;
  const macrosDonutOptions = {
    series: [macrosData.proteinG, macrosData.carbsG, macrosData.fatG],
    chart: {
      type: 'donut',
      height: 240,
      background: 'transparent'
    },
    colors: ['#A1FA0A', '#CFED89', '#FEF9F5'], // Green, Light Green, White
    labels: ['Protein (g)', 'Carbohydrates (g)', 'Dietary Fat (g)'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: true, fontSize: '12px', color: '#FEF9F5' },
            value: {
              show: true,
              fontSize: '20px',
              color: '#A1FA0A', // Neon Green
              fontWeight: 700,
              formatter: (val) => val + 'g'
            },
            total: {
              show: true,
              label: 'Active Intake',
              color: '#FEF9F5',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0) + 'g';
              }
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 0 },
    theme: { mode: 'dark' }
  };

  const macrosChartEl = document.getElementById('nutrition-macros-chart');
  if (macrosChartEl) {
    macrosChartEl.innerHTML = '';
    const macrosChart = new window.ApexCharts(macrosChartEl, macrosDonutOptions);
    macrosChart.render();
  }

  // 4. Stacked sleep duration phases (Sleep View)
  const sleepPhasesOptions = {
    series: [
      { name: 'Deep Sleep', data: [1.5, 1.8, 2.1, 1.4, 1.6, 2.0, state.sleepPhases.deep] },
      { name: 'REM Sleep', data: [1.2, 1.4, 1.5, 1.1, 1.3, 1.6, state.sleepPhases.rem] },
      { name: 'Light Sleep', data: [4.5, 4.6, 4.5, 4.4, 4.6, 4.4, state.sleepPhases.light] }
    ],
    chart: {
      type: 'bar',
      height: 280,
      stacked: true,
      toolbar: { show: false },
      background: 'transparent'
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '40%', borderRadius: 4 }
    },
    colors: ['#A1FA0A', '#CFED89', '#FEF9F5'], // Match green-black theme
    xaxis: {
      categories: state.history.dates,
      labels: { style: { colors: '#FEF9F5', fontSize: '10px' } }
    },
    yaxis: {
      title: { text: 'Hours', style: { color: '#FEF9F5' } },
      labels: { style: { colors: '#FEF9F5' } }
    },
    grid: { borderColor: 'rgba(255,255,255,0.05)' },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      labels: { colors: '#FEF9F5' }
    },
    theme: { mode: 'dark' },
    tooltip: { y: { formatter: (val) => val + " hrs" } }
  };

  const sleepChartEl = document.getElementById('sleep-stacked-phases-chart');
  if (sleepChartEl) {
    sleepChartEl.innerHTML = '';
    const sleepChart = new window.ApexCharts(sleepChartEl, sleepPhasesOptions);
    sleepChart.render();
  }

  // 5. Real-time Heart Rate Area Chart (Heart View)
  const hrSeriesData = state.history.heartRateToday.map(d => d.bpm);
  const hrCategories = state.history.heartRateToday.map(d => d.time);

  const hrOptions = {
    series: [{
      name: 'Heart Rate',
      data: hrSeriesData
    }],
    chart: {
      type: 'area',
      height: 280,
      toolbar: { show: false },
      background: 'transparent',
      sparkline: { enabled: false }
    },
    colors: ['#ef4444'], // Keep red for heart rate telemetry
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories: hrCategories,
      labels: { style: { colors: '#FEF9F5', fontSize: '10px' } }
    },
    yaxis: {
      min: 50,
      max: 160,
      labels: { style: { colors: '#FEF9F5', fontSize: '10px' } }
    },
    grid: { borderColor: 'rgba(255,255,255,0.05)' },
    theme: { mode: 'dark' },
    tooltip: { y: { formatter: (val) => val + " BPM" } }
  };

  const hrChartEl = document.getElementById('heart-bpm-area-chart');
  if (hrChartEl) {
    hrChartEl.innerHTML = '';
    const hrChart = new window.ApexCharts(hrChartEl, hrOptions);
    hrChart.render();
  }

  // 6. Multi-Variable Comparison Chart (Analytics View)
  const comparisonOptions = {
    series: [
      { name: 'Steps Logged', type: 'column', data: state.history.steps },
      { name: 'Active Energy Burn (kcal)', type: 'line', data: state.history.caloriesBurned }
    ],
    chart: {
      height: 300,
      type: 'line',
      stacked: false,
      toolbar: { show: false },
      background: 'transparent'
    },
    stroke: { width: [0, 3], curve: 'smooth' },
    plotOptions: {
      bar: { columnWidth: '40%', borderRadius: 4 }
    },
    colors: ['#CFED89', '#A1FA0A'], // Light green columns, Neon green line
    fill: {
      opacity: [0.85, 1]
    },
    xaxis: {
      categories: state.history.dates,
      labels: { style: { colors: '#FEF9F5', fontSize: '10px' } }
    },
    yaxis: [
      {
        axisTicks: { show: true },
        axisBorder: { show: true, color: '#CFED89' },
        labels: { style: { colors: '#CFED89' } },
        title: { text: "Steps", style: { color: '#CFED89' } }
      },
      {
        opposite: true,
        axisTicks: { show: true },
        axisBorder: { show: true, color: '#A1FA0A' },
        labels: { style: { colors: '#A1FA0A' } },
        title: { text: "Calories (kcal)", style: { color: '#A1FA0A' } }
      }
    ],
    grid: { borderColor: 'rgba(255,255,255,0.05)' },
    legend: {
      labels: { colors: '#FEF9F5' }
    },
    theme: { mode: 'dark' }
  };

  const comparisonChartEl = document.getElementById('analytics-comparison-chart');
  if (comparisonChartEl) {
    comparisonChartEl.innerHTML = '';
    const comparisonChart = new window.ApexCharts(comparisonChartEl, comparisonOptions);
    comparisonChart.render();
  }
}
