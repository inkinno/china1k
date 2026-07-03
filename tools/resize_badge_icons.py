#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
[천자문 마스터] 배지 아이콘 고품질 축소 및 픽셀아트 변환 자동화 스크립트 (icon_resizer.py)

기능:
  - 1000px 이상의 고해상도 생성 이미지(Krea-2 등)를 웹 앱에 최적화된 사이즈(256px, 128px 등)로 일괄 축소합니다.
  - 알파 채널(RGBA 투명도)을 완벽하게 보존합니다.
  - 'nearest'(최근접 이웃 보간법) 모드를 사용하여 칼같은 픽셀게임(Pixel Art) 느낌의 선명한 경계선을 보존할 수 있습니다.
  - 'lanczos' 모드로 부드럽고 깔끔한 일러스트 축소도 가능합니다.

사용법:
  python tools/resize_badge_icons.py --input assets/badges_raw --output assets/badges --size 256 --mode nearest

필요 라이브러리:
  pip install Pillow
"""

import os
import argparse
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("[오류] Pillow 라이브러리가 설치되어 있지 않습니다.")
    print("터미널에서 'pip install Pillow' 명령으로 설치해 주세요.")
    exit(1)


def resize_icons(input_dir: str, output_dir: str, target_size: int, mode: str):
    in_path = Path(input_dir)
    out_path = Path(output_dir)

    if not in_path.exists():
        print(f"[오류] 입력 폴더 '{input_dir}'가 존재하지 않습니다. 폴더를 생성하고 원본 이미지를 넣어주세요.")
        in_path.mkdir(parents=True, exist_ok=True)
        return

    out_path.mkdir(parents=True, exist_ok=True)

    # 보간법 선택
    resample_mode = Image.Resampling.NEAREST if mode.lower() == 'nearest' else Image.Resampling.LANCZOS
    mode_name = "칼같은 픽셀게임 (Nearest Neighbor)" if mode.lower() == 'nearest' else "고품질 부드러운 보간 (Lanczos)"

    print(f"==================================================")
    print(f" [천자문 마스터] 아이콘 자동 리사이징 파이프라인")
    print(f"==================================================")
    print(f" - 입력 폴더: {in_path.resolve()}")
    print(f" - 출력 폴더: {out_path.resolve()}")
    print(f" - 목표 크기: {target_size} x {target_size} px (1:1 정방형)")
    print(f" - 축소 모드: {mode_name}")
    print(f"==================================================\n")

    supported_exts = {'.png', '.jpg', '.jpeg', '.webp'}
    image_files = [f for f in in_path.iterdir() if f.suffix.lower() in supported_exts]

    if not image_files:
        print(f"[알림] '{input_dir}' 폴더에 변환할 이미지 파일(png, jpg, webp)이 없습니다.")
        return

    success_count = 0
    for img_file in image_files:
        try:
            with Image.open(img_file) as img:
                # RGBA 알파 채널 보존 모드로 변환
                img_rgba = img.convert("RGBA")
                
                # 1:1 정방형 비율 맞추기 (중앙 크롭 후 리사이징)
                width, height = img_rgba.size
                if width != height:
                    min_dim = min(width, height)
                    left = (width - min_dim) // 2
                    top = (height - min_dim) // 2
                    right = left + min_dim
                    bottom = top + min_dim
                    img_rgba = img_rgba.crop((left, top, right, bottom))
                
                # 목표 크기로 축소
                resized_img = img_rgba.resize((target_size, target_size), resample_mode)
                
                # 출력 파일명 지정 (.png 확장자로 통일하여 투명도 보존)
                out_filename = out_path / f"{img_file.stem}.png"
                resized_img.save(out_filename, "PNG", optimize=True)
                print(f" [성공] {img_file.name} ({width}x{height}) -> {out_filename.name} ({target_size}x{target_size})")
                success_count += 1
        except Exception as e:
            print(f" [실패] {img_file.name} 변환 중 오류: {e}")

    print(f"\n==================================================")
    print(f" [완료] 총 {len(image_files)}개 중 {success_count}개 파일 변환 성공!")
    print(f"==================================================")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="배지 아이콘 축소 및 픽셀아트 변환 툴")
    parser.add_argument("-i", "--input", default="assets/badges_raw", help="원본 이미지 폴더 경로 (기본: assets/badges_raw)")
    parser.add_argument("-o", "--output", default="assets/badges", help="변환 완료된 아이콘 저장 폴더 (기본: assets/badges)")
    parser.add_argument("-s", "--size", type=int, default=256, help="출력 아이콘 픽셀 크기 (기본: 256, 예: 128, 256, 512)")
    parser.add_argument("-m", "--mode", choices=['nearest', 'lanczos'], default='nearest', help="축소 모드: 'nearest'(픽셀 느낌) 또는 'lanczos'(부드러운 일러스트)")
    
    args = parser.parse_args()
    resize_icons(args.input, args.output, args.size, args.mode)
