// Video display functions
function displayVideo() {
  var div1 = document.getElementById("summary-id");
  var div2 = document.getElementById("video-id");
  if (div1.style.display == "block") {
      div1.style.display = "none";
      div2.style.display = "block";
  } else {
      div1.style.display = "block";
      div2.style.display = "none";
      var video = document.getElementById('myVideo');
      video.pause();
      video.currentTime = 0;
  }
}

function displayFigureVideo() {
  var div1 = document.getElementById("figure-of-speech-id");
  var div2 = document.getElementById("video-fos-id");
  if (div1.style.display == "block") {
      div1.style.display = "none";
      div2.style.display = "block";
  } else {
      div1.style.display = "block";
      div2.style.display = "none";
      var video = document.getElementById('myVideo1');
      video.pause();
      video.currentTime = 0;
  }
}

function displayVideo2() {
  var div1 = document.getElementById("summary-id-2");
  var div2 = document.getElementById("video-id-2");
  if (div1.style.display == "block") {
      div1.style.display = "none";
      div2.style.display = "block";
  } else {
      div1.style.display = "block";
      div2.style.display = "none";
      var video = document.getElementById('myVideo-2');
      video.pause();
      video.currentTime = 0;
  }
}

function displayFigureVideo2() {
  var div1 = document.getElementById("figure-of-speech-id-2");
  var div2 = document.getElementById("video-fos-id-2");
  if (div1.style.display == "block") {
      div1.style.display = "none";
      div2.style.display = "block";
  } else {
      div1.style.display = "block";
      div2.style.display = "none";
      var video = document.getElementById('myVideo1-2');
      video.pause();
      video.currentTime = 0;
  }
}

function displayVideo3() {
  var div1 = document.getElementById("summary-id3");
  var div2 = document.getElementById("video-id3");
  if (div1.style.display == "block") {
      div1.style.display = "none";
      div2.style.display = "block";
  } else {
      div1.style.display = "block";
      div2.style.display = "none";
      var video = document.getElementById('myVideo3');
      video.pause();
      video.currentTime = 0;
  }
}





// Chapter click handling
document.getElementById("chp1").addEventListener("click", function(event) {
  event.preventDefault();
  document.getElementById("chp1_title").style.display = "block";
  document.getElementById("chp2_title").style.display = "none";
  document.getElementById("chp3_title").style.display = "none";
  document.getElementById("grammar_title").style.display = "none";
  document.getElementById("composition_title").style.display = "none";
});

document.getElementById("chp2").addEventListener("click", function(event) {
  event.preventDefault();
  document.getElementById("chp1_title").style.display = "none";
  document.getElementById("chp2_title").style.display = "block";
  document.getElementById("chp3_title").style.display = "none";
  document.getElementById("grammar_title").style.display = "none";
  document.getElementById("composition_title").style.display = "none";
});

document.getElementById("chp3").addEventListener("click", function(event) {
  event.preventDefault();
  document.getElementById("chp1_title").style.display = "none";
  document.getElementById("chp2_title").style.display = "none";
  document.getElementById("chp3_title").style.display = "block";
  document.getElementById("grammar_title").style.display = "none";
  document.getElementById("composition_title").style.display = "none";
});

document.getElementById("grammar").addEventListener("click", function(event) {
  event.preventDefault();
  document.getElementById("chp1_title").style.display = "none";
  document.getElementById("chp2_title").style.display = "none";
  document.getElementById("chp3_title").style.display = "none";
  document.getElementById("grammar_title").style.display = "block";
  document.getElementById("composition_title").style.display = "none";
});

document.getElementById("composition").addEventListener("click", function(event) {
  event.preventDefault();
  document.getElementById("chp1_title").style.display = "none";
  document.getElementById("chp2_title").style.display = "none";
  document.getElementById("chp3_title").style.display = "none";
  document.getElementById("grammar_title").style.display = "none";
  document.getElementById("composition_title").style.display = "block";
});

// Word chain form validation
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

      if (currentWordLastChar !== nextWordFirstChar) {
          document.getElementById("result").style.background = "red";
          document.getElementById("result").value = "Wrong!!";
          return;
      }
  }

  document.getElementById("result").style.backgroundColor = "#dff0d8";
  document.getElementById("result").value = "Right!!";
});

