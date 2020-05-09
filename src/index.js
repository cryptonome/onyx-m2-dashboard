import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-less/semantic.less'
import './index.css';
import ReconnectingWebSocket from 'reconnecting-websocket'
import axios from 'axios'
import App from './App';
import * as serviceWorker from './serviceWorker'

// import categories from '../data/categories.json'
// import definitions from '../data/tesla_model_3_dbc.json'
import { M2Provider } from './services/m2'
import { SignalProvider } from './services/signal-manager';
import DBC from './services/dbc'

const secure = process.env.REACT_APP_M2_SECURE === 'true'
const hostname = process.env.REACT_APP_M2_HOSTNAME
const authorization = process.env.REACT_APP_M2_AUTHORIZATION

function initWebSocket() {
  const scheme = secure ? 'wss' : 'ws'
  const ws = new ReconnectingWebSocket(`${scheme}://${hostname}/dashboard?pin=${authorization}`, [], {
    maxReconnectionDelay: 1000
  })
  ws.binaryType = 'arraybuffer'
  return ws
}

async function initDBC(model) {
  const scheme = secure ? 'https' : 'http'
  const m2 = axios.create({
    baseURL: `${scheme}://${hostname}`,
    headers: {
      'Authorization': authorization
    }
  })
  const [categories, definitions] = await Promise.all([
    m2.get(`/dbc/${model}/categories.json`),
    m2.get(`/dbc/${model}/definitions.json`)
  ])
  return new DBC(categories.data, definitions.data)
}

async function init() {
  const ws = initWebSocket()
  const dbc = await initDBC('tm3')
  ReactDOM.render(
    <React.StrictMode>
      <M2Provider ws={ws} dbc={dbc}>
        <SignalProvider>
          <App />
        </SignalProvider>
      </M2Provider>
    </React.StrictMode>,
    document.getElementById('root')
  )
}

init()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()