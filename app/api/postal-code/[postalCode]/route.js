import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ฟังก์ชันดึงข้อมูลจากไฟล์ db.json
export async function GET(request, { params }) {
  const { postalCode } = params;

  try {
    const filePath = path.join(process.cwd(), 'public', 'postal-db.json');
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const postalData = JSON.parse(jsonData);

    // ตรวจสอบว่าข้อมูลมีโครงสร้างที่ต้องการหรือไม่
    if (!postalData || !postalData.data || !Array.isArray(postalData.data)) {
      return NextResponse.json({ message: 'Invalid data structure' }, { status: 500 });
    }

    // ค้นหา postalCode ใน jsonData
    const result = postalData.data.find(
      (entry) => entry.zipcode === parseInt(postalCode, 10)
    );

    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (!result) {
      return NextResponse.json({ message: 'Postal Code not found' }, { status: 404 });
    }

    // ส่งข้อมูลจังหวัด อำเภอ และตำบล กลับไป
    return NextResponse.json({
      district: result.district,
      amphoe: result.amphoe,
      province: result.province,
      zipcode: result.zipcode,
      district_code: result.district_code,
      amphoe_code: result.amphoe_code,
      province_code: result.province_code,
    });

  } catch (error) {
    console.error('Error fetching postal code data:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
