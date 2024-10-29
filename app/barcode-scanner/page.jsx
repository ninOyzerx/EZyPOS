'use client';
import { BrowserMultiFormatReader } from '@zxing/library';
import { useEffect, useRef } from 'react';
import './styles.css';

const BarcodeScanner = () => {
  const videoRef = useRef(null); // สร้าง videoRef เพื่อเชื่อมต่อกับ <video> element
  const codeReader = useRef(new BrowserMultiFormatReader()); // สร้าง codeReader ที่เป็น ref

  useEffect(() => {
    // ตรวจสอบว่า videoRef.current ถูกสร้างหรือไม่
    if (navigator.mediaDevices && videoRef.current) {
      // กำหนดค่ากล้องสำหรับสแกนบาร์โค้ด
      navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // ใช้กล้องหลัง
          width: { ideal: 1280 },    // ความละเอียดสูงสุดที่เราต้องการ
          height: { ideal: 720 },    // ความละเอียดสูงสุดที่เราต้องการ
        }
      })
      .then((stream) => {
        videoRef.current.srcObject = stream;

        // ใช้ฟังก์ชัน decodeContinuously
        codeReader.current.decodeFromVideoDevice(null, videoRef.current, (result) => {
          if (result) {
            console.log('บาร์โค้ดที่สแกนได้:', result.getText());
            window.opener.postMessage({ barcode: result.getText() }, '*');
            // สามารถทำการสแกนต่อเนื่องได้โดยไม่ต้องปิด
          }
        })
        .catch((err) => {
          if (err && err.name !== 'NotFoundException') {
            console.error('Error during scanning:', err);
          }
        });
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
        alert('ไม่สามารถเข้าถึงกล้องได้ กรุณาลองใหม่อีกครั้ง');
      });
    } else {
      console.error('getUserMedia is not supported by this browser.');
      alert('เบราว์เซอร์ของคุณไม่รองรับการสแกนบาร์โค้ด กรุณาใช้เบราว์เซอร์อื่น');
    }

    // คืนค่าหน้าจอและหยุดการสแกนเมื่อ component ถูกปิด
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  return (
    <div className="scanner-container">
      {/* <h2>กำลังสแกนบาร์โค้ด...</h2> */}
      <div className="scanner-frame">
        <video ref={videoRef} className="viewport" autoPlay></video> 
        <div className="scanner-line"></div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
