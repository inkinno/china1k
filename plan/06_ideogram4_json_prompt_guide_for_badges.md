# [개념 설계서 6] Ideogram 4.0 구조화된 JSON 프롬프트 가이드 및 배지 제작 예시

## 1. 개요 및 제작 목적
본 문서는 최신 **Ideogram 4.0** 모델을 활용하여 <천자문 마스터>의 100대 업적 배지 및 아이콘 에셋을 생성하기 위한 전용 JSON 프롬프트 가이드입니다.

Ideogram 4.0은 일반 텍스트가 아닌 **구조화된 JSON 스키마(Scene Summary, Style Block, Background, Object Bounding Box & Hex Color Palette)**를 기반으로 학습된 모델입니다. 
특히 일반 텍스트(Plain-text) 프롬프트 입력 시 내장된 안전 필터(Safety Filter)에 의해 오탐(False-positive)으로 차단될 확률이 높으나, **구조화된 JSON 프롬프트를 사용할 경우 안전 필터 차단율을 획기적으로 낮추면서 칼같은 레이아웃과 완벽한 색상 통제(Hex Color)가 가능**합니다.

본 가이드는 Ideogram 4.0의 문법 중 배지 아이콘 생성에 **꼭 필요한 핵심 파트만 발췌·최적화**하여, `js/data/badges.js`에 명시된 파일명으로 바로 생성할 수 있는 실전 JSON 프롬프트 세트를 제공합니다.

---

## 2. Ideogram 4.0 배지 아이콘 표준 JSON 스키마 구조
천자문 마스터의 배지 아이콘(1:1 정방형 1024x1024 기준) 생성을 위해 최적화된 마스터 JSON 템플릿입니다. 
바운딩 박스(`bbox`)는 `[ymin, xmin, ymax, xmax]` (0~1000 정규화 좌표) 규칙을 따르며, 아이콘 특성상 **중앙 집중형(Centered Emblem) 레이아웃**을 표준으로 합니다.

```json
{
  "high_level_description": "전체 장면의 명확한 요약문 (영문)",
  "style_description": {
    "aesthetics": "전체적인 미학 스타일 (예: 3D 게임 아이콘, 캘리그라피 믹스미디어)",
    "lighting": "조명 연출 (예: 부드러운 스튜디오 조명, 황금빛 아우라 발광)",
    "photo": "렌더링 질감 (예: 매끄러운 3D 옥돌 질감, 선명한 마커 잉크)",
    "medium": "매체 종류 (예: 3D Digital Icon Illustration, Mixed-Media)",
    "color_palette": ["#HEX코드1", "#HEX코드2", "#HEX코드3", "#HEX코드4", "#HEX코드5"]
  },
  "compositional_deconstruction": {
    "background": "배경 설명 (아이콘 분리를 위해 렌더링하기 쉬운 단색 또는 옅은 오라 배경 추천)",
    "elements": [
      {
        "type": "obj",
        "bbox": [150, 150, 850, 850],
        "desc": "중앙에 위치할 핵심 배지 아이콘 사물에 대한 상세 설명",
        "color_palette": ["#HEX코드1", "#HEX코드2"]
      },
      {
        "type": "obj",
        "bbox": [50, 50, 950, 950],
        "desc": "(선택사항) 배지 외곽을 감싸는 이펙트, 잉크 스플래시 또는 후광 장식",
        "color_palette": ["#HEX코드3"]
      }
    ]
  }
}
```

---

## 3. 분야별 핵심 배지 Ideogram 4.0 실전 JSON 프롬프트

### 🌱 [1] 입문 학도 (First Step) - 진도 업적
*   **파일명**: `badge_first_step.png` (대상 크기: 256x256 px)
*   **복사용 JSON 프롬프트**:
```json
{
  "high_level_description": "A vibrant 3D stylized game badge icon featuring a luminous jade seedling growing out of an ancient opened bamboo scroll, surrounded by dynamic black calligraphy ink splashes.",
  "style_description": {
    "aesthetics": "Modern mobile game achievement icon mixed with traditional Korean ink-wash brush art, sharp clean edges, high-contrast digital illustration.",
    "lighting": "Soft studio rim lighting on the bamboo scroll with an intense magical green inner glow radiating from the jade seedling.",
    "photo": "Clean 3D render with crisp hand-drawn black ink calligraphy textures.",
    "medium": "3D Digital Icon Illustration",
    "color_palette": ["#10B981", "#F59E0B", "#1E293B", "#ECFDF5", "#FFFFFF"]
  },
  "compositional_deconstruction": {
    "background": "A solid, clean neutral white background (#FFFFFF) with a very faint sage-green radial glow at the center.",
    "elements": [
      {
        "type": "obj",
        "bbox": [200, 200, 800, 800],
        "desc": "An ancient bamboo scroll unfurled horizontally, made of rich golden-brown wooden slats tied with silk thread. From the center of the scroll sprouts a brilliant, translucent green jade seedling with three glowing leaves.",
        "color_palette": ["#F59E0B", "#10B981", "#047857"]
      },
      {
        "type": "obj",
        "bbox": [100, 100, 900, 900],
        "desc": "Whimsical black calligraphy ink drops and brushstroke circles orbiting around the seedling like satellites, adding an energetic artistic flair.",
        "color_palette": ["#1E293B", "#0F172A"]
      }
    ]
  }
}
```

