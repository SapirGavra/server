import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import BasicTable from './components/BasicTable';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <div className="App">
            <BasicTable/>
        </div>
    </React.StrictMode>
);


