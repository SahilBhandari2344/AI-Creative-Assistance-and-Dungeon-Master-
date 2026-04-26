// src/app/api/dm-chat/route.ts
//
// This route is kept for compatibility but is no longer the AI entry point.
// The frontend now calls the FastAPI /chat endpoint directly via src/lib/api.ts.
// This file can be removed once the migration is confirmed stable.

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error:
        'This route is deprecated. The frontend now calls the FastAPI backend directly. ' +
        'See src/lib/api.ts and NEXT_PUBLIC_API_URL.',
    },
    { status: 410 }
  );
}
