# WeatherSense AI
Hackathon-ready web prototype for AI + IoT environmental intelligence.

## Included software demo
- Responsive command-center dashboard
- Simulated live IoT telemetry
- AI-style short-term prediction view
- Explainable prediction factors
- Environmental anomaly/risk scoring
- Alert center
- Hyperlocal sensor map
- Analytics/model-performance view
- IoT device fleet/status view
- Sensor-change simulation for live demo

## Run
Open `index.html` directly in a browser, or serve the folder with any static web server.

## Connect real IoT later
Replace the simulated `state` updates in `app.js` with REST/WebSocket/MQTT-backed telemetry from ESP32. The UI is deliberately separated from the data model so the demo can transition to real sensor data without redesigning the frontend.

## API backend
Install dependencies with `pip install -r requirements.txt`, then run:
`uvicorn server:app --reload`

Endpoints:
- `GET /api/health`
- `GET /api/telemetry`
- `POST /api/simulate`
- `GET /api/prediction`
- `GET /api/anomaly`
- `GET /api/risk`

The current UI keeps a local simulation mode for zero-setup judging. The API is ready to replace that simulation with ESP32/MQTT ingestion.