---

### 🔥 [2] 일주일의 기적 (7 Days Streak) - 연속 출석 업적
*   **파일명**: `badge_streak_7.png` (대상 크기: 256x256 px)
*   **복사용 JSON 프롬프트**:
```json
{
  "high_level_description": "A dynamic game emblem icon depicting a roaring sacred campfire made of seven stacked wooden logs, with playful calligraphy ink flames spiraling upward.",
  "style_description": {
    "aesthetics": "Polished game UI badge, stylized flame rendering, vivid color saturation, bold outlines with traditional brushstroke overlays.",
    "lighting": "Intense fiery orange and crimson luminescence casting warm highlights on the dark wooden logs.",
    "photo": "Smooth 3D digital rendering combined with sharp graphic comic-style ink outlines.",
    "medium": "Digital UI Emblem Artwork",
    "color_palette": ["#FF5722", "#FF9800", "#795548", "#1A1A1A", "#FFF3E0"]
  },
  "compositional_deconstruction": {
    "background": "A solid crisp white background (#FFFFFF) contrasting against the warm glow of the fire.",
    "elements": [
      {
        "type": "obj",
        "bbox": [550, 200, 850, 800],
        "desc": "Seven neatly stacked dark oak wooden logs arranged in a traditional campfire structure, showing detailed wood grain and glowing red embers inside.",
        "color_palette": ["#795548", "#3E2723", "#FF5722"]
      },
      {
        "type": "obj",
        "bbox": [120, 250, 700, 750],
        "desc": "A stylized, soaring flame bursting upward from the logs, transitioning from brilliant yellow at the base to fiery crimson at the tips, interwoven with dynamic black ink-brush wind swirls.",
        "color_palette": ["#FF9800", "#FF5722", "#1A1A1A"]
      }
    ]
  }
}
```

---

### ⚡ [3] 폭풍의 콤보 (30 Combo Streak) - 시험 정확도 업적
*   **파일명**: `badge_combo_30.png` (대상 크기: 256x256 px)
*   **복사용 JSON 프롬프트**:
```json
{
  "high_level_description": "An electrifying gaming badge showing a classical golden archery target struck right in the bullseye by a brilliant blue lightning bolt, with graffiti calligraphy effects.",
  "style_description": {
    "aesthetics": "High-voltage action game icon, metallic gold reflections, neon electricity effects mixed with urban calligraphy speed lines.",
    "lighting": "Vibrant blue neon flash lighting reflecting off the metallic golden rings of the target.",
    "photo": "Hyper-clean 3D vector style rendering with luminous particle effects.",
    "medium": "3D Action Game UI Icon",
    "color_palette": ["#3B82F6", "#60A5FA", "#EAB308", "#1E3A8A", "#FFFFFF"]
  },
  "compositional_deconstruction": {
    "background": "A clean white background (#FFFFFF) with subtle electric blue voltage discharge lines fading into transparency.",
    "elements": [
      {
        "type": "obj",
        "bbox": [250, 250, 750, 750],
        "desc": "A thick, metallic golden circular archery target with intricate Asian engraving patterns on its concentric rings. The center bullseye is glowing white-hot from impact.",
        "color_palette": ["#EAB308", "#CA8A04", "#FFFFFF"]
      },
      {
        "type": "obj",
        "bbox": [80, 200, 850, 800],
        "desc": "A massive, jagged electric blue lightning bolt diagonally piercing the center of the target from top-right to bottom-left, generating sharp electric sparks and dynamic ink speed lines.",
        "color_palette": ["#3B82F6", "#60A5FA", "#1E3A8A"]
      }
    ]
  }
}
```

---

