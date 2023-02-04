import React from 'react';
import Clasificar from './components/Clasificar';
import Camara from './components/camara';


function App() {
  return (
    <div className="app container">
      <div className="jumbotron">
        <h1 className="lead text-center">Sistema Web para la optimización de la poscosecha </h1>
          <br></br>
          <Camara />
         <Clasificar /> 
      </div>
    </div>
  );
}

export default App;
