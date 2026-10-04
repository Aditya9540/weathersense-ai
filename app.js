const API_BASE = '';

const state = {
  temp: 31.4,
  humidity: 62,
  pressure: 1008,
  rain: 0.8,
  aqi: 94,
  risk: 68,
  riskLevel: 'MODERATE',
  confidence: 87,
  rainProbability: 12,
  anomalyScore: 0,
  simulated: false,
  online: true
};

const pages = {
  dashboard: { title: 'Local Weather Command Center', render: dashboard },
  monitoring: { title: 'Live Sensor Monitoring', render: monitoring },
  prediction: { title: 'AI Prediction Engine', render: prediction },
  map: { title: 'Hyperlocal Weather Map', render: mapPage },
  alerts: { title: 'Alert & Risk Center', render: alerts },
  analytics: { title: 'Environmental Analytics', render: analytics },
  devices: { title: 'IoT Device Fleet', render: devices }
};


/* =========================
   API CONNECTION
========================= */

async function getTelemetry() {
  const response = await fetch(`${API_BASE}/api/telemetry`);

  if (!response.ok) {
    throw new Error('Telemetry API failed');
  }

  const data = await response.json();

  state.temp = Number(data.sensors.temperature);
  state.humidity = Number(data.sensors.humidity);
  state.pressure = Number(data.sensors.pressure);
  state.rain = Number(data.sensors.rainfall);
  state.aqi = Number(data.sensors.aqi);

  return data;
}


async function getPrediction() {
  const response = await fetch(`${API_BASE}/api/prediction`);

  if (!response.ok) {
    throw new Error('Prediction API failed');
  }

  const data = await response.json();

  state.confidence = data.confidence;
  state.rainProbability = data.rain_probability;

  return data;
}


async function getAnomaly() {
  const response = await fetch(`${API_BASE}/api/anomaly`);

  if (!response.ok) {
    throw new Error('Anomaly API failed');
  }

  const data = await response.json();

  state.anomalyScore = data.anomaly_score;

  return data;
}


async function getRisk() {
  const response = await fetch(`${API_BASE}/api/risk`);

  if (!response.ok) {
    throw new Error('Risk API failed');
  }

  const data = await response.json();

  state.risk = data.score;
  state.riskLevel = data.level;
  state.confidence = data.confidence;

  return data;
}


/* =========================
   REFRESH ALL BACKEND DATA
========================= */

async function refreshData() {
  try {
    // Step 1: Get the newest sensor readings
    await getTelemetry();

    // Step 2: Calculate prediction using newest readings
    await getPrediction();

    // Step 3: Detect anomalies using newest readings
    await getAnomaly();

    // Step 4: Calculate risk using newest prediction + anomaly
    await getRisk();

    state.online = true;

  } catch (error) {
    console.error('Backend connection error:', error);
    state.online = false;
  }
}


/* =========================
   COMMON UI
========================= */

function shell(inner) {

  return `
    <div class="grid metrics">

      <div class="card metric">
        <label>Temperature</label>
        <div class="value">${state.temp.toFixed(1)}°</div>
        <div class="trend">LIVE SENSOR DATA</div>
      </div>

      <div class="card metric">
        <label>Humidity</label>
        <div class="value">${state.humidity.toFixed(1)}%</div>
        <div class="unit">Relative humidity</div>
      </div>

      <div class="card metric">
        <label>Pressure</label>
        <div class="value">${state.pressure.toFixed(1)}</div>
        <div class="unit">hPa</div>
      </div>

      <div class="card metric">
        <label>Rainfall</label>
        <div class="value">${state.rain.toFixed(1)}</div>
        <div class="unit">mm / last hour</div>
      </div>

    </div>

    ${inner}
  `;
}


/* =========================
   DASHBOARD
========================= */

