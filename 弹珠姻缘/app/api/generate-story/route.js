import { NextResponse } from "next/server";
import { generateStory } from "../../../lib/stepfunClient.js";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isCharacterLike(body?.cue) || !isCharacterLike(body?.target)) {
    return NextResponse.json({ error: "Missing cue or target character" }, { status: 400 });
  }

  try {
    const archive = await generateStory({
      cue: body.cue,
      target: body.target,
      hitCount: Number(body.hitCount || 0),
      tieBreak: Boolean(body.tieBreak),
      noHit: Boolean(body.noHit)
    });
    return NextResponse.json(archive);
  } catch (error) {
    return NextResponse.json({ error: "Story generation failed" }, { status: 502 });
  }
}

function isCharacterLike(value) {
  return Boolean(value?.name && value?.source && value?.tag);
}
