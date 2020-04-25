document.addEventListener('DOMContentLoaded', () => {
  const encodeProgress = document.getElementById('encodeProgress');
  const saveButton = document.getElementById('saveCapture');
  const closeButton = document.getElementById('close');
  const review = document.getElementById('review');
  const status = document.getElementById('status');
  let format;
  let audioURL;
  let encoding = false;
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.type === "createTab") {
      format = request.format;
      let startID = request.startID;
      status.innerHTML = "Please wait..."
      closeButton.onclick = () => {
        chrome.runtime.sendMessage({cancelEncodeID: startID});
        chrome.tabs.getCurrent((tab) => {
          chrome.tabs.remove(tab.id);
        });
      }

      //if the encoding completed before the page has loaded
      if(request.audioURL) {
        encodeProgress.style.width = '100%';
        status.innerHTML = "File is ready!"
        generateSave(request.audioURL);
      } else {
        encoding = true;
      }
    }

    //when encoding completes
    if(request.type === "encodingComplete" && encoding) {
      encoding = false;
      status.innerHTML = "File is ready!";
      encodeProgress.style.width = '100%';
      generateSave(request.audioURL);
    }
    //updates encoding process bar upon messages
    if(request.type === "encodingProgress" && encoding) {
      encodeProgress.style.width = `${request.progress * 100}%`;
    }
    function generateSave(url) { //creates the save button
      const currentDate = new Date(Date.now()).toDateString();
      saveButton.onclick = () => {
        // chrome.downloads.download({url: url, filename: `${currentDate}.${format}`, saveAs: true});
        //convert Blob to file 
        // let blob = await fetch(url).then(r => r.blob());
        // var file = blobToFile(blob, "my-recording.wav");
        // function blobToFile(theBlob, fileName){
        //   //A Blob() is almost a File() - it's just missing the two properties below which we will add
        //   theBlob.lastModifiedDate = new Date();
        //   theBlob.name = fileName;
        //   return theBlob;
        //   }


        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
          if (this.status == 200) {
            var myBlob = this.response;
            // myBlob is now the blob that the object URL pointed to.
                var temp1 = "jsbvjh";
                var d = new Date();
  var n = d.getTime();  
            var name = `${n}.wav`;
              let formData = new FormData();
              formData.append("name", temp1);
              formData.append("class_audio", myBlob,name);
              fetch(' http://127.0.0.1:8000/image_collector/upload_audio/', {
                headers: {
                  'Accept': 'application/json'
                },
                mode : 'no-cors', 
                method: "POST",
                body: formData});
          }
        };
        xhr.send();
        
      };
      
      // http://127.0.0.1:8000/image_collector/upload_audio/
      saveButton.style.display = "inline-block";
    }
  });
  review.onclick = () => {
    chrome.tabs.create({url: "https://chrome.google.com/webstore/detail/chrome-audio-capture/kfokdmfpdnokpmpbjhjbcabgligoelgp/reviews"});
  }


})