// Speech synthesis for poem
let pressCount = 0;  // Track the number of "P" key presses
let isSpeaking = false;  // Track if speech synthesis is currently happening

function speakText() {
  if ('speechSynthesis' in window) {
      const title = "Where the Mind is Without Fear";
      const poet = "Rabindranath Tagore";
      const poem = document.getElementById('firstpoem').innerText;

      // Create the speech utterances
      const titleSpeech = new SpeechSynthesisUtterance("The title of the poem is " + title);
      titleSpeech.lang = 'en-US';
      titleSpeech.pitch = 1;
      titleSpeech.rate = 1;

      const poetSpeech = new SpeechSynthesisUtterance("This poem is written by " + poet);
      poetSpeech.lang = 'en-US';
      poetSpeech.pitch = 1;
      poetSpeech.rate = 1;

      const poemSpeech = new SpeechSynthesisUtterance(poem);
      poemSpeech.lang = 'en-US';
      poemSpeech.pitch = 1;
      poemSpeech.rate = 1;

      // Start speaking
      speechSynthesis.speak(titleSpeech);

      // When title speech ends, speak the poet's name
      titleSpeech.onend = function() {
          speechSynthesis.speak(poetSpeech);
      };

      // When poet speech ends, speak the poem content
      poetSpeech.onend = function() {
          speechSynthesis.speak(poemSpeech);
          isSpeaking = false;  // Reset speaking state when done
      };

      isSpeaking = true;  // Set state to indicate speech is ongoing
  } else {
      alert("Sorry, your browser doesn't support speech synthesis.");
  }
}

document.addEventListener('keydown', function(event) {
  // Check if the "P" key is pressed and if speech synthesis is not currently happening
  if (event.key.toLowerCase() === 'p' && !isSpeaking) {
      pressCount++;

      if (pressCount === 3) {  // Trigger after 3 consecutive presses
          speakText();
          pressCount = 0;  // Reset the press count after triggering
      }
  }
});


let fPressCount = 0;  // Counter to track "F" key presses
let isSummarySpeaking = false;  // To track if speech synthesis for summary is currently active

// Function to speak the summary
function speakSummary() {
  if ('speechSynthesis' in window) {
      const summaryText = document.getElementById('summary-id').innerText;

      // Create speech for introduction "Now let's summarize the poem"
      const introSpeech = new SpeechSynthesisUtterance("Now let's summarize the poem.");
      introSpeech.lang = 'en-US';
      introSpeech.pitch = 1;
      introSpeech.rate = 1;

      // Create speech for the actual summary
      const summarySpeech = new SpeechSynthesisUtterance(summaryText);
      summarySpeech.lang = 'en-US';
      summarySpeech.pitch = 1;
      summarySpeech.rate = 1;

      // Speak the introduction first
      speechSynthesis.speak(introSpeech);

      // Once the introduction finishes, speak the summary
      introSpeech.onend = function() {
          speechSynthesis.speak(summarySpeech);
          summarySpeech.onend = function() {
              isSummarySpeaking = false;  // Reset speaking state after summary finishes
          };
      };

      isSummarySpeaking = true;  // Set state to indicate speech is ongoing
  } else {
      alert("Sorry, your browser doesn't support speech synthesis.");
  }
}

// Event listener to detect when "F" key is pressed three times
document.addEventListener('keydown', function(event) {
  if (event.key.toLowerCase() === 's' && !isSummarySpeaking) {
      fPressCount++;

      if (fPressCount === 3) {  // Trigger speech synthesis after 3 presses
          speakSummary();
          fPressCount = 0;  // Reset the press count after starting speech
      }
  }
});

let sPressCount = 0;  // Counter to track "F" key presses
let isFigureSpeechSpeaking = false;  // To track if speech synthesis for figures of speech is currently active

