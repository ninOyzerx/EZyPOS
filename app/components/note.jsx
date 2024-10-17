// components/Note.js
import React, { useState } from 'react';

const Note = () => {
  const [note] = useState('Username: tester1\nPassword: 123'); // ล็อค note

  return (
    <div className="fixed right-4 bottom-4 bg-white shadow-lg rounded-lg p-4 w-64">
      <h2 className="font-bold text-lg mb-2 text-black">สำหรับผู้ทดสอบ</h2>
      <textarea
        className="w-full h-32 p-2 border rounded-lg bg-gray-100 text-black resize-none" // เพิ่ม resize-none เพื่อไม่ให้ขยาย
        placeholder="เขียนโน้ตของคุณที่นี่..."
        value={note}
        readOnly // ทำให้ไม่สามารถแก้ไขได้
      />
    </div>
  );
};

export default Note;
