import React from 'react';

export default function Clasificar() {

    return (
      <div className="d-grid gap-2">
        <div>
          <button type="button" className="btn btn-outline-info">
              Clasificar
          </button>
        </div>

        {/* <div id='contenedorVideo'>
          <h5> <span id='result'> .... </span></h5>
          <h5> <span id='estadoModelo'> Cargando Camara Web</span></h5>
          <video id="video" playsInline autoPlay style={{ display: 'none' }} width="450" height="450" ref={video}></video>
          <canvas id="canvas" width="450" height="450" ref={canvas1}></canvas>
        </div> */}
          
      </div> 
    );
  }


//   let video;
//   let featureExtractor;
  
// function setup () {
//   noCanvas()
//   video=createCapture{VIDEO};
//   video.parent("contenedorVideo");
//   featureExtractor=ml5.featureExtractor("MobileNet", modeloListo);
//   c }