// Function to speak the figures of speech
function speakFigureOfSpeech() {
  if ('speechSynthesis' in window) {
      const figureSpeechText = document.getElementById('figure-of-speech-id').innerText;

      // Create speech for introduction "Let's move ahead with figures of speech"
      const introSpeech = new SpeechSynthesisUtterance("Let's move ahead with figures of speech.");
      introSpeech.lang = 'en-US';
      introSpeech.pitch = 1;
      introSpeech.rate = 1;

      // Create speech for the actual figures of speech content
      const figureSpeech = new SpeechSynthesisUtterance(figureSpeechText);
      figureSpeech.lang = 'en-US';
      figureSpeech.pitch = 1;
      figureSpeech.rate = 1;

      // Speak the introduction first
      speechSynthesis.speak(introSpeech);

      // Once the introduction finishes, speak the figures of speech
      introSpeech.onend = function() {
          speechSynthesis.speak(figureSpeech);
          figureSpeech.onend = function() {
              isFigureSpeechSpeaking = false;  // Reset speaking state after figures of speech finish
          };
      };

      isFigureSpeechSpeaking = true;  // Set state to indicate speech is ongoing
  } else {
      alert("Sorry, your browser doesn't support speech synthesis.");
  }
}

// Event listener to detect when "F" key is pressed three times
document.addEventListener('keydown', function(event) {
  if (event.key.toLowerCase() === 'f' && !isFigureSpeechSpeaking) {
      sPressCount++;

      if (sPressCount === 3) {  // Trigger speech synthesis after 3 presses
          speakFigureOfSpeech();
          sPressCount = 0;  // Reset the press count after starting speech
      }
  }
});

let mPressCount = 0;  // Initialize the press count for the "M" key
let isMeaningSpeechSpeaking = false;  // Track if speech synthesis for meanings is active

// Function to speak the meanings
function speakMeanings() {
  if ('speechSynthesis' in window) {
      const meaningsText = document.getElementById('meanings').innerText;

      // Create speech for introduction "Let's go through the meanings"
      const introSpeech = new SpeechSynthesisUtterance("Let's go through the meanings of the difficult words");
      introSpeech.lang = 'en-US';
      introSpeech.pitch = 1;
      introSpeech.rate = 1;

      // Create speech for the actual meanings content
      const meaningSpeech = new SpeechSynthesisUtterance(meaningsText);
      meaningSpeech.lang = 'en-US';
      meaningSpeech.pitch = 1;
      meaningSpeech.rate = 1;

      const conclusionSpeech = new SpeechSynthesisUtterance("That's all with the meanings.");
      conclusionSpeech.lang = 'en-US';
      conclusionSpeech.pitch = 1;
      conclusionSpeech.rate = 1;

      // Speak the introduction first
      speechSynthesis.speak(introSpeech);

      // Once the introduction finishes, speak the meanings
      introSpeech.onend = function() {
          speechSynthesis.speak(meaningSpeech);
          meaningSpeech.onend = function() {
              isMeaningSpeechSpeaking = false;  // Reset speaking state after meanings finish
          };
      };

      meaningSpeech.onend = function() {
        setTimeout(() => {
            speechSynthesis.speak(conclusionSpeech);
            conclusionSpeech.onend = function() {
                isMeaningSpeechSpeaking = false;  // Reset speaking state after the conclusion
            };
        }, 500);  // Add a half-second pause before the conclusion
    };

      isMeaningSpeechSpeaking = true;  // Set state to indicate speech is ongoing
  } else {
      alert("Sorry, your browser doesn't support speech synthesis.");
  }
}

// Event listener to detect when "M" key is pressed three times
document.addEventListener('keydown', function(event) {
  if (event.key.toLowerCase() === 'm' && !isMeaningSpeechSpeaking) {
      mPressCount++;

      if (mPressCount === 3) {  // Trigger speech synthesis after 3 presses
          speakMeanings();
          mPressCount = 0;  // Reset the press count after starting speech
      }
  }
});




// Function to speak the content of the element with ID "poem2"
let pPressed = false;  // Track if "P" key was pressed first
let isPoem2SpeechSpeaking = false;  // Track if speech synthesis for poem2 is active

