export const arrangementSchema = {
  type: "json_schema" as const,
  name: "music_arrangement",
  strict: true,
  schema: {
    type: "object",
    properties: {
      music_theory_plan: {
        type: "object",
        description: "CRITICAL: You MUST fill this out thoroughly BEFORE generating any notes. This is your compositional reasoning — like a composer sketching on paper before writing the score. The more detailed your plan, the more coherent the music will be.",
        properties: {
          existing_analysis: { type: "string", description: "If there are existing tracks, analyze them here: What key center do they establish? What is the harmonic rhythm? Where are the strong beats? What is the overall feel/genre? If composing from scratch, describe the musical vision you want to create." },
          harmonic_plan: { type: "string", description: "The exact chord progression using Roman numerals (e.g. I - vi - IV - V). Explain WHY you chose this progression and how it creates tension/resolution. If existing tracks have a progression, your new tracks must follow it." },
          per_track_strategy: { type: "string", description: "For EACH track you are generating, explain specifically what it will do. E.g. 'Track 0 (Master Chords): Block chords on beats 1 and 3. Track 1 (Bassline): Root notes on beat 1, walk up to the next chord root on beat 4. Track 2 (Melody): Start on the 3rd of each chord, create a descending line that resolves to the root.'" },
          voice_leading_plan: { type: "string", description: "Describe the specific voice leading between chords. Which notes are common tones? Which voices move and by how much? E.g. 'Between I and vi, the 3rd (E) is held as a common tone, the root (C) drops to A, the 5th (G) stays.'" },
          rhythmic_motif: { type: "string", description: "Describe the rhythmic feel that ties all tracks together. What is the groove? Where are the accents? How do the tracks interlock rhythmically? E.g. 'Chords on 1 and 3, bass walks on all four beats, melody syncopates on the and-of-2.'" },
        },
        required: ["existing_analysis", "harmonic_plan", "per_track_strategy", "voice_leading_plan", "rhythmic_motif"],
        additionalProperties: false,
      },
      tracks: {
        type: "array",
        description: "The actual generated notes for each requested track. These MUST follow the plan you wrote above.",
        items: {
          type: "object",
          properties: {
            trackIndex: { type: "number", description: "The index of the track being generated to map it back to the UI." },
            chords: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  degrees: {
                    type: "array",
                    description: "Array of scale degrees with octaves. Use scale degrees 1-7 only. For a triad chord use 3 degrees, for single melody/bass notes use 1 degree.",
                    items: {
                      type: "object",
                      properties: {
                        degree: { type: "number", description: "Scale degree (1-7)" },
                        octave: { type: "number", description: "Octave number (e.g., 4 for mid-range, 2 for bass)" }
                      },
                      required: ["degree", "octave"],
                      additionalProperties: false
                    },
                  },
                  startPosition: { type: "number", description: "Start time in bars as a decimal. 0 = beginning, 1.0 = start of bar 2, 1.75 = bar 2 beat 4." },
                  length: { type: "number", description: "Duration in bars as a decimal. 1.0 = full bar, 0.25 = quarter note." },
                },
                required: ["id", "degrees", "startPosition", "length"],
                additionalProperties: false,
              },
            },
          },
          required: ["trackIndex", "chords"],
          additionalProperties: false,
        },
      },
    },
    required: ["music_theory_plan", "tracks"],
    additionalProperties: false,
  },
};

export const getInstructions = (numMeasures: number) => {
  return "You are an expert, highly creative music composer and arranger. You think like a real composer — you analyze what already exists, plan your approach on paper, and THEN write the notes. " +
    "CRITICAL WORKFLOW: You MUST fill out the `music_theory_plan` object THOROUGHLY before generating any notes in `tracks`. The plan is your scratchpad. Use it to reason about harmony, rhythm, and how parts interlock. The more detailed your plan, the better your music will sound. " +
    "Do NOT just generate simple ascending or descending scale patterns. Use varied progressions, inversions, and interesting voice leading. " +
    "IMPORTANT FOR RHYTHM: Create rhythmic grooves! Vary the 'length' and 'startPosition' to create syncopation and musical interest. " +
    "STRICT NO-OVERLAP RULE: Within a single track, chords/notes MUST NOT overlap. The end time of a chord is (startPosition + length). The next chord's startPosition MUST be >= the previous chord's end time. " +
    `CRITICAL LENGTH RULE: The total available space is exactly ${numMeasures || 4} bars (startPosition 0 to ${numMeasures || 4}.0). Fill this space completely — the final chord's end time MUST equal exactly ${numMeasures || 4}.0. ` +
    "OUTPUT FORMAT: The 'degrees' array MUST contain objects with 'degree' (1-7) and 'octave', NEVER chord names or absolute note strings like 'C4'. " +
    "For a major triad on the root: [{degree:1, octave:4}, {degree:3, octave:4}, {degree:5, octave:4}]. " +
    "For a single bass note on the root: [{degree:1, octave:2}]. " +
    "For a melody note on the 5th: [{degree:5, octave:5}]. " +
    "startPosition is in bars: 0 = beginning, 1.0 = bar 2, 1.75 = bar 2 beat 4. " +
    "length is in bars: 1.0 = full bar, 0.5 = half bar, 0.25 = quarter note.";
};

