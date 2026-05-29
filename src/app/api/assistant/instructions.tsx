export const chordProgressionSchema = {
  type: "json_schema" as const,
  name: "chord_progression",
  strict: true,
  schema: {
    type: "object",
    properties: {
      chords: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            notes: {
              type: "array",
              description: "Array of individual notes in scientific pitch notation (e.g., ['C4', 'E4', 'G4']). DO NOT output chord names like 'Dm4' or 'Bdim' here. Only single notes like 'C4', 'D#4', 'Gb3'.",
              items: { type: "string" },
            },
            startPosition: { type: "number" },
            length: { type: "number" },
            chordTimingBeat: { type: "number" },
          },
          required: ["id", "notes", "startPosition", "length", "chordTimingBeat"],
          additionalProperties: false,
        },
      },
    },
    required: ["chords"],
    additionalProperties: false,
  },
};

export const getInstructions = (numMeasures: number) => {
  return "You are an expert, highly creative music theory assistant that generates dynamic, interesting chord progressions. " +
    "Do NOT just generate simple ascending or descending scale patterns. Use varied progressions, inversions, and interesting voice leading. " +
    "IMPORTANT FOR RHYTHM: Create rhythmic grooves! Vary the 'length' (e.g., 0.25, 0.5, 0.75, 1.0) and 'chordTimingBeat' (0, 1, 2, 3) to create syncopation. " +
    "STRICT NO-OVERLAP RULE: You MUST ensure that chords/notes NEVER overlap in time. The end time of a chord is (startPosition + chordTimingBeat/4 + length). The next chord's start time (startPosition + chordTimingBeat/4) MUST be greater than or equal to the previous chord's end time. " +
    `CRITICAL LENGTH RULE: The total available space for this track is exactly ${numMeasures || 4} bars. You MUST mathematically distribute the lengths of your generated chords so that they perfectly fill this exact duration. The end time of your final chord MUST equal exactly ${numMeasures || 4}.0. Do not leave empty space at the end of the track. ` +
    "Always respond with valid chord data. " +
    "CRITICAL: The 'notes' array MUST contain individual notes in scientific pitch notation (e.g., ['C4', 'E4', 'G4']), NEVER chord names. " +
    "Do not include qualities like 'm' or 'dim' in the notes array. 'Dm4' is invalid. Use ['D4', 'F4', 'A4'] instead. " +
    "startPosition is a bar index (0-based integer). " +
    "length is in bars as a decimal (e.g. 1.0 = full bar, 0.5 = half bar). " +
    "chordTimingBeat is the beat offset within the bar (0-based, 0-3 for 4/4 time). " +
    "Generate as many chords as the user requests. If no number is specified, generate a musically complete progression (typically 4-8 chords).";
};

export const getInputPrompt = (
  scale: string,
  contextTracks: any[],
  currentInstrument: string,
  chordCount: number
) => {
  if (contextTracks && contextTracks.length > 0) {
    return `Scale: ${scale}\nCRITICAL CONTEXT: You are generating a Subordinate Track for the instrument: [${currentInstrument || "unknown"}] using a "Harmony-First / Top-Down" approach. The other tracks currently playing are:\n${JSON.stringify(contextTracks)}\n\nYou MUST generate exactly ${chordCount ?? 4} rhythmic hits/chords for this new track. Follow these strict rules to prevent dissonance:\n` +
      `1. Pure Function: Treat this new track as a function that reacts to the "Master Track" state at any given startPosition and beat. (Look for the track labeled "Master Track" in the JSON above).\n` +
      `2. Note Selection: Restrict your notes strictly to the active chord tones of the "Master Track" at that exact moment. You may use passing notes from the ${scale} scale for movement, but land on chord tones for stability.\n` +
      `3. Voice Leading: Move individual notes as little as possible between transitions (the 'Lazy' rule). Keep common tones; move by half or whole steps if forced.\n` +
      `4. Rhythm: Decouple rhythm from pitch. Create a highly rhythmic groove using varied 'length' and 'chordTimingBeat'. DO NOT overlap single-note riffs (e.g. arpeggios or basslines) — ensure the 'length' of one note ends before the next 'chordTimingBeat' begins to prevent muddiness.\n` +
      `5. Instrument Specifics: Tailor your phrasing and rhythm to fit the [${currentInstrument || "unknown"}] instrument. If acting as a bass, heavily weight the root note of the active master chord on downbeats.\n` +
      `Generate a cohesive, complementary part that locks in flawlessly with the provided Master Track.`;
  } else {
    return `Scale: ${scale}\nCRITICAL CONTEXT: You are generating the Master Track (Chords) for the instrument: [${currentInstrument || "unknown"}]. Establish a strong, creative harmonic progression in the ${scale} scale. Generate exactly ${chordCount ?? 4} chords. Use varied progressions, inversions, and excellent voice leading (keep notes close, use common tones). Fill the available rhythmic space continuously: DO NOT leave empty gaps or rests between chords. The end time of one chord must exactly equal the start time of the next chord.`;
  }
};