// Function to speak the poem title, author, and content of the element with ID "poem2"
function speakPoem2() {
    if ('speechSynthesis' in window) {
        const poemText = document.getElementById('poem2').innerText;

        // First speech: Introduce the title and author
        const titleSpeech = new SpeechSynthesisUtterance("The title of the poem is 'All the world's a stage'. This poem is written by William Shakespeare.");
        titleSpeech.lang = 'en-US';
        titleSpeech.pitch = 1;
        titleSpeech.rate = 1;

        // Second speech: Introduction to poem reading
        const introSpeech = new SpeechSynthesisUtterance("Now let's read the poem.");
        introSpeech.lang = 'en-US';
        introSpeech.pitch = 1;
        introSpeech.rate = 1;

        // Third speech: The actual poem content
        const poemSpeech = new SpeechSynthesisUtterance(poemText);
        poemSpeech.lang = 'en-US';
        poemSpeech.pitch = 1;
        poemSpeech.rate = 1;

        // Speak the title and author first
        speechSynthesis.speak(titleSpeech);

        // Once the title and author finish, introduce the poem
        titleSpeech.onend = function() {
            speechSynthesis.speak(introSpeech);

            // Once the introduction finishes, read the actual poem content
            introSpeech.onend = function() {
                speechSynthesis.speak(poemSpeech);
                poemSpeech.onend = function() {
                    isPoem2SpeechSpeaking = false;  // Reset speaking state after poem finishes
                };
            };
        };

        isPoem2SpeechSpeaking = true;  // Set state to indicate speech is ongoing
    } else {
        alert("Sorry, your browser doesn't support speech synthesis.");
    }
}

// Event listener to detect when "P" and "2" keys are pressed in sequence
document.addEventListener('keydown', function(event) {
    if (event.key.toLowerCase() === 'p' && !isPoem2SpeechSpeaking) {
        pPressed = true;  // "P" key was pressed first
    } else if (event.key === '2' && pPressed && !isPoem2SpeechSpeaking) {
        speakPoem2();  // Trigger speech synthesis when "2" is pressed after "P"
        pPressed = false;  // Reset the "P" press after the sequence is complete
    } else {
        pPressed = false;  // Reset if keys are pressed out of sequence
    }
});

let sPressed = false;  // Track if "S" key was pressed first
let isSummary2SpeechSpeaking = false;  // Track if speech synthesis for summary-id-2 is active

// Function to speak the content of the element with ID "summary-id-2"
function speakSummary2() {
    if ('speechSynthesis' in window) {
        const summaryText = document.getElementById('summary-id-2').innerText;

        // First speech: Introduction to the summary
        const introSpeech = new SpeechSynthesisUtterance("Now let's go through the summary.");
        introSpeech.lang = 'en-US';
        introSpeech.pitch = 1;
        introSpeech.rate = 1;

        // Second speech: The actual summary content
        const summarySpeech = new SpeechSynthesisUtterance(summaryText);
        summarySpeech.lang = 'en-US';
        summarySpeech.pitch = 1;
        summarySpeech.rate = 1;

        // Speak the introduction first
        speechSynthesis.speak(introSpeech);

        // Once the introduction finishes, read the actual summary content
        introSpeech.onend = function() {
            speechSynthesis.speak(summarySpeech);
            summarySpeech.onend = function() {
                isSummary2SpeechSpeaking = false;  // Reset speaking state after summary finishes
            };
        };

        isSummary2SpeechSpeaking = true;  // Set state to indicate speech is ongoing
    } else {
        alert("Sorry, your browser doesn't support speech synthesis.");
    }
}



// Event listener to detect when "S" and "2" keys are pressed in sequence
document.addEventListener('keydown', function(event) {
    if (event.key.toLowerCase() === 's' && !isSummary2SpeechSpeaking) {
        sPressed = true;  // "S" key was pressed first
    } else if (event.key === '2' && sPressed && !isSummary2SpeechSpeaking) {
        speakSummary2();  // Trigger speech synthesis when "2" is pressed after "S"
        sPressed = false;  // Reset the "S" press after the sequence is complete
    } else {
        sPressed = false;  // Reset if keys are pressed out of sequence
    }
});

let fPressed = false;  // Track if "F" key was pressed first
let isFigureOfSpeech2Speaking = false;  // Track if speech synthesis for figure-of-speech-id-2 is active

// Function to speak the content of the element with ID "figure-of-speech-id-2"
function speakFigureOfSpeech2() {
    if ('speechSynthesis' in window) {
        const figureSpeechText = document.getElementById('figure-of-speech-id-2').innerText;

        // First speech: Introduction to figures of speech
        const introSpeech = new SpeechSynthesisUtterance("Let's move ahead with the figures of speech.");
        introSpeech.lang = 'en-US';
        introSpeech.pitch = 1;
        introSpeech.rate = 1;

        // Second speech: The actual figures of speech content
        const figureSpeech = new SpeechSynthesisUtterance(figureSpeechText);
        figureSpeech.lang = 'en-US';
        figureSpeech.pitch = 1;
        figureSpeech.rate = 1;

        // Speak the introduction first
        speechSynthesis.speak(introSpeech);

        // Once the introduction finishes, read the actual figures of speech content
        introSpeech.onend = function() {
            speechSynthesis.speak(figureSpeech);
            figureSpeech.onend = function() {
                isFigureOfSpeech2Speaking = false;  // Reset speaking state after figures of speech finish
            };
        };

        isFigureOfSpeech2Speaking = true;  // Set state to indicate speech is ongoing
    } else {
        alert("Sorry, your browser doesn't support speech synthesis.");
    }
}

