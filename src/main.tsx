import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GameStateProvider } from './GameStateContext.tsx';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json">
      <GameStateProvider>
        <App />
      </GameStateProvider>
    </TonConnectUIProvider>
  </StrictMode>,
)
