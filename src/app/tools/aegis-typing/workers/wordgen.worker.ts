// wordgen.worker.ts - Web Worker for word generation
export {};

const ctx = self as unknown as {
  addEventListener: (type: string, listener: (e: MessageEvent) => void) => void;
  postMessage: (message: unknown) => void;
};

interface GeneratePayload {
  type: 'GENERATE';
  wordList: string[];
  count: number;
  settings: {
    punctuation: boolean;
    numbers: boolean;
    capitalization: boolean;
  };
  funbox?: string;
  seed?: string;
}

ctx.addEventListener('message', (e: MessageEvent<GeneratePayload>) => {
  if (e.data.type === 'GENERATE') {
    const { wordList, count, settings, funbox, seed } = e.data;
    
    // Simplistic pseudo-random based on seed if provided
    let seedVal = seed ? seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Date.now();
    const random = () => {
       const x = Math.sin(seedVal++) * 10000;
       return x - Math.floor(x);
    };

    let generatedWords: string[] = [];
    const baseLength = wordList.length;

    if (baseLength === 0) {
      self.postMessage({ type: 'WORDS_READY', words: [] });
      return;
    }

    for (let i = 0; i < count; i++) {
      let word = wordList[Math.floor(random() * baseLength)];
      
      if (settings.capitalization && random() > 0.8) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      
      if (settings.punctuation && random() > 0.85) {
        const puncs = ['.', ',', '!', '?', ';', ':'];
        const punc = puncs[Math.floor(random() * puncs.length)];
        word += punc;
      }
      
      if (settings.numbers && random() > 0.9) {
        word += Math.floor(random() * 100).toString();
      }

      generatedWords.push(word);
    }

    if (funbox === 'shuffle') {
      generatedWords = generatedWords.sort(() => random() - 0.5);
    } else if (funbox === 'mirror') {
      generatedWords = generatedWords.map(w => w.split('').reverse().join(''));
    } else if (funbox === 'backwards') {
      generatedWords = generatedWords.reverse();
    }

    ctx.postMessage({ type: 'WORDS_READY', words: generatedWords });
  }
});
