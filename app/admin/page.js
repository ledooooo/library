"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import * as XLSX from 'xlsx';

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  
  // حقول الإضافة اليدوية
  const [formData, setFormData] = useState({
    title: '', file_type: 'PDF', department: '', file_url: '', category: '', description: ''
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchDocs();
    });
  }, []);

  async function fetchDocs() {
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (data) setDocs(data);
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("خطأ في الدخول: " + error.message);
    else window.location.reload();
  };

  // إضافة يدوية
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('documents').insert([formData]);
    if (error) alert("خطأ: " + error.message);
    else {
      alert("تمت الإضافة بنجاح");
      setFormData({ title: '', file_type: 'PDF', department: '', file_url: '', category: '', description: '' });
      fetchDocs();
    }
    setLoading(false);
  };

  // حذف ملف
  const handleDelete = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا الملف؟")) {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) alert(error.message);
      else fetchDocs();
    }
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
        
        const cleanData = [];
        const seenUrls = new Set();
        for (const item of rawData) {
          if (item.file_url && !seenUrls.has(item.file_url)) {
            cleanData.push(item);
            seenUrls.add(item.file_url);
          }
        }

        const { error } = await supabase.from('documents').upsert(cleanData, { onConflict: 'file_url' });
        if (error) throw error;
        alert("تم رفع وتحديث البيانات!");
        fetchDocs();
      } catch (err) { alert("خطأ: " + err.message); }
      setLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4" dir="rtl">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-right">
          <h2 className="text-2xl font-bold mb-6 text-blue-900 text-center">دخول الإدارة</h2>
          <input type="email" placeholder="البريد الإلكتروني" className="w-full p-3 mb-4 border rounded-lg" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="كلمة المرور" className="w-full p-3 mb-6 border rounded-lg" onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">دخول</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-blue-900 p-4 rounded-xl text-white">
          <h1 className="text-xl font-bold">لوحة إدارة مكتبة غرب المطار</h1>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="bg-red-500 px-4 py-1 rounded text-sm">خروج</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* فورم الإضافة اليدوية */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="font-bold mb-4 border-b pb-2 text-blue-800">إضافة ملف يدوي</h2>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <input type="text" placeholder="عنوان الملف" className="w-full p-2 border rounded text-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              <input type="text" placeholder="القسم (مثلاً: الصيدلية - الطوارئ)" className="w-full p-2 border rounded text-sm" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
              <input type="text" placeholder="التصنيف (مثلاً: سياسات العمل)" className="w-full p-2 border rounded text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              <input type="url" placeholder="رابط الملف (Google Drive)" className="w-full p-2 border rounded text-sm" value={formData.file_url} onChange={e => setFormData({...formData, file_url: e.target.value})} required />
              <select className="w-full p-2 border rounded text-sm" value={formData.file_type} onChange={e => setFormData({...formData, file_type: e.target.value})}>
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
                <option value="Word">Word</option>
              </select>
              <button className="w-full bg-green-600 text-white py-2 rounded font-bold shadow-md hover:bg-green-700">إضافة الآن</button>
            </form>

            <div className="mt-8 pt-6 border-t">
              <h2 className="font-bold mb-2 text-blue-800">رفع إكسيل</h2>
              <input type="file" id="excel" hidden onChange={handleExcelUpload} accept=".xlsx, .csv" />
              <label htmlFor="excel" className="block text-center bg-blue-100 text-blue-700 py-3 rounded-xl cursor-pointer border-2 border-dashed border-blue-300 font-bold">
                {loading ? "جاري الرفع..." : "اختر ملف إكسيل"}
              </label>
            </div>
          </div>

          {/* جدول عرض البيانات والحذف */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b font-bold text-blue-900 flex justify-between">
              <span>الملفات الحالية ({docs.length})</span>
              <button onClick={fetchDocs} className="text-xs bg-white border px-2 py-1 rounded">تحديث القائمة 🔄</button>
            </div>
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-3">العنوان</th>
                    <th className="p-3">القسم</th>
                    <th className="p-3">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {docs.map(doc => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{doc.title}</td>
                      <td className="p-3 text-gray-500">{doc.department}</td>
                      <td className="p-3">
                        <button onClick={() => handleDelete(doc.id)} className="bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100">حذف</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
