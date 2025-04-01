document.getElementById('speakBtn').addEventListener('click', function() {
    function speakMarathiText() {
        let text = document.getElementById('chapterText').innerText;
        let speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'mr-IN';

        let voices = speechSynthesis.getVoices();
        let marathiVoice = voices.find(voice => voice.lang.startsWith('mr'));

        if (marathiVoice) {
            speech.voice = marathiVoice;
        } else {
            console.warn("Marathi TTS voice not found. Using default voice.");
        }

        speechSynthesis.speak(speech);
    }

    // Ensure voices are loaded before speaking
    if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = speakMarathiText;
    } else {
        speakMarathiText();
    }
});