// Event listener to detect when "F" and "2" keys are pressed in sequence
document.addEventListener('keydown', function(event) {
    if (event.key.toLowerCase() === 'f' && !isFigureOfSpeech2Speaking) {
        fPressed = true;  // "F" key was pressed first
    } else if (event.key === '2' && fPressed && !isFigureOfSpeech2Speaking) {
        speakFigureOfSpeech2();  // Trigger speech synthesis when "2" is pressed after "F"
        fPressed = false;  // Reset the "F" press after the sequence is complete
    } else {
        fPressed = false;  // Reset if keys are pressed out of sequence
    }
});

let mPressed = false;  // Track if "M" key was pressed first
let isMeanings2Speaking = false;  // Track if speech synthesis for meanings2 is active

// Function to speak the meanings content from the element with ID "meanings2"
function speakMeanings2() {
    if ('speechSynthesis' in window) {
        const meaningsText = document.getElementById('meanings2').innerText;

        // Create speech for introduction "Let's go through the meanings."
        const introSpeech = new SpeechSynthesisUtterance("Let's go through the meanings.");
        introSpeech.lang = 'en-US';
        introSpeech.pitch = 1;
        introSpeech.rate = 1;

        // Create speech for the actual meanings content
        const meaningSpeech = new SpeechSynthesisUtterance(meaningsText);
        meaningSpeech.lang = 'en-US';
        meaningSpeech.pitch = 1;
        meaningSpeech.rate = 1;

        // Speak the introduction first
        speechSynthesis.speak(introSpeech);

        // Once the introduction finishes, speak the meanings content
        introSpeech.onend = function() {
            speechSynthesis.speak(meaningSpeech);
            meaningSpeech.onend = function() {
                isMeanings2Speaking = false;  // Reset speaking state after meanings finish
                // After a short pause, say "That's all with the meanings."
                const endSpeech = new SpeechSynthesisUtterance("That's all with the meanings.");
                speechSynthesis.speak(endSpeech);
            };
        };

        isMeanings2Speaking = true;  // Set state to indicate speech is ongoing
    } else {
        alert("Sorry, your browser doesn't support speech synthesis.");
    }
}

// Event listener to detect when "M" and "2" keys are pressed in sequence
document.addEventListener('keydown', function(event) {
    if (event.key.toLowerCase() === 'm' && !isMeanings2Speaking) {
        mPressed = true;  // "M" key was pressed first
    } else if (event.key === '2' && mPressed && !isMeanings2Speaking) {
        speakMeanings2();  // Trigger speech synthesis when "2" is pressed after "M"
        mPressed = false;  // Reset the "M" press after the sequence is complete
    } else {
        mPressed = false;  // Reset if keys are pressed out of sequence
    }
});


let sKeyPressed = false;  // Track if "S" key was pressed first
let isSumarySpeaking = false;  // Track if speech synthesis for summary is active

// Function to speak the content of the element with ID "summary-id3"
function speakSummary() {
    if ('speechSynthesis' in window) {
        const summaryText = document.getElementById('summary-id3').innerText;

        // Create speech for introduction
        const introSpeech = new SpeechSynthesisUtterance("Here is the summary.");
        introSpeech.lang = 'en-US';
        introSpeech.pitch = 1;
        introSpeech.rate = 1;

        // Create speech for the actual summary content
        const summarySpeech = new SpeechSynthesisUtterance(summaryText);
        summarySpeech.lang = 'en-US';
        summarySpeech.pitch = 1;
        summarySpeech.rate = 1;

        // Speak the introduction first
        speechSynthesis.speak(introSpeech);

        // Once the introduction finishes, read the actual summary content
        introSpeech.onend = function() {
            speechSynthesis.speak(summarySpeech);
            summarySpeech.onend = function() {
                isSumarySpeaking = false;  // Reset speaking state after summary finishes
            };
        };

        isSumarySpeaking = true;  // Set state to indicate speech is ongoing
    } else {
        alert("Sorry, your browser doesn't support speech synthesis.");
    }
}

