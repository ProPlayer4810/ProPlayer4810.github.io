import { useEffect, useRef, useState } from "react";

export default function VoiceInputButton({ onResult }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
  }, [onResult]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  if (!supported) {
    return (
      <button className="btn btn-secondary" type="button" disabled title="Voice input not supported in this browser">
        🎙️ Voice unavailable
      </button>
    );
  }

  return (
    <button
      className={`btn ${listening ? "btn-primary" : "btn-secondary"}`}
      type="button"
      onClick={toggleListening}
    >
      {listening ? "🔴 Listening…" : "🎙️ Speak"}
    </button>
  );
}
