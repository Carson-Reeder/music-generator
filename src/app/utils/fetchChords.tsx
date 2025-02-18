export const getChords = async (scale: string, threadId: any, chords: any) => {
    
    if (!scale.trim()) return; // scale is empty

    try {
        const response = await fetch("/api/assistant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scale, threadId }),
        });
        const data = await response.json();
        const parsedChords = parseChordsFromResponse(data.message);
        const parsedId = data.threadId
        const parsedMessage = data.message

        const findLastChord = (existingChords: any[]) => {
          if (existingChords.length === 0) return null;
          
          return existingChords.reduce((maxChord, currentChord) => {
            return (currentChord.startPosition + (currentChord.chordTimingBeat / 4) > maxChord.startPosition + (maxChord.chordTimingBeat/4)) ? currentChord : maxChord;
          });
        };
    
        const lastChord = findLastChord(chords);
        console.log('lastChord', lastChord);

        // create Chords object
        const transformedChords = parsedChords.map((notes: string[], index: number) => {
          // If we have fewer existing chords than new chords, calculate new box start position
          if (index >= chords.length) {
            // If no existing chords, start at 0
            const startPosition = lastChord 
              ? (lastChord.startPosition)
              : 0;
            const chordTiming = lastChord
              ? (lastChord.chordTimingBeat + (lastChord.length)*4)
              : 0;
            
    
            return {
              id: `${index + 1}`,
              notes,
              startPosition: startPosition,
              length: .25, // Default length, adjust as needed
              chordTimingBeat: chordTiming, // Default timing, adjust as needed
            };
          }
    
          // For existing chords, use the original values
          return {
            id: `${index + 1}`,
            notes,
            startPosition: chords[index].startPosition,
            length: chords[index].length,
            chordTimingBeat: chords[index].chordTimingBeat,
          };
        });
        return {transformedChords, parsedId, parsedMessage };
    } catch (error) {
        console.error("Error fetching response:", error);
    }  
}

const parseChordsFromResponse = (response: string): string[][] => {
  try {
    const chords = response
      .split("\n")
      .map((line) => {
        const match = line.match(/Chord \d+: (.+)/);
        return match ? match[1].split(", ").map((note) => note.trim()) : [];
      })
      .filter((chord) => chord.length > 0);

    return chords;
  } catch (error) {
    console.error("Error parsing chords, the assistant didn't respond in the correct format:", error);
    return []; // Return an empty array on error
  }
};