// Event listener to detect when "S" and "4" keys are pressed in sequence
document.addEventListener('keydown', function(event) {
    if (event.key.toLowerCase() === 's' && !isSumarySpeaking) {
        sKeyPressed = true;  // "S" key was pressed first
    } else if (event.key === '4' && sKeyPressed && !isSumarySpeaking) {
        speakSummary();  // Trigger speech synthesis when "4" is pressed after "S"
        sKeyPressed = false;  // Reset the "S" press after the sequence is complete
    } else {
        sKeyPressed = false;  // Reset if keys are pressed out of sequence
    }
});

let mKeyPressedMeaning3 = false;  // Track if "M" key was pressed first for Meaning3
let isMeanings3Speaking = false;   // Track if speech synthesis for Meaning3 is active

// Function to speak the content of the element with ID "Meaning3"
function speakMeanings3() {
    if ('speechSynthesis' in window) {
        const meanings3Text = document.getElementById('Meaning3').innerText;

        // Create speech for introduction
        const introSpeech = new SpeechSynthesisUtterance("Let's go through the meanings for the difficult words.");
        introSpeech.lang = 'en-US';
        introSpeech.pitch = 1;
        introSpeech.rate = 1;

        // Create speech for the actual meanings content
        const meaning3Speech = new SpeechSynthesisUtterance(meanings3Text);
        meaning3Speech.lang = 'en-US';
        meaning3Speech.pitch = 1;
        meaning3Speech.rate = 1;

        // Speak the introduction first
        speechSynthesis.speak(introSpeech);

        // Once the introduction finishes, read the actual meanings content
        introSpeech.onend = function() {
            speechSynthesis.speak(meaning3Speech);
            meaning3Speech.onend = function() {
                isMeanings3Speaking = false;  // Reset speaking state after meanings finish
            };
        };

        isMeanings3Speaking = true;  // Set state to indicate speech is ongoing
    } else {
        alert("Sorry, your browser doesn't support speech synthesis.");
    }
}

// Event listener to detect when "M" and "4" keys are pressed in sequence for Meaning3
document.addEventListener('keydown', function(event) {
    if (event.key.toLowerCase() === 'm' && !isMeanings3Speaking) {
        mKeyPressedMeaning3 = true;  // "M" key was pressed first
    } else if (event.key === '4' && mKeyPressedMeaning3 && !isMeanings3Speaking) {
        speakMeanings3();  // Trigger speech synthesis when "4" is pressed after "M"
        mKeyPressedMeaning3 = false;  // Reset the "M" press after the sequence is complete
    } else {
        mKeyPressedMeaning3 = false;  // Reset if keys are pressed out of sequence
    }
});

// Array of possible correct passive voice sentences for each question
const correctAnswers = [
  ["The students are taught by the teacher.", "The students are being taught by the teacher.", "The students were taught by the teacher."],
  ["The meal is cooked by the chef.", "The meal was cooked by the chef."],
  ["The request is approved by the manager.", "The request was approved by the manager."],
  ["The cat is chased by the dog.", "The cat was chased by the dog."],
  ["The game is played by the children.", "The game was played by the children."]
];

function checkAnswer(inputId, questionIndex) {
  // Get the student's answer from the input field
  const studentAnswer = document.getElementById(inputId).value.trim().toLowerCase();

  // Get the result div and input field
  const resultDiv = document.getElementById(`result${questionIndex}`);
  const inputField = document.getElementById(inputId);

  // Check if the student's answer matches any of the correct answers for the respective question
  const isCorrect = correctAnswers[questionIndex - 1].some(answer => studentAnswer === answer.toLowerCase());

  // Set the input field background color immediately
  inputField.style.backgroundColor = isCorrect ? "#9aeabc" : "#ff9393"; // Green if correct, red if incorrect

  if (isCorrect) {
      resultDiv.innerHTML = "Correct! Well done.";
      resultDiv.className = "result correct";
  } else {
      resultDiv.innerHTML = `Incorrect. The correct answers could be: "${correctAnswers[questionIndex - 1].join(', ')}"`;
      resultDiv.className = "result incorrect";
  }
}