function dashboard() {

  const riskText =
    state.riskLevel === 'CRITICAL'
      ? 'Critical environmental conditions detected.'
      : state.riskLevel === 'HIGH'
      ? 'Elevated environmental risk detected.'
      : state.riskLevel === 'MODERATE'
      ? 'Environmental conditions require monitoring.'
      : 'Environmental conditions currently appear stable.';

  return shell(`

    <div class="grid row" style="margin-top:15px">

      <div class="card">

        <div class="cardTitle">
          <h2>Environmental trend</h2>
          <span class="muted">Live sensor data</span>
        </div>

        <div class="chart">

          ${[42,50,47,55,61,58,66,72,69,76,82,88]
            .map((x,i) => `
              <div class="bar" style="height:${x}%">
                <span>${Math.round(state.temp - 2 + i * 0.2)}°</span>
              </div>
            `).join('')}

        </div>

      </div>


      <div class="card">

        <div class="cardTitle">
          <h2>AI Risk Assessment</h2>
          <span class="pill">MODEL v1.4</span>
        </div>

        <div class="risk">

          <div class="riskCircle">
            <strong>${state.risk}</strong>
          </div>

          <div class="riskText">

            <b>${state.riskLevel} RISK</b>

            <p>${riskText}</p>

            <span class="muted">
              Model confidence: ${state.confidence}%
            </span>

          </div>

        </div>

      </div>

    </div>


    <div class="grid row" style="margin-top:15px">

      <div class="card">

        <div class="cardTitle">
          <h2>Next 6 hours</h2>
          <span class="muted">AI short-term forecast</span>
        </div>

        <div class="timeline">

          ${[
            ['NOW', state.temp, state.rainProbability],
            ['+1 HR', state.temp - 0.8, state.rainProbability],
            ['+2 HR', state.temp - 1.6, state.rainProbability],
            ['+3 HR', state.temp - 3, state.rainProbability],
            ['+6 HR', state.temp - 4.3, state.rainProbability]
          ].map(x => `
            <div class="forecast">
              <small>${x[0]}</small>
              <b>${Number(x[1]).toFixed(1)}°</b>
              <span class="rain">☂ ${x[2]}% rain</span>
            </div>
          `).join('')}

        </div>

      </div>


      <div class="card">

        <div class="cardTitle">
          <h2>Latest alerts</h2>
          <span class="muted">
            ${state.anomalyScore >= 50 ? '1 active' : 'Monitoring'}
          </span>
        </div>

        <div class="alert ${state.anomalyScore >= 50 ? 'warn' : 'good'}">

          <b>
            ${state.anomalyScore >= 50
              ? '⚠ Environmental anomaly detected'
              : '● Environment within expected range'}
          </b>

          <p>
            Anomaly score: ${state.anomalyScore}/100
          </p>

        </div>

        <div class="alert">

          <b>● Rain probability</b>

          <p>
            Current short-term probability:
            ${state.rainProbability}%
          </p>

        </div>

      </div>

    </div>

  `);
}


/* =========================
   LIVE MONITORING
========================= */

function monitoring() {

  return shell(`

    <div class="card" style="margin-top:15px">

      <div class="cardTitle">

        <h2>Live telemetry stream</h2>

        <span class="live">
          <span class="dot"></span>
          ${state.online ? 'receiving data' : 'connection error'}
        </span>

      </div>


      <table class="table">

        <thead>

          <tr>
            <th>Sensor</th>
            <th>Reading</th>
            <th>Status</th>
            <th>Source</th>
          </tr>

        </thead>


        <tbody>

          <tr>
            <td>DHT22</td>
            <td>Temperature <b>${state.temp.toFixed(1)} °C</b></td>
            <td class="status">● NORMAL</td>
            <td>FastAPI</td>
          </tr>

          <tr>
            <td>DHT22</td>
            <td>Humidity <b>${state.humidity.toFixed(1)} %</b></td>
            <td class="status">● NORMAL</td>
            <td>FastAPI</td>
          </tr>

          <tr>
            <td>BMP280</td>
            <td>Pressure <b>${state.pressure.toFixed(1)} hPa</b></td>
            <td class="status">● NORMAL</td>
            <td>FastAPI</td>
          </tr>

          <tr>
            <td>Rain Gauge</td>
            <td>Rainfall <b>${state.rain.toFixed(1)} mm</b></td>
            <td class="status">● NORMAL</td>
            <td>FastAPI</td>
          </tr>

          <tr>
            <td>Air Sensor</td>
            <td>AQI <b>${state.aqi.toFixed(0)}</b></td>
            <td class="status">● NORMAL</td>
            <td>FastAPI</td>
          </tr>

        </tbody>

      </table>

    </div>

  `);
}


