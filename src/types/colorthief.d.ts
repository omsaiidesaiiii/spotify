declare module 'colorthief' {
  export const getColor: (sourceImage: HTMLImageElement | null, quality?: number) => [number, number, number];
  export const getPalette: (sourceImage: HTMLImageElement | null, colorCount?: number, quality?: number) => [number, number, number][];
}
