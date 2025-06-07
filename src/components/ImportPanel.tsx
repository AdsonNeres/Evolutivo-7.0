import React, { useRef, useState } from 'react';
import { FileUp, Upload } from 'lucide-react';
import { read, utils } from 'xlsx';
import { ImportedRow } from '../types';

interface ImportPanelProps {
  onFileUpload: (data: ImportedRow[]) => void;
}

const ImportPanel: React.FC<ImportPanelProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = utils.sheet_to_json<ImportedRow>(worksheet, { header: 'A' });
        onFileUpload(jsonData);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      processExcel(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      processExcel(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className={`border-2 border-dashed rounded-lg p-12 w-full max-w-2xl flex flex-col items-center justify-center transition-colors cursor-pointer ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <FileUp className="w-16 h-16 text-blue-500 mb-4" />
        
        <h3 className="text-xl font-medium text-gray-700">
          {fileName ? 'Arquivo selecionado:' : 'Importe sua planilha Excel'}
        </h3>
        
        {fileName ? (
          <p className="mt-2 text-green-600 font-medium">{fileName}</p>
        ) : (
          <p className="mt-2 text-gray-500 text-center">
            Arraste e solte seu arquivo Excel aqui ou clique para selecionar
          </p>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
        />

        <button
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            handleButtonClick();
          }}
        >
          <Upload className="w-5 h-5 mr-2" />
          Selecionar Arquivo Excel
        </button>
      </div>
    </div>
  );
};

export default ImportPanel;