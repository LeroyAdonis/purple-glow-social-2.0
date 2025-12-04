import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
    console.log('[Dynamic Route] Hit:', params.slug);
    return NextResponse.json({ slug: params.slug });
}
