import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const knownNotes: Record<string, [string, string, string]> = {
  "bass-electric": ["E2", "E3", "E4"],
  bassoon: ["A2", "A3", "A4"],
  cello: ["A2", "A3", "A4"],
  clarinet: ["D3", "D4", "D5"],
  "french-horn": ["A1", "C2", "C4"],
  saxophone: ["B3", "B4", "C5"],
  trombone: ["F2", "C3", "C4"],
  trumpet: ["A3", "C4", "D5"],
  tuba: ["F2", "F3", "D4"],
  harmonium: ["C2", "C3", "C4"],
  flute: ["C4", "C5", "C6"],
};

// Read instruments folder and create an object with the instrument name and its samples
export async function GET() {
  const instrumentFolder = path.join(process.cwd(), "public/instruments");

  // Get category folders, strings, brass, etc.
  const categories = fs
    .readdirSync(instrumentFolder)
    .filter((item) =>
      fs.statSync(path.join(instrumentFolder, item)).isDirectory()
    ); // Ensure it's a directory

  let instrumentMapping: {
    id: number;
    category: string;
    name: string;
    //samples: { name: string }[];
    knownNotes: [string, string, string];
  }[] = [];

  let idCounter = 1;

  categories.forEach((category) => {
    const categoryPath = path.join(instrumentFolder, category);

    // Get instruments inside the category folder
    const instruments = fs
      .readdirSync(categoryPath)
      .filter((item) =>
        fs.statSync(path.join(categoryPath, item)).isDirectory()
      );

    instruments.forEach((instrument) => {
      const instrumentPath = path.join(categoryPath, instrument);

      // Get sample files inside the instrument folder
      const files = fs
        .readdirSync(instrumentPath)
        .filter((file) => file.endsWith(".wav") || file.endsWith(".mp3"))
        .map((file) => ({
          name: file.replace(/\.(wav|mp3)$/, ""), // Remove extension
        }));

      instrumentMapping.push({
        id: idCounter++,
        category,
        name: instrument,
        //samples: files,
        knownNotes: knownNotes[instrument] || ["Unknown"],
      });
    });
  });

  return NextResponse.json(instrumentMapping);
}
