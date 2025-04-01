const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.continuous = true;

recognition.onresult = function (event) {
  const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();

  if (transcript.includes("start geography")) {
    stopSpeech();
    speakGeographyContent();
  } else if (transcript.includes("start chapter 1")) {
    stopSpeech();
    speakChp1();
  } else if (transcript.includes("stop")) {
    stopSpeech();
  } else if (transcript.includes("pause")) {
    speechSynthesis.pause();
  } else if (transcript.includes("resume")) {
    speechSynthesis.resume();
  }
};

// Start listening when the page loads
window.addEventListener("load", () => recognition.start());
async function summarizeText(text) {
  const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
    method: "POST",
    headers: { Authorization: `Bearer YOUR_HUGGINGFACE_API_KEY` },
    body: JSON.stringify({ inputs: text }),
  });

  const result = await response.json();
  return result[0].summary_text;
}

async function speakSummary() {
  const chapterText = document.querySelector(".chp1").innerText;
  const summary = await summarizeText(chapterText);

  const summarySpeech = createSpeech("Here’s a quick summary: " + summary);
  speechSynthesis.speak(summarySpeech);
}
