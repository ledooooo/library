// admin/page.js (Simplified Logic)
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      setUploading(true);
      // استخدام upsert لمنع التكرار بناءً على الـ file_url
      const { error } = await supabase.from('documents').upsert(json, { onConflict: 'file_url' });
      
      if (error) alert("خطأ في الرفع: " + error.message);
      else alert("تم رفع البيانات بنجاح");
      setUploading(false);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-4 dir-rtl text-right">
      <h1 className="text-xl font-bold mb-4">لوحة إدارة المكتبة</h1>
      <div className="border-dashed border-2 p-6 rounded-lg text-center">
        <input type="file" onChange={handleFileUpload} accept=".xlsx, .csv" className="hidden" id="excel-up" />
        <label htmlFor="excel-up" className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded">
          {uploading ? "جاري الرفع..." : "رفع ملف إكسيل جديد"}
        </label>
      </div>
      {/* هنا تضع فورم الإضافة اليدوية البسيطة */}
    </div>
  );
}
