// stats.worker.ts
export {};

const ctx = self as unknown as {
  addEventListener: (type: string, listener: (e: MessageEvent) => void) => void;
  postMessage: (message: unknown) => void;
};

interface CalcStatsPayload {
  type: 'CALC_STATS';
  keystrokes: { key: string; timestamp: number; isCorrect: boolean }[];
  startTs: number;
  duration: number; // total elapsed seconds
}

ctx.addEventListener('message', (e: MessageEvent<CalcStatsPayload>) => {
  if (e.data.type === 'CALC_STATS') {
    const { keystrokes, startTs, duration } = e.data;
    
    // Group keystrokes by second to build WPM timeline
    const timelineData = new Map<number, { correct: number; errors: number }>();
    
    const errorPositions: number[] = [];
    
    keystrokes.forEach((stroke, index) => {
       const elapsedSec = Math.floor((stroke.timestamp - startTs) / 1000);
       
       if (!timelineData.has(elapsedSec)) {
          timelineData.set(elapsedSec, { correct: 0, errors: 0 });
       }
       
       const secData = timelineData.get(elapsedSec)!;
       
       if (stroke.isCorrect) {
          secData.correct++;
       } else {
          secData.errors++;
          errorPositions.push(index);
       }
    });

    const wpmTimeline: number[] = [];
    let cumulativeCorrect = 0;
    let cumulativeErrors = 0;

    for (let s = 1; s <= Math.ceil(duration); s++) {
       const secData = timelineData.get(s) || { correct: 0, errors: 0 };
       cumulativeCorrect += secData.correct;
       cumulativeErrors += secData.errors;
       
       // net WPM at second `s`
       // (correctChars / 5) / (s / 60)
       const minuteFractions = s / 60;
       const netWpm = Math.max(0, Math.round((cumulativeCorrect / 5 - cumulativeErrors) / minuteFractions));
       wpmTimeline.push(netWpm);
    }

    ctx.postMessage({ 
      type: 'STATS_READY', 
      wpmTimeline, 
      errorPositions 
    });
  }
});
