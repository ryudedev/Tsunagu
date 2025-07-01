import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const queryParam = request.nextUrl.searchParams
    const code = queryParam.get('code');
    const state = queryParam.get('state')
    console.log(code, state);
    return NextResponse.json({message: 'successful'})
}