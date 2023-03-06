import React, { useRef, useEffect, useState } from 'react'
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import './Camara.css';

export default function Camara() {

    async function loadModel() {
        try {
            const modelo = await tf.loadLayersModel("http://localhost:5500/model.json");
            setModelo(modelo);
            console.log("set loaded Model");
        } catch (err) {
            console.log(err);
        }
    }

    const [modelo, setModelo] = useState();
    const [resultadon, setResultadon] = useState();


    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const otrocanvasRef = useRef(null);

    useEffect(() => {
        tf.ready().then(() => {
            loadModel();
        });

        const video = webcamRef.current;
        const canvas = canvasRef.current;
        const otrocanvas = otrocanvasRef.current;

        var ctx = canvas.getContext("2d");
        var currentStream = null;

        var opciones = {
            audio: false,
            video: {
                width: 224, height: 224
            }
        }

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(opciones)
                .then(function (stream) {
                    currentStream = stream;
                    video.srcObject = currentStream;
                    console.log(video);
                    procesarCamara(video.video, ctx);
                })
                .catch(function (err) {
                    alert("No se pudo utilizar la camara :(");
                    console.log(err);
                    alert(err);
                })
        } else {
            alert("No existe la funcion getUserMedia");
        }

    }, []);

    function procesarCamara(video_param, ctx) {
        console.log(ctx);
        ctx.drawImage(video_param, 0, 0, 544, 544, 0, 0, 224, 224);
    }

    function predecir(video, canvas_param, otrocanvas_param) {
        procesarCamara(video.video, canvas_param.getContext("2d"));
        if (modelo != null) {
            resample_single(canvas_param, 224, 224, otrocanvas_param);

            //Hacer la predicción
            var ctx2 = otrocanvas_param.getContext("2d");
            var imgData = ctx2.getImageData(0, 0, 224, 224);

            var arr = [];
            var arr100 = [];

            for (var p = 0; p < imgData.data.length; p += 4) {
                var rojo = imgData.data[p] / 255;
                var verde = imgData.data[p + 1] / 255;
                var azul = imgData.data[p + 2] / 255;

                arr100.push([rojo, verde, azul]);
                if (arr100.length === 224) {
                    arr.push(arr100);
                    arr100 = [];
                }
            }

            arr = [arr];

            var tensor = tf.tensor4d(arr);
            var resultado = modelo.predict(tensor).dataSync();

            console.log(resultado)

            var respuesta;
            if (resultado[0] >= .9) {
                respuesta = "VC";
            } else if (resultado[1] >= .9) {
                respuesta = "AP";
            } else if (resultado[2] >= .9) {
                respuesta = "AA";
            } else if (resultado[3] >= .9) {
                respuesta = "LR";
            } else {
                respuesta = "Nada";
            }

            var res_arr = [];
            var i = 0;

            for (i = 0; i < 4; i++) {
                res_arr[i] = (resultado[i]).toFixed(3);
            }
            res_arr[4] = respuesta;

            setResultadon(res_arr);
            console.log(resultadon);

        }
    }

    function resample_single(canvas, width, height, resize_canvas) {
        var width_source = canvas.width;
        var height_source = canvas.height;
        width = Math.round(width);
        height = Math.round(height);

        var ratio_w = width_source / width;
        var ratio_h = height_source / height;
        var ratio_w_half = Math.ceil(ratio_w / 2);
        var ratio_h_half = Math.ceil(ratio_h / 2);

        var ctx = canvas.getContext("2d");
        var ctx2 = resize_canvas.getContext("2d");
        var img = ctx.getImageData(0, 0, width_source, height_source);
        var img2 = ctx2.createImageData(width, height);
        var data = img.data;
        var data2 = img2.data;

        for (var j = 0; j < height; j++) {
            for (var i = 0; i < width; i++) {
                var x2 = (i + j * width) * 4;
                var weight = 0;
                var weights = 0;
                var weights_alpha = 0;
                var gx_r = 0;
                var gx_g = 0;
                var gx_b = 0;
                var gx_a = 0;
                var center_y = (j + 0.5) * ratio_h;
                var yy_start = Math.floor(j * ratio_h);
                var yy_stop = Math.ceil((j + 1) * ratio_h);
                for (var yy = yy_start; yy < yy_stop; yy++) {
                    var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
                    var center_x = (i + 0.5) * ratio_w;
                    var w0 = dy * dy; //pre-calc part of w
                    var xx_start = Math.floor(i * ratio_w);
                    var xx_stop = Math.ceil((i + 1) * ratio_w);
                    for (var xx = xx_start; xx < xx_stop; xx++) {
                        var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
                        var w = Math.sqrt(w0 + dx * dx);
                        if (w >= 1) {
                            //pixel too far
                            continue;
                        }
                        //hermite filter
                        weight = 2 * w * w * w - 3 * w * w + 1;
                        var pos_x = 4 * (xx + yy * width_source);
                        //alpha
                        gx_a += weight * data[pos_x + 3];
                        weights_alpha += weight;
                        //colors
                        if (data[pos_x + 3] < 255)
                            weight = weight * data[pos_x + 3] / 250;
                        gx_r += weight * data[pos_x];
                        gx_g += weight * data[pos_x + 1];
                        gx_b += weight * data[pos_x + 2];
                        weights += weight;
                    }
                }
                data2[x2] = gx_r / weights;
                data2[x2 + 1] = gx_g / weights;
                data2[x2 + 2] = gx_b / weights;
                data2[x2 + 3] = gx_a / weights_alpha;
            }
        }
        ctx2.putImageData(img2, 0, 0);
    }
    return (
        <div className='container-seb'>
            <div>
                <h3 className='display-10'>Camara Web</h3>
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    mirrored
                    style={{
                        width: 324, height: 324
                    }}
                />
            </div>
            <div>
                <h3 className='display-10'>Captura de la camara</h3>
                <div className='captura'>
                    <canvas className="close" ref={canvasRef} width="200" height="200"></canvas>
                    <canvas ref={otrocanvasRef} width="300" height="300"></canvas>
                </div>
                   
            </div>
            <div>
            {resultadon && <><h3 className={resultadon ? 'display-10' : "close"}>Resultados de la prediccion: {resultadon[4]}</h3>
                    <ul className='ul-style'>
                        <li>VC = {resultadon[0]}</li>
                        <li>AP = {resultadon[1]}</li>
                        <li>AA = {resultadon[2]}</li>
                        <li>LR = {resultadon[3]}</li>
                    </ul></>     
            }
            </div>
            <button onClick={() => predecir(webcamRef.current ,canvasRef.current, otrocanvasRef.current)}>
                Predecir
            </button>
        </div>
    )
}