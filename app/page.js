"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function HomePage() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('الكل');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDocs = async () => {
      const { data } = await supabase.from('documents').select('*');
      if (data) {
        setDocuments(data);
        const depts = new Set();
        data.forEach(doc => {
          if(doc.department) {
            doc.department.split('–').forEach(d => depts.add(d.trim()));
            doc.department.split('-').forEach(d => depts.add(d.trim()));
          }
        });
        setDepartments(['الكل', ...Array.from(depts)]);
      }
    };
    fetchDocs();
  }, []);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'الكل' || (doc.department && doc.department.includes(selectedDept));
    return matchesSearch && matchesDept;
  });

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <header className="bg-blue-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <h1 className="text-xl font-bold text-center">مركز طب أسرة غرب المطار</h1>
        <p className="text-[10px] text-center opacity-70">المكتبة الطبية الإلكترونية</p>
      </header>

      <main className="p-3 max-w-4xl mx-auto">
        <div className="bg-white p-3 rounded-xl shadow-sm mb-4 sticky top-[72px] z-40">
          <input 
            type="text" 
            placeholder="🔍 ابحث باسم السياسة..." 
            className="w-full p-2 mb-2 border rounded-lg text-sm outline-none focus:border-blue-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="w-full p-2 border rounded-lg text-sm bg-gray-50 outline-none"
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white p-4 rounded-xl shadow-sm border-r-4 border-blue-600 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded">{doc.category}</span>
                <span className="text-[10px] text-gray-400">{doc.file_type}</span>
              </div>
              <h2 className="text-sm font-bold text-gray-800 leading-snug">{doc.title}</h2>
              <p className="text-[11px] text-gray-500">📍 {doc.department}</p>
              <div className="flex gap-2 mt-2">
                <a href={doc.file_url} target="_blank" className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg text-xs font-bold shadow-md active:scale-95 transition-transform">
                  فتح / تحميل
                </a>
                <button onClick={() => window.print()} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600">
                  🖨️
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
