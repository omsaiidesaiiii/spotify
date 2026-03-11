
export const formatTrack = (song: any) => {
  const dlArray = song.downloadUrl || [];
  const hqUrlInfo = dlArray.find((u: any) => u.quality === '320kbps') || dlArray[dlArray.length - 1];
  
  const imgArray = song.image || [];
  const hqImgInfo = imgArray.find((img: any) => img.quality === '500x500') || imgArray[imgArray.length - 1];

  return {
    id: song.id,
    title: song.name || song.title,
    artist: song.primaryArtists || song.subtitle || 'Unknown Artist',
    image: hqImgInfo ? hqImgInfo.url : '',
    url: hqUrlInfo ? hqUrlInfo.url : '',
  };
};

export const formatCollection = (item: any) => {
  const imgArray = item.image || [];
  const hqImgInfo = imgArray.find((img: any) => img.quality === '500x500') || imgArray[imgArray.length - 1];

  return {
    id: item.id,
    title: item.title || item.name,
    subtitle: item.subtitle || item.description || '',
    image: hqImgInfo ? hqImgInfo.url : '',
    type: item.type || 'playlist'
  };
};
