import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.success && data.data && data.data.results) {
      const results = data.data.results.map((song: any) => {
        const dlArray = song.downloadUrl || [];
        const hqUrlInfo = dlArray.find((u: any) => u.quality === '320kbps') || dlArray[dlArray.length - 1];
        
        const imgArray = song.image || [];
        const hqImgInfo = imgArray.find((img: any) => img.quality === '500x500') || imgArray[imgArray.length - 1];

        return {
          id: song.id,
          title: song.name,
          artist: song.primaryArtists,
          image: hqImgInfo ? hqImgInfo.url : '',
          url: hqUrlInfo ? hqUrlInfo.url : '',
        };
      });

      return NextResponse.json({ results });
    }

    return NextResponse.json({ results: [] });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
