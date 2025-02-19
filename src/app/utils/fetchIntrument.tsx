import * as Tone from "tone";

function instrumentToName(instrument: string) {
  switch (instrument) {
    case "1":
      return ["bass-electric", "E1", "G1"];
    case "2":
      return ["bassoon", "A2", "C3"];
    case "3":
      return ["cello", "A2", "B2"];
    case "4":
      return ["clarinet", "D3", "F3"];
    default:
      return ["bass-electric", "E1", "G1"];
  }
}

export default function (instrument: string) {
  const [instrumentName, note1, note2] = instrumentToName(instrument);
  const gainNode = new Tone.Gain(0.5);
  const sampler = new Tone.Sampler({
    urls: {
      [note1]: `${instrumentName}/${note1}.mp3`,
      [note2]: `${instrumentName}/${note2}.mp3`,
    },
    baseUrl: "Instruments/",
    onload: () => {
      sampler.triggerAttackRelease(["C4", "E3", "G2", "B1"], 0.25, 0, 0.25); // Play a chord to test the sampler
    },
  })
    .connect(gainNode)
    .toDestination();

  return sampler;
}
