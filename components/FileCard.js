// components/FileCard.js
export default function FileCard({ doc }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 mb-2 flex flex-col justify-between">
      <div>
        <h3 className="text-blue-900 font-bold text-sm mb-1 leading-tight">{doc.title}</h3>
        <p className="text-xs text-gray-500 mb-2">{doc.department}</p>
      </div>
      <div className="flex gap-2 mt-2">
        <a href={doc.file_url} target="_blank" className="flex-1 bg-blue-600 text-white text-center py-2 rounded text-xs font-bold">
          عرض / تحميل
        </a>
        <button onClick={() => window.print()} className="px-3 py-2 border border-blue-600 text-blue-600 rounded">
           🖨️
        </button>
      </div>
    </div>
  );
}
