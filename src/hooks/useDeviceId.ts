'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    // 1. 로컬 스토리지 확인
    let id = localStorage.getItem('wavy_device_id');
    
    // 2. 없으면 새로 생성해서 저장
    if (!id) {
      id = uuidv4();
      localStorage.setItem('wavy_device_id', id);
    }
    
    setDeviceId(id);
  }, []);

  return deviceId;
}