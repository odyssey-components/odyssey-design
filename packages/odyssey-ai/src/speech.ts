import { useCallback, useEffect, useRef, useState } from "react";
import { useOdysseyAILocale } from "./locale";

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
}
interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechWindow = Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };

export function useSpeechInput({ language = "zh-CN" }: { language?: string } = {}) {
  const locale = useOdysseyAILocale();
  const recognition = useRef<SpeechRecognitionLike | undefined>(undefined);
  const [transcript, setTranscript] = useState("");
  const [isListening, setListening] = useState(false);
  const [error, setError] = useState<string>();
  const supported = typeof window !== "undefined" && Boolean((window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition);
  const stop = useCallback(() => recognition.current?.stop(), []);
  const start = useCallback(() => {
    const Constructor = (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition;
    if (!Constructor || isListening) return;
    const instance = new Constructor();
    instance.lang = language;
    instance.continuous = true;
    instance.interimResults = true;
    instance.onresult = (event) => {
      let value = "";
      for (let index = 0; index < event.results.length; index += 1) value += event.results[index]?.[0]?.transcript ?? "";
      setTranscript(value.trim());
    };
    instance.onerror = (event) => {
      setError(event.error === "not-allowed" ? locale.speech.permissionDenied : locale.speech.failed(event.error));
      setListening(false);
    };
    instance.onend = () => setListening(false);
    recognition.current = instance;
    setError(undefined);
    setTranscript("");
    setListening(true);
    instance.start();
  }, [isListening, language, locale]);
  useEffect(() => () => recognition.current?.abort(), []);
  return { supported, isListening, transcript, error, start, stop, resetTranscript: () => setTranscript("") };
}
