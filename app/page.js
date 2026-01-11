"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function HomePage() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null); // التصنيف المختار
  const [selectedDept, setSelectedDept] = useState('الكل');
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDocs = async () => {
      const { data } = await supabase.from('documents').select('*');
      if (data) {
        setDocuments(data);
        
        // استخراج التصنيفات الفريدة (مثل: سياسات العمل، أدلة العمل)
        const cats = [...new Set(data.map(item => item.category).filter(Boolean))];
        setCategories(cats);

        // استخراج الأقسام الفريدة
        const depts = new Set();
        data.forEach(doc => {
          if(doc.department) {
            doc.department.split(/[–-]/).forEach(d => depts.add(d.trim()));
          }
        });
        setDepartments(['الكل', ...Array.from(depts)]);
      }
    };
    fetchDocs();
  }, []);

  // أيقونات افتراضية بناءً على اسم التصنيف
  const getIcon = (cat) => {
    if (cat.includes('سياسات')) return '📜';
    if (cat.includes('أدلة') || cat.includes('دليل')) return '📚';
    if (cat.includes('استمارات') || cat.includes('نماذج')) return '📝';
    if (cat.includes('شئون')) return '👥';
    return '📁'; // أيقونة افتراضية
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'الكل' || (doc.department && doc.department.includes(selectedDept));
    const matchesCat = !selectedCategory || doc.category === selectedCategory;
    return matchesSearch && matchesDept && matchesCat;
  });

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* الهيدر */}
      <header className="bg-blue-900 text-white p-5 shadow-lg text-center">
        <h1 className="text-xl font-bold">مركز طب أسرة غرب المطار</h1>
        <p className="text-xs opacity-75 mt-1">المكتبة الطبية الرقمية</p>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        
        {/* شريط البحث */}
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="🔍 ابحث عن ملف بالاسم..." 
            className="w-full p-4 rounded-2xl border-none shadow-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* عرض التصنيفات كأيقونات إذا لم يتم اختيار تصنيف بعد */}
        {!selectedCategory && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:bg-blue-50 transition-all active:scale-95"
              >
                <span className="text-4xl mb-3">{getIcon(cat)}</span>
                <span className="text-sm font-bold text-blue-900">{cat}</span>
              </button>
            ))}
          </div>
        )}

        {/* واجهة الملفات بعد اختيار تصنيف */}
        {selectedCategory && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-blue-600 text-sm font-bold flex items-center gap-1"
              >
                <span>⬅️ العودة للرئيسية</span>
              </button>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-xs font-bold">
                {selectedCategory}
              </span>
            </div>

            {/* فلتر الأقسام داخل التصنيف */}
            <select 
              className="w-full p-3 mb-4 border rounded-xl bg-white text-sm shadow-sm outline-none"
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="الكل">جميع الأقسام</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* قائمة الملفات */}
            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="bg-white p-4 rounded-2xl shadow-sm border-r-4 border-blue-500">
                  <h3 className="text-sm font-bold text-gray-800 mb-1 leading-snug">{doc.title}</h3>
                  <p className="text-[10px] text-gray-400 mb-3">📍 {doc.department}</p>
                  <div className="flex gap-2">
                    <a href={doc.file_url} target="_blank" className="flex-1 bg-blue-600 text-white text-center py-2 rounded-xl text-xs font-bold">
                      عرض الملف
                    </a>
                    <button onClick={() => window.print()} className="px-3 py-2 bg-gray-100 rounded-xl text-xs">🖨️</button>
                  </div>
                </div>
              ))}
              {filteredDocs.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-10">لا توجد ملفات في هذا القسم</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
