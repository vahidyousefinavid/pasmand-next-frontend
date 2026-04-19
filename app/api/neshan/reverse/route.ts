import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const apiKey = process.env.NESHAN_MAP_KEY;

  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const url = `https://api.neshan.org/v5/reverse?lat=${lat}&lng=${lng}`;

  const resp = await fetch(url, {
    headers: {
      "Api-Key": apiKey!,
    },
  });

  const json = await resp.json();
  return NextResponse.json(json);
}
