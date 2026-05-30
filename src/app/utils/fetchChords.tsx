type Chord = {
  id: string;
  notes: string[];
  startPosition: number;
  length: number;
};

export const getChords = async (scale: string, chordCount: number, bpm: number, threadId: any, chords: any, numMeasures: number) => {
    
    if (!scale.trim()) return; // scale is empty

    try {
        const response = await fetch("/api/assistant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scale, chordCount, bpm, numMeasures }),
        });
        const data = await response.json();

        // The API returns a structured JSON string via response.text
        // Parse it directly — chords are already fully formed objects
        const parsedChords: Chord[] = parseChordsFromResponse(data.message);
        const parsedId = data.threadId || null;

        // Build a human-readable display string from the structured chords
        const parsedMessage = parsedChords
            .map((chord, index) => `Chord ${index + 1}: ${chord.notes.join(", ")}`)
            .join("\n");

        return { transformedChords: parsedChords, parsedId, parsedMessage };
    } catch (error) {
        console.error("Error fetching response:", error);
    }  
}

const parseChordsFromResponse = (response: string): Chord[] => {
  try {
    // The Responses API returns the structured text directly as a string
    const raw = typeof response === "string" ? response : JSON.stringify(response);
    const data = JSON.parse(raw);
    return data.chords || [];
  } catch (error) {
    console.error("Error parsing chords, the assistant didn't respond in the correct format:", error, "Raw response:", response);
    return [];
  }
};