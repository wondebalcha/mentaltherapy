import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { I18nextProvider} from 'react-i18next';
import i18next from 'i18next';
import global_oromo from "./translator/oromo/global.json"
import global_english from "./translator/english/global.json"
import global_amharic from "./translator/amharic/global.json"
import global_somalic from "./translator/somali/global.json"
import global_tigrigna from "./translator/tigrigna/global.json"

i18next
  .init({    
    interpolation: { escapeValue: false },
    lng: "english",
    resources: {
      english: {
        global: global_english,
      },
      oromo: {
        global: global_oromo,
      },
      amharic:{
        global: global_amharic,
      },
      sumalic:{
        global: global_somalic,
      },
      tigrigna:{
        global:global_tigrigna,
      },
    },
  });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <I18nextProvider i18n={i18next}>
      <BrowserRouter> 
        <App />
      </BrowserRouter>
    </I18nextProvider> 
);
