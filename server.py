from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import random, math

app=FastAPI(title='WeatherSense AI API', version='1.0')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])

state={'temperature':31.4,'humidity':62.0,'pressure':1008.0,'rainfall':0.8,'aqi':94.0}

@app.get('/api/health')
def health(): return {'status':'online','timestamp':datetime.now(timezone.utc).isoformat(),'model':'v1.4'}

@app.get('/api/telemetry')
def telemetry():
    state['temperature'] += random.uniform(-.08,.08)
    state['humidity'] += random.uniform(-.35,.35)
    state['pressure'] += random.uniform(-.12,.12)
    state['rainfall'] = max(0,state['rainfall']+random.uniform(-.03,.04))
    return {'device_id':'WS-001','timestamp':datetime.now(timezone.utc).isoformat(),'sensors':state,'units':{'temperature':'C','humidity':'%','pressure':'hPa','rainfall':'mm','aqi':'AQI'}}

@app.post('/api/simulate')
def simulate():
    state.update({'temperature':35.1,'humidity':73.0,'pressure':1003.8,'rainfall':2.7,'aqi':101.0})
    return {'message':'anomaly scenario injected','telemetry':state}

@app.get('/api/prediction')
def prediction():
    h=state['humidity']; p=state['pressure']; t=state['temperature']
    rain=min(96,max(4, round((h-35)*1.25 + max(0,1012-p)*4)))
    risk=min(100,round(rain*.62 + max(0,65-h)*.05 + max(0,1012-p)*2))
    return {'confidence':87,'rain_probability':rain,'risk_score':risk,'temperature_forecast':[round(t,1),round(t-.8,1),round(t-1.6,1),round(t-3,1),round(t-4.3,1)],'factors':[{'name':'Humidity','direction':'up','impact':'positive'}, {'name':'Pressure','direction':'down','impact':'positive'}, {'name':'Historical pattern','direction':'similarity 81%','impact':'positive'}]}

@app.get('/api/anomaly')
def anomaly():
    score=round(min(99,max(3, abs(state['pressure']-1008)*8 + max(0,state['humidity']-68)*2.1)))
    return {'anomaly_score':score,'detected':score>=50,'severity':'HIGH' if score>=75 else 'MODERATE' if score>=50 else 'LOW'}

@app.get('/api/risk')
def risk():
    pred=prediction(); an=anomaly(); score=round(pred['risk_score']*.7+an['anomaly_score']*.3)
    return {'score':score,'level':'CRITICAL' if score>=80 else 'HIGH' if score>=60 else 'MODERATE' if score>=35 else 'LOW','confidence':87}
