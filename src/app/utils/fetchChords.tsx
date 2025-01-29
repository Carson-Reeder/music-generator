import boxLengthToChordLength from '../components/composition';

export const getChords = async (scale: string, threadId: any, chords: any) => {
    

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
        const findLastChord = (existingChords: any[]) => {
          if (existingChords.length === 0) return null;
          
          return existingChords.reduce((maxChord, currentChord) => {
            return (currentChord.newBoxStartPosition > maxChord.newBoxStartPosition) ? currentChord : maxChord;
          });
        };
    
        const lastChord = findLastChord(chords);
        console.log('lastChord', lastChord);

        // create Chords object
        const transformedChords = parsedChords.map((notes: string[], index: number) => {
          // If we have fewer existing chords than new chords, calculate new box start position
          if (index >= chords.length) {
            // If no existing chords, start at 0
            const nBoxStartPosition = lastChord 
              ? (lastChord.newBoxStartPosition + lastChord.boxLength)
              : 0;
            /*const nStartPosition = lastChord
              ? if (lastChord.Start) */
            console.log('lastChordTimingbeat', lastChord?.chordTimingBeat);
    
            return {
              id: `${index + 1}`,
              notes,
              startPosition: 0,
              length: 1, // Default length, adjust as needed
              chordTimingBeat: 0, // Default timing, adjust as needed
              boxStartPosition: nBoxStartPosition,
              boxTimingBeat: 0, // Default timing, adjust as needed
              boxLength: .125, // Default length, adjust as needed
              newBoxStartPosition: nBoxStartPosition
            };
          }
    
          // For existing chords, use the original values
          return {
            id: `${index + 1}`,
            notes,
            startPosition: chords[index].startPosition,
            length: chords[index].length,
            chordTimingBeat: chords[index].chordTimingBeat,
            boxStartPosition: chords[index].boxStartPosition,
            boxTimingBeat: chords[index].boxTimingBeat,
            boxLength: chords[index].boxLength,
            newBoxStartPosition: chords[index].newBoxStartPosition
          };
        });

        

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