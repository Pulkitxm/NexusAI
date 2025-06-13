interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export class SpeechToTextService {
  private recognition: SpeechRecognition | null = null;
  private onResultCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onStartCallback: (() => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = "en-US";
        this.setupEventListeners();
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  private setupEventListeners() {
    if (!this.recognition) return;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (!event.results[i].isFinal) {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      const isFinal = event.results[event.results.length - 1].isFinal;
      const finalTranscript = isFinal ? event.results[event.results.length - 1][0].transcript : "";

      this.onResultCallback?.(finalTranscript || interimTranscript, isFinal);
    };

    this.recognition.onstart = () => {
      this.onStartCallback?.();
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = `Speech recognition error: ${event.error}`;
      switch (event.error) {
        case "not-allowed":
        case "permission-denied":
          errorMessage = "Microphone access denied. Please allow microphone permissions in your browser settings.";
          break;
        case "no-speech":
          errorMessage = "No speech detected. Please try speaking louder or clearer.";
          break;
        case "audio-capture":
          errorMessage = "Microphone not found or could not be accessed.";
          break;
        case "network":
          errorMessage = "Network error during speech recognition.";
          break;
        case "bad-grammar":
          errorMessage = "Speech recognition encountered a grammar error.";
          break;
      }
      this.onErrorCallback?.(errorMessage);
    };

    this.recognition.onend = () => {
      this.onEndCallback?.();
    };
  }

  public start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onStart: () => void,
    onEnd: () => void
  ): Promise<void> {
    if (!this.recognition) {
      return Promise.reject("Speech Recognition API not initialized.");
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onStartCallback = onStart;
    this.onEndCallback = onEnd;

    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
          this.recognition?.start();
          resolve();
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === "NotAllowedError") {
            reject("Microphone access denied. Please allow microphone permissions.");
          } else if (err instanceof DOMException && err.name === "NotFoundError") {
            reject("No microphone found. Please connect a microphone.");
          } else {
            reject("Failed to access microphone. Please check your system settings.");
          }
        });
    });
  }

  public stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  public abort() {
    if (this.recognition) {
      this.recognition.abort();
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;
      this.recognition.onstart = null;
      this.recognition.onspeechstart = null;
      this.recognition.onspeechend = null;
      this.recognition.onnomatch = null;
      this.recognition = null;
    }
  }
}
