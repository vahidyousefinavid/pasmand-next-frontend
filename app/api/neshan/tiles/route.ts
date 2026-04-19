import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const apiKey = process.env.NESHAN_MAP_KEY;

  const { searchParams } = new URL(req.url);
  const z = searchParams.get("z");
  const x = searchParams.get("x");
  const y = searchParams.get("y");

  const url = `https://api.neshan.org/v4/tiles/${z}/${x}/${y}`;
  const resp = await fetch(url, {
    headers: {
      "Api-Key": apiKey!,
    },
  });

  const buffer = await resp.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=604800",
    },
  });
}
