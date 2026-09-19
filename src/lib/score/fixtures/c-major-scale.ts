import { parseScoreIR, type ScoreIR } from "@/lib/score/ir";

const C_MAJOR_SCALE: ScoreIR = {
  version: 1,
  meta: {
    title: "C major scale",
    composer: "Orpheus fixture",
    key: "C",
    time: "4/4",
    tempoBpm: 96,
  },
  parts: [
    {
      id: "melody",
      name: "Melody",
      clef: "treble",
      instrument: "piano",
      measures: [
        {
          number: 1,
          notes: [
            { pitch: { step: "C", alter: 0, octave: 4 }, duration: { divisions: 4, type: "quarter" }, onsetBeats: 0, voice: 1, confidence: 1 },
            { pitch: { step: "D", alter: 0, octave: 4 }, duration: { divisions: 4, type: "quarter" }, onsetBeats: 1, voice: 1, confidence: 1 },
            { pitch: { step: "E", alter: 0, octave: 4 }, duration: { divisions: 4, type: "quarter" }, onsetBeats: 2, voice: 1, confidence: 1 },
            { pitch: { step: "F", alter: 0, octave: 4 }, duration: { divisions: 4, type: "quarter" }, onsetBeats: 3, voice: 1, confidence: 1 },
          ],
        },
        {
          number: 2,
          notes: [
            { pitch: { step: "G", alter: 0, octave: 4 }, duration: { divisions: 4, type: "quarter" }, onsetBeats: 0, voice: 1, confidence: 1 },
            { pitch: { step: "A", alter: 0, octave: 4 }, duration: { divisions: 4, type: "quarter" }, onsetBeats: 1, voice: 1, confidence: 1 },
            { pitch: { step: "B", alter: 0, octave: 4 }, duration: { divisions: 4, type: "quarter" }, onsetBeats: 2, voice: 1, confidence: 1 },
            { pitch: { step: "C", alter: 0, octave: 5 }, duration: { divisions: 4, type: "quarter" }, onsetBeats: 3, voice: 1, confidence: 1 },
          ],
        },
      ],
    },
  ],
};

export const cMajorScale = parseScoreIR(C_MAJOR_SCALE);
