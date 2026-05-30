import { NextResponse } from "next/server";
import OpenAI from "openai";
import { chordProgressionSchema, getInstructions, getInputPrompt } from "./instructions";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { 
      scale, 
      previousResponseId, 
      numMeasures, 
      contextTracks, 
      currentInstrument, 
      chordCount,
      bpm
    } = await request.json();

    if (!scale) {
      return NextResponse.json(
        { error: "Scale is required in the request body" },
        { status: 400 }
      );
    }

    console.log("Requesting completion...");
    console.log("numMeasures:", numMeasures);
    // @ts-ignore - Using the custom responses API endpoint structure requested
    const response = await openai.responses.create({
      model: "gpt-4o-2024-08-06",
      ...(previousResponseId ? { previous_response_id: previousResponseId } : {}),
      instructions: getInstructions(numMeasures),
      input: getInputPrompt(scale, contextTracks, currentInstrument, chordCount, bpm),
      text: {
        format: chordProgressionSchema,
      },
    });

    // The Responses API returns the generated text in output_text
    const assistantMessage = (response as any).output_text ?? JSON.stringify(response);
    console.log("Response received:", assistantMessage);

    return NextResponse.json({
      message: assistantMessage,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
