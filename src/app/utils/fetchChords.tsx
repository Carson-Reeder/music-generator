import { Scale } from "tonal";

type Chord = {
  id: string;
  notes: string[];
  startPosition: number;
  length: number;
};

export type TrackConfig = {
  trackIndex: number;
  trackType: string;
  instrument: string;
  chordCount: number;
};

export const generateArrangement = async (scale: string, bpm: number, tracksToGenerate: TrackConfig[], contextTracks: any[], threadId: any, numMeasures: number) => {
    
    if (!scale.trim()) return; // scale is empty

    try {
        const response = await fetch("/api/assistant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scale, bpm, tracksToGenerate, contextTracks, numMeasures }),
        });
        const data = await response.json();

        // Parse the full arrangement object
        const parsedArrangement = parseArrangementFromResponse(data.message);
        const parsedId = data.threadId || null;

        // Apply Tonal parsing to each track's chords
        if (parsedArrangement && parsedArrangement.tracks) {
            parsedArrangement.tracks.forEach((track: any) => {
                track.chords = mapDegreesToNotes(track.chords, scale);
            });
        }

        // Build a human-readable display string containing the AI's theory plan
        let parsedMessage = "";
        if (parsedArrangement && parsedArrangement.music_theory_plan) {
            const plan = parsedArrangement.music_theory_plan;
            parsedMessage = `=== AI Composition Plan ===\n\n`;
            parsedMessage += `Analysis: ${plan.existing_analysis}\n\n`;
            parsedMessage += `Harmony: ${plan.harmonic_plan}\n\n`;
            parsedMessage += `Track Strategy: ${plan.per_track_strategy}\n\n`;
            parsedMessage += `Voice Leading: ${plan.voice_leading_plan}\n\n`;
            parsedMessage += `Rhythm: ${plan.rhythmic_motif}\n\n`;
        }
        if (parsedArrangement && parsedArrangement.tracks) {
            parsedMessage += `Generated ${parsedArrangement.tracks.length} track(s) successfully.`;
        }

        return { parsedArrangement, parsedId, parsedMessage };
    } catch (error) {
        console.error("Error fetching response:", error);
    }  
}

const parseArrangementFromResponse = (response: string): any => {
  try {
    const raw = typeof response === "string" ? response : JSON.stringify(response);
    const data = JSON.parse(raw);
    return data;
  } catch (error) {
    console.error("Error parsing arrangement:", error, "Raw response:", response);
    return null;
  }
};

const mapDegreesToNotes = (aiChords: any[], scaleName: string): Chord[] => {
  // Extract scale notes using Tonal (e.g., "C major" -> ["C", "D", "E", "F", "G", "A", "B"])
  const scaleData = Scale.get(scaleName);
  const notesInScale = scaleData.notes;
  
  if (!notesInScale || notesInScale.length === 0) {
    console.warn("Tonal couldn't parse scale:", scaleName, "Fallback to C Major");
  }
  const fallbackNotes = notesInScale.length > 0 ? notesInScale : ["C", "D", "E", "F", "G", "A", "B"];

  return aiChords.map(chord => {
    const stringNotes = chord.degrees.map((degObj: { degree: number; octave: number }) => {
      // 1-indexed to 0-indexed
      const zeroIndexed = degObj.degree - 1;
      const len = fallbackNotes.length;
      
      // Handle wrapping safely (e.g. if AI asks for degree 8 or 9)
      const wrappedIndex = ((zeroIndexed % len) + len) % len;
      const octaveOffset = Math.floor(zeroIndexed / len);
      
      const noteClass = fallbackNotes[wrappedIndex];
      const finalOctave = degObj.octave + octaveOffset;
      
      return `${noteClass}${finalOctave}`;
    });

    return {
      id: chord.id,
      notes: stringNotes,
      startPosition: chord.startPosition,
      length: chord.length
    };
  });
};