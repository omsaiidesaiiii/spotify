import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Aggregating data from search endpoints since /modules is not available
    const [trendingRes, playlistsRes, chartsRes] = await Promise.all([
      fetch('https://saavn.sumit.co/api/search/songs?query=Top%20Hits&limit=15'),
      fetch('https://saavn.sumit.co/api/search/playlists?query=Popular%20Music&limit=10'),
      fetch('https://saavn.sumit.co/api/search/playlists?query=Top%20Weekly%20Charts&limit=10')
    ]);

    const [trending, playlists, charts] = await Promise.all([
      trendingRes.json(),
      playlistsRes.json(),
      chartsRes.json()
    ]);

    // Consolidate into the HomeData interface our UI expects
    return NextResponse.json({
      success: true,
      data: {
        trending: {
          songs: trending.data?.results || [],
          albums: [] 
        },
        playlists: playlists.data?.results || [],
        charts: charts.data?.results || []
      }
    });

  } catch (error) {
    console.error('Aggregated Home API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to aggregate home data' 
    }, { status: 500 });
  }
}