// Helper to build a rich description of the existing song state
const buildExistingSongContext = (allTracks: any[]): string => {
  if (!allTracks || allTracks.length === 0) return "";

  let context = "=== EXISTING SONG STATE (READ THIS CAREFULLY) ===\n";
  context += `Total tracks in the arrangement: ${allTracks.length}\n\n`;

  allTracks.forEach((track, i) => {
    context += `--- Track ${i} ---\n`;
    context += `  Role: ${track.trackType}\n`;
    context += `  Instrument: ${track.instrument}\n`;
    context += `  Number of elements: ${track.chords.length}\n`;

    if (track.chords.length > 0) {
      context += `  Timeline:\n`;
      track.chords.forEach((chord: any, j: number) => {
        const endTime = chord.startPosition + chord.length;
        context += `    [${j}] Notes: ${chord.notes.join(", ")} | Start: ${chord.startPosition} | Length: ${chord.length} | End: ${endTime.toFixed(2)}\n`;
      });
    } else {
      context += `  (empty — no notes yet)\n`;
    }
    context += "\n";
  });

  context += "=== END EXISTING SONG STATE ===\n\n";
  return context;
};

export const getInputPrompt = (
  scale: string,
  contextTracks: any[],
  tracksToGenerate: { trackIndex: number; trackType: string; instrument: string; chordCount: number }[],
  bpm: number
) => {
  const bpmContext = bpm ? `BPM: ${bpm}. ` : '';

  const targetTracksText = tracksToGenerate.map(t =>
    `  Track Index: ${t.trackIndex} | Role: [${t.trackType}] | Instrument: [${t.instrument}] | Generate ${t.chordCount || 4} elements`
  ).join("\n");

  const roleGuidance = tracksToGenerate.map(t => {
    let guidance = "";
    if (t.trackType === "Arpeggio") guidance = "Break the underlying chord into single, rhythmic, repeating notes. Each element should be a SINGLE degree. Create a flowing, harp-like pattern that outlines the chord tones. Vary the octave to create interest.";
    else if (t.trackType === "Bassline") guidance = "Play single, low notes (octave 2-3). On beat 1 of each chord change, play the ROOT (degree 1 of the current chord). On other beats, use the 5th or walk stepwise toward the next chord's root. Each element is a SINGLE degree.";
    else if (t.trackType === "Melody") guidance = "Create a singable, expressive sequence of SINGLE notes (one degree per element) in octave 4-5. Start phrases on chord tones (1, 3, 5), use passing tones (2, 4, 6, 7) for movement, and resolve to chord tones on strong beats. Leave rests (gaps between elements) for breathing room.";
    else if (t.trackType === "Rhythmic Hits") guidance = "Create syncopated, staccato block chords or stabs. Use short lengths (0.125 or 0.25) with gaps between them. Place hits on the 'and' of beats for syncopation.";
    else if (t.trackType === "Secondary Chord Progression") guidance = "Complement the Master chord progression. Use inversions (e.g., start on degree 3 or 5 instead of 1) or add extensions (7ths: add degree 7, or 9ths). Voice these in a different octave range than the Master to avoid clashing.";
    else guidance = "Establish a strong harmonic foundation with block chords (3-4 degrees per element). This is the harmonic backbone — other tracks will be based on your chord tones.";
    return `  - Track ${t.trackIndex} [${t.trackType}] on [${t.instrument}]: ${guidance}`;
  }).join("\n");

  // Build the prompt
  let prompt = `Scale: ${scale}. ${bpmContext}\n\n`;

  // Add full song context
  const existingContext = buildExistingSongContext(contextTracks);
  if (existingContext) {
    prompt += existingContext;
    prompt += "IMPORTANT: You MUST analyze the existing tracks above in your `existing_analysis` field. Identify the chord progression, harmonic rhythm, and overall feel. Your new tracks MUST complement what already exists — they should sound like they were composed together as a single cohesive piece.\n\n";
  } else {
    prompt += "There are NO existing tracks. You are composing from scratch. In your `existing_analysis` field, describe the musical vision you want to create — the genre feel, energy level, and overall character of the piece.\n\n";
  }

  prompt += `TRACKS TO GENERATE:\n${targetTracksText}\n\n`;
  prompt += `ROLE-SPECIFIC GUIDANCE:\n${roleGuidance}\n\n`;

  prompt += "COMPOSITION RULES:\n" +
    "1. PLAN FIRST: Fill out `music_theory_plan` thoroughly. Analyze what exists, plan your harmony (Roman numerals), describe each track's specific approach, map out voice leading between chords, and describe the rhythmic interlock.\n" +
    "2. HARMONIC LOCK: Every track must agree on the same underlying chord at any given moment. If the Master progression plays a I chord from 0 to 1.0, the bass must play degree 1 and the melody must land on 1, 3, or 5 during that window.\n" +
    "3. VOICE LEADING: Move notes as little as possible between chord changes. Hold common tones. Move other voices by step (1 degree). Avoid large leaps unless they are intentional melodic gestures.\n" +
    "4. RHYTHMIC INTERLOCK: Tracks should complement each other rhythmically, not all play at the same time. If chords are on beats 1 and 3, put the melody on beats 2 and 4, or syncopate it.\n" +
    "5. REGISTER SEPARATION: Keep tracks in different octave ranges to avoid muddiness. Bass: octave 2-3. Chords: octave 3-4. Melody: octave 4-5.\n";

  return prompt;
};
