"use client";
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import * as XLSX from 'xlsx';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      setLoading(true);
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);

      const { error } = await supabase.from('documents').upsert(data, { onConflict: 'file_url' });
      
      if (error) alert("حدث خطأ: " + error.message);
      else alert("تم رفع البيانات وتحديثها بنجاح!");
      setLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-right" dir="rtl">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">لوحة الإدارة</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-dashed border-blue-200 flex flex-col items-center justify-center">
          <p className="mb-4 font-medium">رفع من ملف إكسيل (Bulk Upload)</p>
          <input type="file" id="excel" hidden onChange={handleExcelUpload} accept=".xlsx, .csv" />
          <label htmlFor="excel" className="bg-blue-600 text-white px-6 py-3 rounded-xl cursor-pointer hover:bg-blue-700 transition-all">
            {loading ? "جاري المعالجة..." : "اختر ملف الإكسيل"}
          </label>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 font-bold">
            <h3 className="mb-4 text-blue-800">تنبيهات هامة:</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pr-4">
                <li>يجب أن تكون عناوين الأعمدة في الإكسيل (title, file_url, department).</li>
                <li>رابط الملف (file_url) يمنع تكرار نفس الملف مرتين.</li>
                <li>الأقسام المتعددة تفصل بينها بعلامة (–).</li>
            </ul>
        </div>
      </div>
    </div>
  );
}
