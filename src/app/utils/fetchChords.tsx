export const getChords = async (scale: string, threadId: any) => {

    if (!scale.trim()) return; // scale is empty

    try {
        const response = await fetch("/api", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scale, threadId }),
        });

        const data = await response.json();

        const parsedChords = parseChordsFromResponse(data.message);
        const parsedId = data.threadId
        const parsedMessage = data.message

        // create Chords object
        const transformedChords = parsedChords.map((notes: string[], index: number) => ({
          id: `chord${index + 1}`, // Assign a unique ID
          notes, // Assign notes directly
          startPosition: index, // Default start position
          length: 1, // Default length
          chordTimingBeat: 0, // Default timing measure
          boxStartPosition: 1, // Default box start position
          boxTimingBeat: 0, // Default box timing measure
          boxLength: 0.25, // Default box length
        }));
        

        return {transformedChords, parsedId, parsedMessage };

    } catch (error) {
        console.error("Error fetching response:", error);
    }  
}

const parseChordsFromResponse = (response: string): string[][] => {
    const chords = response
      .split("\n")
      .map((line) => {
        const match = line.match(/Chord \d+: (.+)/);
        return match ? match[1].split(", ").map((note) => note.trim()) : [];
      })
      .filter((chord) => chord.length > 0);
    return chords;
  };