/* =========================
   AI PREDICTION
========================= */

function prediction() {

  return `

    <div class="grid pageGrid">

      <div class="card">

        <div class="cardTitle">

          <h2>Short-term prediction</h2>

          <span class="pill">
            ${state.confidence}% confidence
          </span>

        </div>


        <div class="timeline">

          ${[
            ['NOW', state.temp],
            ['+1H', state.temp - 0.8],
            ['+2H', state.temp - 1.6],
            ['+3H', state.temp - 3],
            ['+6H', state.temp - 4.3]
          ].map(x => `

            <div class="forecast">

              <small>${x[0]}</small>

              <b>${Number(x[1]).toFixed(1)}°</b>

              <span class="rain">
                ☂ ${state.rainProbability}%
              </span>

            </div>

          `).join('')}

        </div>

      </div>


      <div class="card">

        <div class="cardTitle">
          <h2>Why this prediction?</h2>
        </div>

        <div class="alert good">

          <b>Humidity ↑</b>

          <p>
            Current humidity:
            ${state.humidity.toFixed(1)}%
          </p>

        </div>

        <div class="alert warn">

          <b>Pressure</b>

          <p>
            Current pressure:
            ${state.pressure.toFixed(1)} hPa
          </p>

        </div>

        <div class="alert">

          <b>Rain probability</b>

          <p>
            ${state.rainProbability}% short-term probability.
          </p>

        </div>

      </div>


      <div class="card">

        <div class="cardTitle">
          <h2>AI model pipeline</h2>
        </div>

        <p class="muted">

          IoT telemetry → feature engineering →
          forecast model → anomaly model →
          risk scoring → alert generation.

        </p>

        <div class="progress">
          <span style="width:${state.confidence}%"></span>
        </div>

        <p class="muted" style="margin-top:9px">

          Model confidence:
          ${state.confidence}%

        </p>

      </div>


      <div class="card">

        <div class="cardTitle">
          <h2>Prediction disclaimer</h2>
        </div>

        <p class="muted">

          This hackathon prototype produces localized
          short-term estimates from sensor telemetry.
          It is not a replacement for official
          meteorological warnings.

        </p>

      </div>

    </div>

  `;
}


/* =========================
   WEATHER MAP
========================= */

function mapPage() {

  return `

    <div class="card">

      <div class="cardTitle">

        <h2>Hyperlocal sensor network</h2>

        <span class="muted">
          3 active nodes
        </span>

      </div>

      <div class="map">

        <div class="pin one"></div>
        <div class="pin two red"></div>
        <div class="pin three"></div>

        <div class="legend">

          ● Normal &nbsp;

          <span style="color:#e85e68">●</span>
          Elevated risk

          <br>

          Node WS-001 •
          Node WS-002 •
          Node WS-003

        </div>

      </div>

    </div>

  `;
}


/* =========================
   ALERTS
========================= */

function alerts() {

  return `

    <div class="grid pageGrid">

      <div class="card">

        <div class="cardTitle">

          <h2>Active alerts</h2>

          <span class="pill">
            ${state.anomalyScore >= 50 ? '1 active' : '0 critical'}
          </span>

        </div>


        <div class="alert ${state.rainProbability >= 70 ? 'warn' : 'good'}">

          <b>
            ${state.rainProbability >= 70
              ? 'HIGH • Rain risk rising'
              : 'NORMAL • Rain risk monitored'}
          </b>

          <p>
            ${state.rainProbability}%
            short-term rain probability.
          </p>

        </div>


        <div class="alert">

          <b>
            ${state.anomalyScore >= 50
              ? 'MODERATE • Sensor anomaly'
              : 'NORMAL • Sensor pattern'}
          </b>

          <p>
            Anomaly score:
            ${state.anomalyScore}/100.
          </p>

        </div>


        <div class="alert">

          <b>Environmental status</b>

          <p>
            Risk level:
            ${state.riskLevel}
          </p>

        </div>

      </div>


      <div class="card">

        <div class="cardTitle">
          <h2>Risk score</h2>
        </div>

        <div class="kpi">
          ${state.risk}/100
        </div>

        <p class="muted">
          Risk combines forecast probability,
          sensor anomalies and environmental severity.
        </p>

        <div class="progress">

          <span style="width:${state.risk}%"></span>

        </div>

      </div>

    </div>

  `;
}


