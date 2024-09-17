import { AutoIncrementFieldType } from './auto-increment-field';

export type AutoIncrementConfigOptions = {
  fieldName: string;
  collectionName: string;
  start: number;
  prefix: string;
  suffix: string;
  incrementBy: number;
  fieldType: AutoIncrementFieldType;
};
