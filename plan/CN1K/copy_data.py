import os
import shutil

def copy_and_convert_data():
    src_modeling = r'c:\ai\apps\0_inkinno\01_sitesnew\china1k\plan\CN1K\modeling.txt'
    src_word = r'c:\ai\apps\0_inkinno\01_sitesnew\china1k\plan\CN1K\word_modeling.txt'
    
    dest_dir = r'c:\ai\apps\0_inkinno\01_sitesnew\china1k\js\data'
    os.makedirs(dest_dir, exist_ok=True)
    
    dest_modeling = os.path.join(dest_dir, 'chunja_data.js')
    dest_word = os.path.join(dest_dir, 'word_data.js')
    
    # 1. modeling.txt를 chunja_data.js로 복사 및 가공
    with open(src_modeling, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 혹시 모를 찌꺼기나 에러 유발 줄 제거 후 정제된 모듈 데이터 쓰기
    with open(dest_modeling, 'w', encoding='utf-8') as f:
        f.write("// 정제된 천자문 한자 데이터 모듈 (ESM)\n")
        f.write(content)
        
    print(f"Copied and converted {src_modeling} to {dest_modeling}")
    
    # 2. word_modeling.txt를 word_data.js로 복사
    shutil.copy2(src_word, dest_word)
    print(f"Copied {src_word} to {dest_word}")
    
    # 3. 데이터 로드를 편하게 돕는 통합 엔트리포인트 js/data/index.js 생성
    dest_index = os.path.join(dest_dir, 'index.js')
    with open(dest_index, 'w', encoding='utf-8') as f:
        f.write("""// 천자문 및 실생활 단어 데이터 통합 ESM Entrypoint
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
""")
    print(f"Created integrated data entrypoint at {dest_index}")

if __name__ == "__main__":
    copy_and_convert_data()
