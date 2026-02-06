import { NextRequest, NextResponse } from 'next/server'

const WILAYAH_BASE = 'https://wilayah.id/api'

/**
 * Proxy ke API wilayah.id untuk menghindari CORS saat fetch dari browser.
 * GET /api/wilayah/provinces.json -> https://wilayah.id/api/provinces.json
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const slug = path.join('/')
  const url = `${WILAYAH_BASE}/${slug}`

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json(
      { error: 'Gagal mengambil data wilayah' },
      { status: 502 }
    )
  }
}
