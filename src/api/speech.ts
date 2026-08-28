// Web Speech API 封装 - 浏览器内置，完全免费

export class SpeechService {
  private synthesis: SpeechSynthesis;
  private recognition: any = null;
  private isListening = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initRecognition();
  }

  private initRecognition() {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.lang = 'zh-CN';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    }
  }

  // 语音合成 (TTS)
  speak(text: string, onEnd?: () => void): void {
    if (!this.synthesis) {
      console.warn('浏览器不支持语音合成');
      return;
    }

    // 取消之前的语音
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // 稍微高一点，更可爱

    // 尝试选择中文女声
    const voices = this.synthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.includes('zh') && v.name.includes('Female'))
      || voices.find(v => v.lang.includes('zh'))
      || voices[0];
    if (zhVoice) utterance.voice = zhVoice;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synthesis.speak(utterance);
  }

  stopSpeaking(): void {
    this.synthesis.cancel();
  }

  // 语音识别 (STT)
  startListening(onResult: (text: string, isFinal: boolean) => void, onError?: (error: string) => void): boolean {
    if (!this.recognition) {
      onError?.('浏览器不支持语音识别，请使用 Chrome 或 Edge');
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.isListening = true;

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript, true);
      } else if (interimTranscript) {
        onResult(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError?.(`语音识别错误: ${event.error}`);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.start();
    return true;
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();