/* =========================
   ANALYTICS
========================= */

function analytics() {

  return `

    <div class="grid pageGrid">

      <div class="card">

        <div class="cardTitle">

          <h2>AI confidence</h2>

        </div>

        <div class="kpi">
          ${state.confidence}%
        </div>

        <p class="muted">
          Current backend model confidence.
        </p>


        <div class="chart">

          ${[68,73,75,79,77,84,state.confidence]
            .map(x => `
              <div class="bar" style="height:${x}%">
                <span>${x}%</span>
              </div>
            `).join('')}

        </div>

      </div>


      <div class="card">

        <div class="cardTitle">
          <h2>Environmental KPIs</h2>
        </div>

        <table class="table">

          <tbody>

            <tr>
              <td>Current temperature</td>
              <td>${state.temp.toFixed(1)} °C</td>
            </tr>

            <tr>
              <td>Current humidity</td>
              <td>${state.humidity.toFixed(1)}%</td>
            </tr>

            <tr>
              <td>Pressure</td>
              <td>${state.pressure.toFixed(1)} hPa</td>
            </tr>

            <tr>
              <td>AQI</td>
              <td>${state.aqi.toFixed(0)}</td>
            </tr>

            <tr>
              <td>Anomaly score</td>
              <td>${state.anomalyScore}/100</td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>

  `;
}


/* =========================
   DEVICES
========================= */

function devices() {

  return `

    <div class="grid pageGrid">

      ${[
        ['WS-001','Primary Weather Node','7/7 sensors','98%'],
        ['WS-002','North Monitoring Node','6/7 sensors','82%'],
        ['WS-003','East Monitoring Node','7/7 sensors','94%']
      ].map(d => `

        <div class="card">

          <div class="device">

            <div class="deviceLeft">

              <div class="deviceIcon">
                ▣
              </div>

              <div>

                <b>${d[0]}</b>

                <div class="muted">
                  ${d[1]}
                </div>

              </div>

            </div>

            <span class="status">
              ● ONLINE
            </span>

          </div>


          <div style="
            margin-top:17px;
            display:flex;
            justify-content:space-between;
            font-size:10px;
            color:#8196a9
          ">

            <span>${d[2]}</span>

            <span>
              Signal ${d[3]}
            </span>

          </div>


          <div class="progress">

            <span style="width:${parseInt(d[3])}%"></span>

          </div>

        </div>

      `).join('')}

    </div>

  `;
}


/* =========================
   RENDER
========================= */

function render(page = 'dashboard') {

  document.getElementById('pageTitle').textContent =
    pages[page].title;

  document.getElementById('content').innerHTML =
    pages[page].render();

  document.querySelectorAll('nav button').forEach(button => {

    button.classList.toggle(
      'active',
      button.dataset.page === page
    );

  });
}


/* =========================
   NAVIGATION
========================= */

document.getElementById('nav').onclick = e => {

  const button = e.target.closest('button');

  if (button) {

    render(button.dataset.page);

  }

};


/* =========================
   SIMULATE SENSOR CHANGE
========================= */

document.getElementById('simulateBtn').onclick = async () => {

  const button = document.getElementById('simulateBtn');

  button.disabled = true;
  button.textContent = '↻ Updating sensors...';

  try {

    await fetch(`${API_BASE}/api/simulate`, {
      method: 'POST'
    });

    await refreshData();

    button.textContent =
      '↶ Restore / Refresh Sensor Data';

    state.simulated = true;

    render(
      document.querySelector('nav button.active')?.dataset.page
      || 'dashboard'
    );

  } catch (error) {

    console.error(error);

    button.textContent =
      '⚠ Simulation failed';

  }

  button.disabled = false;

};


/* =========================
   INITIAL LOAD
========================= */

async function initialize() {

  await refreshData();

  render('dashboard');

}


/* =========================
   AUTO REFRESH
========================= */

initialize();


setInterval(async () => {

  await refreshData();

  const currentPage =
    document.querySelector('nav button.active')
      ?.dataset.page || 'dashboard';

  render(currentPage);

}, 5000);