### 👑 [4] 천자문 마스터 리그 (Master League Reached) - 리그 최고 명예 업적
*   **파일명**: `badge_league_master.png` (대상 크기: 256x256 px)
*   **복사용 JSON 프롬프트**:
```json
{
  "high_level_description": "A supreme regal championship badge featuring an ornate traditional Korean royal crown (Myeonryu-gwan) crafted from gold and violet jade, floating above a glowing purple plasma aura.",
  "style_description": {
    "aesthetics": "Royal emperor grade game emblem, luxurious material contrast between polished gold and translucent purple jade, regal calligraphy ribbon framing.",
    "lighting": "Majestic top-down museum illumination with a rich violet bioluminescent aura radiating from within the crown.",
    "photo": "Masterpiece tier 3D icon rendering with flawless reflection and refractive jade textures.",
    "medium": "3D Luxury Game UI Trophy",
    "color_palette": ["#A855F7", "#D97706", "#4C1D95", "#FDE047", "#FFFFFF"]
  },
  "compositional_deconstruction": {
    "background": "A pure white background (#FFFFFF) to highlight the rich royal purple and gold contrast of the crown.",
    "elements": [
      {
        "type": "obj",
        "bbox": [200, 150, 800, 850],
        "desc": "An elaborate imperial Asian crown featuring polished golden dragon crests and hanging strings of glowing purple jade beads. The craftsmanship is pristine and imposing.",
        "color_palette": ["#D97706", "#FDE047", "#A855F7"]
      },
      {
        "type": "obj",
        "bbox": [150, 100, 850, 900],
        "desc": "A mystical violet plasma ring and traditional calligraphy cloud patterns orbiting horizontally around the base of the crown, symbolizing supreme intellectual authority.",
        "color_palette": ["#4C1D95", "#A855F7"]
      }
    ]
  }
}
```

---

### 🦅 [5] 칠전팔기 불사조 (Seven Fall, Eight Rise) - 히든 꿀잼 업적
*   **파일명**: `badge_seven_fall.png` (대상 크기: 256x256 px)
*   **복사용 JSON 프롬프트**:
```json
{
  "high_level_description": "A humorous yet triumphant game badge showing a cute, chubby red phoenix chick wearing first-aid bandages on its wings, rising proudly from a pile of crumpled test papers.",
  "style_description": {
    "aesthetics": "Playful cartoon 3D character icon, expressive anime-style emotion, clean comic ink outlines mixed with soft clay-like 3D shading.",
    "lighting": "Bright, cheerful morning lighting with a warm heroic spotlight shining directly on the phoenix chick.",
    "photo": "Crisp 3D character illustration with delightful playful details and expressive doodle effects.",
    "medium": "3D Playful Character UI Badge",
    "color_palette": ["#F43F5E", "#FB923C", "#E2E8F0", "#1E293B", "#FFFFFF"]
  },
  "compositional_deconstruction": {
    "background": "A clean white background (#FFFFFF) with small cheerful orange sparkle bursts.",
    "elements": [
      {
        "type": "obj",
        "bbox": [650, 200, 900, 800],
        "desc": "A messy pile of crumpled, discarded white calligraphy paper sheets marked with red X stamps and ink smudges, representing past failed quiz attempts.",
        "color_palette": ["#E2E8F0", "#94A3B8", "#F43F5E"]
      },
      {
        "type": "obj",
        "bbox": [150, 250, 700, 750],
        "desc": "A determined, adorable baby red phoenix bird emerging victoriously from the paper pile. It has white first-aid cross bandages taped to its cheek and wing, but its eyes burn with passion and small flames sprout from its tail.",
        "color_palette": ["#F43F5E", "#FB923C", "#FFFFFF"]
      }
    ]
  }
}
```

---

## 4. 생성 후 자동 축소 및 프로젝트 적용 절차
1.  **Ideogram 4.0 생성**: 위 JSON 코드 블록 전체를 복사하여 Ideogram 4.0 입력창(또는 ComfyUI JSON Subgraph 노드)에 붙여넣고 이미지를 생성합니다.
2.  **원본 다운로드 및 저장**: 생성된 고해상도(1000px 이상) 이미지를 다운로드하여 `assets/badges_raw/` 폴더에 각각의 지정된 파일명(예: `badge_first_step.png`)으로 저장합니다.
3.  **파이썬 툴로 1초 리사이징 (칼같은 픽셀 모드)**:
    터미널에서 아래 명령어를 실행하면, 웹 앱에 최적화된 **256x256 px 사이즈로 알파 채널 손실 없이 즉시 축소 변환**되어 `assets/badges/` 폴더로 이동합니다.
    ```cmd
    python tools/resize_badge_icons.py --input assets/badges_raw --output assets/badges --size 256 --mode nearest
    ```
4.  **자동 렌더링 확인**: 앱(`js/data/badges.js`)이 `assets/badges/` 폴더 내 해당 파일의 존재를 즉시 감지하여, 기본 이모지 SVG 대신 AI가 만든 최고급 배지 아이콘을 화면에 렌더링합니다!
