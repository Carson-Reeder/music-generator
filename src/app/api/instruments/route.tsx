import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const knowNotes: Record<string, [string, string]> = {
  "bass-electric": ["E1", "G1"],
  bassoon: ["A2", "C3"],
  cello: ["A2", "B2"],
  clarinet: ["D3", "F3"],
};

// Read instruments folder and create an object with the instrument name and its samples
export async function GET() {
  const instrumentFolder = path.join(process.cwd(), "public/instruments");
  const instruments = fs
    .readdirSync(instrumentFolder)
    .filter((file) =>
      fs.statSync(path.join(instrumentFolder, file)).isDirectory()
    ); // Filter out folders, use only files

  const instrumentMapping = instruments.reduce(
    (acc: any[], instruments, index) => {
      const instrumentPath = path.join(instrumentFolder, instruments);
      const files = fs
        .readdirSync(instrumentPath)
        .filter((file) => file.endsWith(".wav") || file.endsWith(".mp3")) // Only accept .wav or .mp3 files
        .map((file) => ({
          name: file.replace(/\.(wav|mp3)$/, ""), // Remove .wav or .mp3 extension
        }));

      acc.push({
        id: index + 1,
        name: instruments,
        samples: files,
        knownNotes: knowNotes[instruments] || ["Unknown", "Unknown"], // Use the known notes if available
      });

      return acc;
    },
    [] as {
      id: number;
      name: string;
      samples: string[];
      knownNotes: [string, string];
    }[]
  );

  return NextResponse.json(instrumentMapping);
}
