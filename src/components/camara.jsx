import React from "react";
import { useUserMedia } from "./useUSerMedia";

export default function Camara() {
  const { stream, error } = useUserMedia({ audio: true, video: true });
    
  return (
    <div>
      <h1>Hello GetUserMedia</h1>
      {error ? (
        <p>error</p>
      ) : (
        <video
          autoPlay
          ref={video => {
            if (video) {
              video.srcObject = stream;
            }
          }}
        />
      )}
    </div>
  );
}
