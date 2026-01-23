import os
import time
import requests
import json
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path
from google.cloud import vision
from google.oauth2 import service_account

# --- 설정 ---
current_dir = Path(__file__).resolve().parent
env_path = current_dir.parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# 구글 키 파일 경로 (workers/ocr 폴더 내에 있다고 가정)
GOOGLE_KEY_PATH = current_dir / "service_account.json"

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Supabase 환경 변수 오류")
    exit()

if not GOOGLE_KEY_PATH.exists():
    print(f"❌ 구글 키 파일을 찾을 수 없습니다: {GOOGLE_KEY_PATH}")
    print("👉 구글 클라우드에서 JSON 키를 받아 'service_account.json'으로 저장하세요.")
    exit()

# --- 클라이언트 초기화 ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 구글 Vision 클라이언트 (JSON 키 파일로 인증)
credentials = service_account.Credentials.from_service_account_file(str(GOOGLE_KEY_PATH))
vision_client = vision.ImageAnnotatorClient(credentials=credentials)

print("🚀 Google Vision API 모드 준비 완료!")

def run_google_ocr(image_url):
    """Google Vision API를 사용하여 이미지에서 텍스트 추출"""
    try:
        # 1. 이미지 다운로드 (메모리에 저장)
        resp = requests.get(image_url)
        resp.raise_for_status()
        content = resp.content

        # 2. Vision API 요청 객체 생성
        image = vision.Image(content=content)

        # 3. 텍스트 감지 요청 (DOCUMENT_TEXT_DETECTION이 문서/포스터에 더 강력함)
        response = vision_client.document_text_detection(image=image)
        
        # 4. 결과 파싱
        full_text = response.full_text_annotation.text
        
        # (선택사항) 줄 단위로 리스트로 만들고 싶다면:
        text_lines = full_text.split('\n')
        
        # 빈 문자열 제거
        text_lines = [line.strip() for line in text_lines if line.strip()]
        
        return text_lines

    except Exception as e:
        print(f"⚠️ Google OCR 실패: {e}")
        return []

def process_staged_contents():
    print("🔄 [Google Vision] 작업 대기열 확인 중...")
    
    # ocr_status가 비어있는 항목 조회
    response = supabase.from_("staged_contents")\
        .select("*")\
        .is_("ocr_status", "null")\
        .in_("category", ["OFFICIAL_TIMETABLE", "OFFICIAL_LINEUP"])\
        .limit(3)\
        .execute() # .order('created_at', desc=True) 등을 추가해도 좋음
        
    items = response.data
    
    if not items:
        print("💤 처리할 데이터가 없습니다.")
        return

    for item in items:
        print(f"\nTarget: {item['raw_data'].get('festival_name')} ({item['category']})")
        
        raw_data = item['raw_data']
        image_list = raw_data.get('items', [])
        
        if not image_list and raw_data.get('image_url'):
            image_list = [{'url': raw_data['image_url']}]

        extracted_results = []

        for idx, img_obj in enumerate(image_list):
            url = img_obj.get('url')
            if not url: continue
            
            print(f"  Capture {idx+1}/{len(image_list)}: Google Vision 요청 중...")
            
            # --- Google Vision 실행 ---
            texts = run_google_ocr(url)
            # ------------------------
            
            if texts:
                extracted_results.append({
                    "image_index": idx,
                    "url": url,
                    "texts": texts,
                    "engine": "google_vision" # 나중에 뭘로 땄는지 확인용
                })
                print(f"  -> ✅ 텍스트 추출 성공 (약 {len(texts)} 라인)")
                # 미리보기
                print(f"     [첫줄]: {texts[0] if texts else ''}")
            else:
                print("  -> ⚠️ 텍스트 없음 또는 실패")

        # 결과 저장
        raw_data['ocr_result'] = extracted_results
        
        supabase.from_("staged_contents")\
            .update({
                "raw_data": raw_data,
                "ocr_status": "DONE"
            })\
            .eq("id", item['id'])\
            .execute()
            
        print(f"✅ DB 저장 완료 (ID: {item['id']})")

if __name__ == "__main__":
    while True:
        try:
            process_staged_contents()
        except Exception as e:
            print(f"❌ 치명적 에러: {e}")
        
        print("⏳ 10초 대기...")
        time.sleep(10)


