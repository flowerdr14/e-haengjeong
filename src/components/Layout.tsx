import React from 'react';
import { TabType } from '../types';
import { Settings, Save, Edit, Search, Trash2, LogOut, User as UserIcon, Hospital } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSave: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSearch: (query: string) => void;
  onLogout: () => void;
  user: any;
  themeColor: string;
}

export default function Layout({
  children,
  activeTab,
  onTabChange,
  onSave,
  onEdit,
  onDelete,
  onSearch,
  onLogout,
  user,
  themeColor
}: LayoutProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'bed', label: '병상관리' },
    { id: 'registration', label: '접수이력' },
    { id: 'admission', label: '입퇴원관리' },
    { id: 'other', label: '타병원기록' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#f0f0f0] font-sans text-sm overflow-hidden">
      {/* Top Navigation */}
      <div className="p-2 flex items-center gap-2 border-b border-gray-400" style={{ backgroundColor: `${themeColor}33` }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-6 py-2 rounded-md transition-all font-medium",
              activeTab === tab.id
                ? "text-white shadow-inner"
                : "text-white hover:opacity-80"
            )}
            style={{ 
              backgroundColor: activeTab === tab.id ? themeColor : `${themeColor}aa`
            }}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-4 px-4">
          <div className="flex items-center gap-2" style={{ color: themeColor }}>
            <Hospital size={16} />
            <span className="font-semibold">E-행정 시스템</span>
          </div>
          <button
            onClick={() => {
              if (window.confirm('프로그램을 종료하시겠습니까?')) {
                window.location.href = 'about:blank';
              }
            }}
            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-bold"
          >
            <LogOut size={14} />
            <span>종료</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {children}
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-[#c0c0c0] border-t border-gray-500 p-1 flex items-center gap-1">
        <button
          onClick={() => onTabChange('settings')}
          className="flex items-center gap-1 px-4 py-1 border border-gray-600 bg-[#e0e0e0] hover:bg-white transition-colors"
        >
          <Settings size={14} />
          <span>환경설정</span>
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-1 px-4 py-1 border border-gray-600 bg-[#e0e0e0] hover:bg-white transition-colors"
        >
          <Save size={14} />
          <span>저장</span>
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 px-4 py-1 border border-gray-600 bg-[#e0e0e0] hover:bg-white transition-colors"
        >
          <Edit size={14} />
          <span>수정</span>
        </button>

        <div className="flex items-center ml-2 border border-gray-600 bg-white">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              onSearch(val);
            }}
            className="px-2 py-1 outline-none w-40"
            placeholder="환자 검색..."
          />
          <button
            onClick={() => onSearch(searchQuery)}
            className="px-4 py-1 bg-[#d0d0d0] hover:bg-white border-l border-gray-600 flex items-center gap-1"
          >
            <Search size={14} />
            <span>환자조회</span>
          </button>
        </div>

        <button
          onClick={onDelete}
          className="flex items-center gap-1 px-4 py-1 border border-gray-600 bg-[#e0e0e0] hover:bg-red-100 transition-colors ml-1"
        >
          <Trash2 size={14} />
          <span>삭제</span>
        </button>

        <div className="ml-auto flex items-center gap-2 px-4 font-bold italic" style={{ color: themeColor }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: themeColor }}>
            <Hospital size={20} />
          </div>
          <span>E-행정 (온라인 원무)</span>
        </div>
      </div>
    </div>
  );
}
