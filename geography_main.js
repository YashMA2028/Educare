let pressCount = 0;
let pressTimer;
let isPaused = false;

// Function to initialize speech synthesis for the Geography content
function speakGeographyContent() {
  if ('speechSynthesis' in window) {
    // Fetch chapter title and section content dynamically
    const chapterTitle = document.querySelector('.chp1 h1').innerText; // Select Chapter 1 Title
    const sections = document.querySelectorAll('.chp1 h2, .chp1 p, .chp1 ul li'); // Select all subheadings, paragraphs, and list items in Chapter 1
    
    // Speak the chapter title first
    const titleSpeech = new SpeechSynthesisUtterance(chapterTitle);
    titleSpeech.lang = 'en-US';  // Adjust this to 'en-IN' for Indian English accent
    titleSpeech.pitch = 1;
    titleSpeech.rate = 1;

    // Speak the chapter title
    speechSynthesis.speak(titleSpeech);

    // After speaking the title, speak each section content
    titleSpeech.onend = function() {
      speakSections(sections);
    };
  } else {
    alert("Sorry, your browser doesn't support speech synthesis.");
  }
}

// Function to speak each section content
function speakSections(sections) {
  let index = 0;

  function speakNextSection() {
    if (index < sections.length) {
      const sectionText = sections[index].innerText;
      const sectionSpeech = new SpeechSynthesisUtterance(sectionText);
      sectionSpeech.lang = 'en-US'; // Adjust to 'en-IN' if needed
      sectionSpeech.pitch = 1;
      sectionSpeech.rate = 1;

      sectionSpeech.onend = function() {
        index++; // Move to the next section after the current one finishes
        speakNextSection();
      };

      window.speechSynthesis.speak(sectionSpeech);
    }
  }

  // Start speaking the first section
  speakNextSection();
}

// Function to stop the current speech
function stopSpeech() {
  if (window.speechSynthesis.speaking || window.speechSynthesis.paused) {
    window.speechSynthesis.cancel();
  }
}

// Function to reset the press counter if too much time passes between presses
function resetPressCount() {
  pressCount = 0;
}

// Event listener for detecting the keypress event (specifically the "S" key)
document.addEventListener('keydown', function (event) {
  if (event.key.toLowerCase() === 's') {
    pressCount++;

    // Reset the counter if 2 seconds pass between presses
    clearTimeout(pressTimer);
    pressTimer = setTimeout(resetPressCount, 2000);

    if (pressCount === 3) {
      stopSpeech(); // Stop any current speech before starting a new one
      speakGeographyContent(); // Start speaking the geography content
      pressCount = 0; // Reset press count after 3 presses
    }
  }
});

// Pause speech synthesis when the tab becomes invisible (user switches tab)
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      isPaused = true; // Track the paused state
    }
  } else if (isPaused) { // Resume only if it was previously paused
    window.speechSynthesis.resume();
    isPaused = false; // Reset paused state after resuming
  }
});

// Stop speech synthesis when the user refreshes or leaves the page
window.addEventListener('beforeunload', function () {
  stopSpeech(); // Stop speech on page refresh or unload
});


let tKeyPressedChp1 = false;  // Track if "T" key was pressed first for Chapter 1
let isChp1Speaking = false;    // Track if speech synthesis for Chapter 1 is active

// Function to speak the content of the chapter (chp1)
function speakChp1() {
    if ('speechSynthesis' in window) {
        // Get all elements with the class 'chp1' and combine their text
        const chp1Elements = document.querySelectorAll('.chp1 *');  // Select all child elements within the chp1 class
        let combinedText = "";

        // Loop through all selected elements and append their text to combinedText
        chp1Elements.forEach(element => {
            combinedText += element.innerText + " ";  // Add a space between elements
        });

        // Create speech for the combined chapter content
        const chp1Speech = new SpeechSynthesisUtterance(combinedText);
        chp1Speech.lang = 'en-US';
        chp1Speech.pitch = 1;
        chp1Speech.rate = 1;

        // Speak the chapter content
        speechSynthesis.speak(chp1Speech);
        
        chp1Speech.onend = function() {
            isChp1Speaking = false;  // Reset speaking state after chapter content finishes
        };

        isChp1Speaking = true;  // Set state to indicate speech is ongoing
    } else {
        alert("Sorry, your browser doesn't support speech synthesis.");
    }
}

// Event listener to detect when "T" and "1" keys are pressed in sequence for Chapter 1
document.addEventListener('keydown', function(event) {
    if (event.key.toLowerCase() === 't' && !isChp1Speaking) {
        tKeyPressedChp1 = true;  // "T" key was pressed first
    } else if (event.key === '1' && tKeyPressedChp1 && !isChp1Speaking) {
        speakChp1();  // Trigger speech synthesis when "1" is pressed after "T"
        tKeyPressedChp1 = false;  // Reset the "T" press after the sequence is complete
    } else {
        tKeyPressedChp1 = false;  // Reset if keys are pressed out of sequence
    }
});
