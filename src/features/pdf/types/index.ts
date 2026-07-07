export type CompressionLevel = 'high' | 'medium' | 'low';

export interface CompressionResult {
  uri: string;
  beforeBytes: number;
  afterBytes: number;
  pageCount: number;
}

export type WatermarkMode = 'single' | 'tile';

export interface WatermarkOptions {
  text: string;
  imageUri?: string; // when set, stamps an image instead of text
  opacity: number; // 0..1
  rotation: number; // degrees
  mode: WatermarkMode;
  fontSize: number;
}

export type SignatureKind = 'draw' | 'type' | 'image';

export interface SignatureInput {
  kind: SignatureKind;
  /** draw: SVG path data in the drawing view's coordinate space */
  pathData?: string;
  /** draw: dimensions of the drawing view the path was captured in */
  pathViewBox?: { width: number; height: number };
  /** type: the typed name */
  text?: string;
  /** image: local uri of an imported PNG/JPG signature */
  imageUri?: string;
}

/** Placement rect in page-relative coordinates (0..1, origin top-left) */
export interface PlacementRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PageThumb {
  uri: string;
  width: number;
  height: number;
}

export interface ToolOutput {
  fileId: string;
  uri: string;
  title: string;
  sizeBytes: number;
  pageCount: number;
}
