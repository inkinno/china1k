// 천자문 및 실생활 단어 데이터 통합 ESM Entrypoint
import * as chunjaData from './chunja_data.js';
import { CHUNJA_WORD_DATA } from './word_data.js';

// PART 1~10 데이터를 하나의 배열로 병합
export const ALL_CHUNJA_DATA = [
  ...chunjaData.CHUNJA_DATA_PART_1,
  ...chunjaData.CHUNJA_DATA_PART_2,
  ...chunjaData.CHUNJA_DATA_PART_3,
  ...chunjaData.CHUNJA_DATA_PART_4,
  ...chunjaData.CHUNJA_DATA_PART_5,
  ...chunjaData.CHUNJA_DATA_PART_6,
  ...chunjaData.CHUNJA_DATA_PART_7,
  ...chunjaData.CHUNJA_DATA_PART_8,
  ...chunjaData.CHUNJA_DATA_PART_9,
  ...chunjaData.CHUNJA_DATA_PART_10
];

export const ALL_WORD_DATA = CHUNJA_WORD_DATA;