# ==============================
#          EasyOCR 버전
# ==============================
# import os
# import time
# import requests
# import numpy as np
# import cv2
# import easyocr
# from supabase import create_client, Client
# from dotenv import load_dotenv
# from pathlib import Path

# # 1. Supabase 설정
# # 현재 파일(ocr_worker.py)의 위치를 기준으로 2단계 위(project root)의 .env.local을 찾습니다.
# current_dir = Path(__file__).resolve().parent
# env_path = current_dir.parent.parent / '.env.local'

# # 명시적으로 경로를 지정해서 로드
# load_dotenv(dotenv_path=env_path)

# SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # 관리자 키
# supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# # 2. EasyOCR 리더 초기화 (한번만 로딩)
# # GPU가 있으면 gpu=True, 없으면 gpu=False
# print("🚀 EasyOCR 모델 로딩 중... (시간이 좀 걸립니다)")
# reader = easyocr.Reader(['ko', 'en'], gpu=True) 
# print("✅ 모델 로딩 완료!")

# def download_image_as_np(url):
#     """URL에서 이미지를 다운로드하여 OpenCV 포맷(numpy array)으로 변환"""
#     try:
#         resp = requests.get(url, stream=True)
#         resp.raise_for_status()
#         image_array = np.asarray(bytearray(resp.content), dtype=np.uint8)
#         img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
#         return img
#     except Exception as e:
#         print(f"이미지 다운로드 실패: {e}")
#         return None

# def run_ocr_on_image(img_url):
#     """이미지 URL을 받아 텍스트 리스트를 반환"""
#     img = download_image_as_np(img_url)
#     if img is None:
#         return []
    
#     # detail=0: 텍스트만 리스트로 반환 (좌표 제외)
#     # paragraph=True: 문장 단위로 묶어서 추출 (선택사항)
#     result = reader.readtext(img, detail=0) 
#     return result

# def process_staged_contents():
#     print("🔄 작업 대기열 확인 중...")
    
#     # 3. DB에서 OCR 처리가 필요한 항목 조회
#     # 조건: status가 'PENDING'이고, 아직 'ocr_status'가 없는(또는 'READY'인) 항목
#     # 여기서는 편의상 raw_data->items가 존재하는 것들을 가져옵니다.
#     response = supabase.from_("staged_contents")\
#         .select("*")\
#         .is_("ocr_status", "null")\
#         .in_("category", ["OFFICIAL_TIMETABLE", "OFFICIAL_LINEUP"])\
#         .limit(5)\
#         .execute()
        
#     items = response.data
    
#     if not items:
#         print("💤 처리할 데이터가 없습니다.")
#         return

#     for item in items:
#         print(f"\nTarget: {item['raw_data'].get('festival_name')} ({item['category']})")
        
#         raw_data = item['raw_data']
#         image_list = raw_data.get('items', [])
        
#         # 만약 items가 비어있고 image_url만 있다면 그것을 처리
#         if not image_list and raw_data.get('image_url'):
#             image_list = [{'url': raw_data['image_url']}]

#         extracted_results = []

#         # 4. 이미지별 OCR 수행
#         for idx, img_obj in enumerate(image_list):
#             url = img_obj.get('url')
#             if not url: continue
            
#             print(f"  Capture {idx+1}/{len(image_list)}: OCR 수행 중...")
#             texts = run_ocr_on_image(url)
            
#             extracted_results.append({
#                 "image_index": idx,
#                 "url": url,
#                 "texts": texts
#             })
#             print(f"  -> 텍스트 {len(texts)}줄 추출됨")

#         # 5. 결과 DB 업데이트
#         # raw_data 안에 'ocr_result' 필드를 추가해서 저장하거나, 별도 컬럼에 저장
#         # 여기서는 raw_data를 업데이트하는 방식을 사용
#         raw_data['ocr_result'] = extracted_results
        
#         update_res = supabase.from_("staged_contents")\
#             .update({
#                 "raw_data": raw_data,
#                 "ocr_status": "DONE" # 처리 완료 표시
#             })\
#             .eq("id", item['id'])\
#             .execute()
            
#         print(f"✅ DB 업데이트 완료 (ID: {item['id']})")

# # 실행 루프
# if __name__ == "__main__":
#     while True:
#         try:
#             process_staged_contents()
#         except Exception as e:
#             print(f"❌ 에러 발생: {e}")
        
#         print("⏳ 10초 대기 후 재시작...")
#         time.sleep(10)