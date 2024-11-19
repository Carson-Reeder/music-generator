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

        return {parsedChords, parsedId, parsedMessage };

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