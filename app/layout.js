import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // تأكد من إعداد ملف الربط

export default function MedicalLibrary() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('الكل');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    let { data, error } = await supabase.from('documents').select('*');
    if (data) {
      setDocuments(data);
      // استخراج الأقسام الفريدة من البيانات
      const depts = new Set();
      data.forEach(doc => {
        doc.department.split('–').forEach(d => depts.add(d.trim()));
      });
      setDepartments(['الكل', ...Array.from(depts)]);
    }
  }

  // منطق الفلترة والبحث
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'الكل' || doc.department.includes(selectedDept);
    return matchesSearch && matchesDept;
  });

  return (
    <div className="min-h-screen bg-gray-50 dir-rtl" style={{ direction: 'rtl' }}>
      {/* الهيدر */}
      <header className="bg-blue-800 text-white p-4 shadow-md sticky top-0 z-10">
        <h1 className="text-lg font-bold">مركز طب أسرة غرب المطار</h1>
        <p className="text-xs opacity-80">المكتبة الطبية الرقمية</p>
      </header>

      <main className="p-2">
        {/* أدوات البحث والفلترة - مدمجة للموبايل */}
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            placeholder="ابحث عن سياسة أو دليل..."
            className="w-full p-3 rounded-lg border border-gray-300 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="w-full p-3 rounded-lg border border-gray-300 text-sm bg-white shadow-sm"
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
        </div>

        {/* عرض النتائج كبطاقات مدمجة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white border-r-4 border-r-blue-600 rounded-md shadow-sm p-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{doc.category}</span>
                  <span className="text-[10px] text-gray-400">{doc.file_type}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-2 leading-tight">{doc.title}</h3>
                <p className="text-[11px] text-gray-500 mb-2 line-clamp-1">📍 {doc.department}</p>
              </div>
              
              <div className="flex gap-1">
                <a 
                  href={doc.file_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white text-center py-2 rounded text-xs font-bold transition-colors"
                >
                  فتح الملف
                </a>
                <button 
                  onClick={() => window.open(doc.file_url, '_blank')}
                  className="px-3 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                >
                  💾
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm">لا توجد نتائج تطابق بحثك</div>
        )}
      </main>
    </div>
  );
}
