function displayVideo() {
    var div1= document.getElementById("summary-id");
    var div2=document.getElementById("video-id");
    if (div1.style.display=="block"){
       div1.style.display="none";
       div2.style.display="block";
    }
    else{
       div1.style.display="block";
       div2.style.display="none";
       var video = document.getElementById('myVideo');
       video.pause();
       video.currentTime = 0;
    }
   }
   function displayFigureVideo(){
       var div1= document.getElementById("figure-of-speech-id");
    var div2=document.getElementById("video-fos-id");
    if (div1.style.display=="block"){
       div1.style.display="none";
       div2.style.display="block";
    }
    else{
       div1.style.display="block";
       div2.style.display="none";
       var video = document.getElementById('myVideo1');
       video.pause();
       video.currentTime = 0;
    }
   }

   function displayVideo2() {
      var div1= document.getElementById("summary-id-2");
      var div2=document.getElementById("video-id-2");
      if (div1.style.display=="block"){
         div1.style.display="none";
         div2.style.display="block";
      }
      else{
         div1.style.display="block";
         div2.style.display="none";
         var video = document.getElementById('myVideo-2');
         video.pause();
         video.currentTime = 0;
      }
     }
     function displayFigureVideo2(){
         var div1= document.getElementById("figure-of-speech-id-2");
      var div2=document.getElementById("video-fos-id-2");
      if (div1.style.display=="block"){
         div1.style.display="none";
         div2.style.display="block";
      }
      else{
         div1.style.display="block";
         div2.style.display="none";
         var video = document.getElementById('myVideo1-2');
         video.pause();
         video.currentTime = 0;
      }
     }
     document.getElementById("chp1").addEventListener("click", function(event) {
      event.preventDefault(); // Prevent default behavior of anchor tag
      document.getElementById("chp1_title").style.display = "block";
      document.getElementById("chp2_title").style.display = "none";
      document.getElementById("chp3_title").style.display = "none";
      document.getElementById("grammar_title").style.display = "none";
      document.getElementById("composition_title").style.display = "none";
  });
  
  document.getElementById("chp2").addEventListener("click", function(event) {
      event.preventDefault(); // Prevent default behavior of anchor tag
      document.getElementById("chp1_title").style.display = "none";
      document.getElementById("chp2_title").style.display = "block";
      document.getElementById("chp3_title").style.display = "none";
      document.getElementById("grammar_title").style.display = "none";
      document.getElementById("composition_title").style.display = "none";
  });
  
  document.getElementById("chp3").addEventListener("click", function(event) {
      event.preventDefault(); // Prevent default behavior of anchor tag
      document.getElementById("chp1_title").style.display = "none";
      document.getElementById("chp2_title").style.display = "none";
      document.getElementById("chp3_title").style.display = "block";
      document.getElementById("grammar_title").style.display = "none";
      document.getElementById("composition_title").style.display = "none";
  });
  
  document.getElementById("grammar").addEventListener("click", function(event) {
      event.preventDefault(); // Prevent default behavior of anchor tag
      document.getElementById("chp1_title").style.display = "none";
      document.getElementById("chp2_title").style.display = "none";
      document.getElementById("chp3_title").style.display = "none";
      document.getElementById("grammar_title").style.display = "block";
      document.getElementById("composition_title").style.display = "none";
  });
  
  document.getElementById("composition").addEventListener("click", function(event) {
      event.preventDefault(); // Prevent default behavior of anchor tag
      document.getElementById("chp1_title").style.display = "none";
      document.getElementById("chp2_title").style.display = "none";
      document.getElementById("chp3_title").style.display = "none";
      document.getElementById("grammar_title").style.display = "none";
      document.getElementById("composition_title").style.display = "block";
  });
  document.getElementById("word-chain-form").addEventListener("click", function(event) {
   event.preventDefault(); // Prevent form submission

   // Collect all input values dynamically
   let inputs = [
       document.getElementById("input1").value.trim(),
       document.getElementById("input2").value.trim(),
       document.getElementById("input3").value.trim(),
       document.getElementById("input4").value.trim(),
       document.getElementById("input5").value.trim()
   ];

   // Loop through each input and check if the last letter matches the first letter of the next input
   for (let i = 0; i < inputs.length - 1; i++) {
       let currentWordLastChar = inputs[i].charAt(inputs[i].length - 1).toLowerCase();
       let nextWordFirstChar = inputs[i + 1].charAt(0).toLowerCase();

       // If the last letter of the current word doesn't match the first letter of the next word, display error
       if (currentWordLastChar !== nextWordFirstChar) {
           document.getElementById("result").style.background = "red";
           document.getElementById("result").style.value="Wrong!!";
           return;
       }
   }

   // If all inputs are valid, display success message
   document.getElementById("result").style.backgroundColor="#dff0d8";
   document.getElementById("result").style.value="Right!!";
});
