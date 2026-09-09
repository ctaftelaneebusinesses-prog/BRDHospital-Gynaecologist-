import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

// The Web Speech API isn't in the standard TS lib yet — this is the minimal
// shape this component actually uses.
interface SpeechRecognitionResultLike {
  transcript: string;
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

interface VoiceDictationButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

/** A mic button that appends dictated speech into the caller's text field. Silently hides itself if the browser doesn't support speech recognition. */
export function VoiceDictationButton({ onTranscript, className = "" }: VoiceDictationButtonProps) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognitionCtor()));
  }, []);

  function toggle() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript) onTranscript(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? "Stop voice dictation" : "Describe your reason by speaking"}
      title={listening ? "Listening… click to stop" : "Speak instead of typing"}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
        listening ? "bg-rose-600 text-cream" : "bg-rose-50 text-rose-600 hover:bg-rose-100"
      } ${className}`}
    >
      {listening ? <MicOff size={15} /> : <Mic size={15} />}
    </button>
  );
}
