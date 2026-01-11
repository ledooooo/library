"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import * as XLSX from 'xlsx';

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("خطأ في الدخول: " + error.message);
    else window.location.reload();
  };

const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      setLoading(true);
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const rawData = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);

        // --- إضافة منطق حذف التكرار هنا ---
        const cleanData = [];
        const seenUrls = new Set();

        for (const item of rawData) {
          // نتأكد أن الرابط موجود وغير فارغ
          if (item.file_url && !seenUrls.has(item.file_url)) {
            cleanData.push(item);
            seenUrls.add(item.file_url);
          }
        }
        // ---------------------------------

        const { error } = await supabase.from('documents').upsert(cleanData, { onConflict: 'file_url' });
        
        if (error) throw error;
        alert("تم رفع " + cleanData.length + " ملف بنجاح (تم استبعاد الروابط المكررة إن وجدت)");
      } catch (err) {
        alert("خطأ أثناء الرفع: " + err.message);
      }
      setLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-right">
          <h2 className="text-2xl font-bold mb-6 text-blue-900 text-center">دخول الإدارة</h2>
          <input type="email" placeholder="البريد الإلكتروني" className="w-full p-3 mb-4 border rounded-lg shadow-sm" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="كلمة المرور" className="w-full p-3 mb-6 border rounded-lg shadow-sm" onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">دخول</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-900">لوحة تحكم المكتبة</h1>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="text-red-500 text-sm font-bold">تسجيل خروج</button>
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-sm border-2 border-dashed border-blue-200 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-bold mb-2">رفع البيانات من ملف إكسيل</h2>
          <p className="text-gray-500 mb-6 text-sm">تأكد أن أسماء الأعمدة مطابقة للجدول (title, department, file_url...)</p>
          
          <input type="file" id="excel" hidden onChange={handleExcelUpload} accept=".xlsx, .csv" />
          <label htmlFor="excel" className="inline-block bg-blue-600 text-white px-10 py-4 rounded-2xl cursor-pointer hover:bg-blue-700 font-bold shadow-lg transition-all">
            {loading ? "جاري المعالجة والرفع..." : "اختر الملف الآن"}
          </label>
        </div>
      </div>
    </div>
  );
}
