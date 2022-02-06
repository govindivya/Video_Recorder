const contraintObj = {
  audio: false,
  video: {
    facingMode: "user", // user mean front camera environment mean back camera
    // facingMode :{exact:"user"}
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
  },
};

if (navigator.mediaDevices === undefined) {
navigator.mediaDevices={}
navigator.mediaDevices.getUserMedia=(constraints)=>{
    let getUserMedia=navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if(!getUserMedia){
        return  Promise.reject(new Error("getUserMedia is not implemented in this browser"));
    }
    return new Promise(function(resolve,reject) {
        getUserMedia.call(navigator,contraintObj,resolve,reject);
    }) 
}
} 
else {
  navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
        devices.forEach(device=>{
            console.log(device.kind.toUpperCase(),device.label)
        })
    })
    .catch((e) => {
      console.log(e.message);
    });
}

navigator.mediaDevices
  .getUserMedia(contraintObj)
  .then((mediaStreamObj) => {
    let video = document.querySelector("video");
    // connecting mediastream to video element
    if ("srcObject" in video) {
      video.srcObject = mediaStreamObj;
    } else {
      // old version
      video.src = window.URL.createObjectURL(mediaStreamObj);
    }
    // start video when data coming from web camera
    video.onloadeddata = (ev) => {
      video.play();
    };

    let start = document.getElementById("btnStart");
    let stop = document.getElementById("btnStop");
    let vidSave = document.getElementById("vid2");
    let mediaRecorder = new MediaRecorder(mediaStreamObj);

    // store media chunk of video
    let chunks = [];

    start.addEventListener("click", (ev) => {
      mediaRecorder.start();
    });
    stop.addEventListener("click", (ev) => {
      mediaRecorder.stop();
    });
    mediaRecorder.ondataavailable = (ev) => {
      chunks.push(ev.data);
    };
    mediaRecorder.onstop = (ev) => {
      let blob = new Blob(chunks, { type: "video/mp4" });
      chunks = [];
      let videoUrl = window.URL.createObjectURL(blob);
      vidSave.src = videoUrl;
    };
  })
  .catch((e) => {
    console.log(e.name, e.message);
  });

// Errors might be one of followings
// NotAllowedError
// AbortError
// NotFoundError
// NotReadableError
// OverconstrainedError
// TypeError
