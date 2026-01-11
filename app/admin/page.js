"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import * as XLSX from 'xlsx';

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans" dir="rtl">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96 text-right">
          <h2 className="text-xl font-bold mb-6 text-center">دخول الإدارة</h2>
          <input 
            type="email" placeholder="البريد الإلكتروني" 
            className="w-full p-2 mb-4 border rounded"
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="كلمة المرور" 
            className="w-full p-2 mb-6 border rounded"
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded font-bold">دخول</button>
        </form>
      </div>
    );
  }

  // ... كود رفع الإكسيل الذي أعطيتك إياه سابقاً يوضع هنا ...
}
