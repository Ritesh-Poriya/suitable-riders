export type BackGroundType = BackGroundColorType | BackGroundBlurType;

export type BackGroundBlurType = {
  blur: number;
};

export type BackGroundColorType = {
  color: string;
};
export enum CropType {
  FIT = 'fit',
  FILL = 'fill',
}

export class SizeType {
  width: number;
  height: number;
}
