import React from 'react';
import { Patient } from '../types';
import { Search, ChevronRight, ChevronDown, User, Bed } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  patients: Patient[];
  selectedPatientId?: string;
  onPatientSelect: (patient: Patient) => void;
  onSearch: (query: string) => void;
  themeColor: string;
}

export default function Sidebar({
  patients,
  selectedPatientId,
  onPatientSelect,
  onSearch,
  themeColor
}: SidebarProps) {
  const [activeTab, setActiveTab] = React.useState<'patient' | 'ward'>('patient');
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const wardsConfig = [
    { name: '100병동', rooms: ['101병실', '102병실', '103병실', '104병실'] },
    { name: '응급실', rooms: ['응급실 1', '응급실 2', '응급실 3', '응급실 4', '응급실 5', '응급실 6'] },
    { name: '수술실', rooms: ['수술방 1번', '수술방 2번', '수술방 3번'] },
    { name: 'PACU', rooms: ['PACU 1', 'PACU 2', 'PACU 3', 'PACU 4'] },
    { name: '소아병동', rooms: ['소아병동 1', '소아병동 2', '소아병동 3', '소아병동 4'] },
    { name: '중환자실', rooms: ['중환자실 1', '중환자실 2', '중환자실 3', '중환자실 4', '중환자실 5', '중환자실 6'] },
    { name: '산과병동', rooms: ['분만실 1', '분만실 2'] },
    { name: '산후병동', rooms: ['산후병실 1', '산후병실 2'] },
  ];

  // Group patients by ward
  const patientsByWard = React.useMemo(() => {
    const groups: Record<string, Patient[]> = {};
    patients.forEach(p => {
      const wardName = p.ward || '미지정';
      if (!groups[wardName]) groups[wardName] = [];
      groups[wardName].push(p);
    });
    return groups;
  }, [patients]);

  const wardList = React.useMemo(() => {
    const configNames = wardsConfig.map(w => w.name);
    const allConfigRooms = wardsConfig.flatMap(w => w.rooms);
    
    const dynamicWards = Object.keys(patientsByWard)
      .filter(w => !configNames.includes(w) && !allConfigRooms.includes(w) && w !== '미지정')
      .map(name => ({ name, rooms: [] }));
    
    const final = [...wardsConfig, ...dynamicWards];
    if (patientsByWard['미지정']) {
      final.push({ name: '미지정', rooms: [] });
    }
    return final;
  }, [patientsByWard, wardsConfig]);

  const [expandedWards, setExpandedWards] = React.useState<string[]>(['100병동', '응급실', '수술실', 'PACU', '소아병동', '중환자실', '산과병동', '산후병동']);

  const toggleWard = (ward: string) => {
    setExpandedWards(prev =>
      prev.includes(ward) ? prev.filter(w => w !== ward) : [...prev, ward]
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-400 flex flex-col">
      <div className="p-2 text-center font-bold border-b border-gray-400" style={{ backgroundColor: `${themeColor}66` }}>
        통합리스트
      </div>
      <div className="p-2 border-b border-gray-400">
        <div className="flex border border-gray-600 bg-white">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              onSearch(val);
            }}
            className="flex-1 px-2 py-1 outline-none"
            placeholder="이름, 병동, 과, 주치의 검색..."
          />
          <button
            onClick={() => onSearch(searchQuery)}
            className="p-1 bg-[#d0d0d0] hover:bg-white border-l border-gray-600"
          >
            <Search size={14} />
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-400">
        <button
          onClick={() => setActiveTab('patient')}
          className={cn(
            "flex-1 py-1 font-medium transition-colors",
            activeTab === 'patient' ? "text-white" : "bg-[#e0e0e0] hover:bg-white"
          )}
          style={{ backgroundColor: activeTab === 'patient' ? themeColor : undefined }}
        >
          환자조회
        </button>
        <button
          onClick={() => setActiveTab('ward')}
          className={cn(
            "flex-1 py-1 font-medium transition-colors",
            activeTab === 'ward' ? "text-white" : "bg-[#e0e0e0] hover:bg-white"
          )}
          style={{ backgroundColor: activeTab === 'ward' ? themeColor : undefined }}
        >
          병동조회
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-1">
        {activeTab === 'patient' ? (
          <div className="space-y-1">
            {patients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => onPatientSelect(patient)}
                className={cn(
                  "w-full text-left px-2 py-1 flex items-center gap-2 rounded transition-colors",
                  selectedPatientId === patient.id ? "text-white" : "hover:bg-blue-50"
                )}
                style={{ backgroundColor: selectedPatientId === patient.id ? themeColor : undefined }}
              >
                <User size={14} />
                <span>{patient.name} ({patient.age}/{patient.gender === 'male' ? '남' : '여'})</span>
              </button>
            ))}
            {patients.length === 0 && (
              <div className="text-gray-400 text-center py-4 italic">환자가 없습니다.</div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {wardList.map((ward) => (
              <div key={ward.name}>
                <button
                  onClick={() => toggleWard(ward.name)}
                  className="w-full text-left px-1 py-1 flex items-center gap-1 hover:bg-gray-100 font-medium"
                >
                  {expandedWards.includes(ward.name) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <Bed size={14} style={{ color: themeColor }} />
                  <span>
                    {ward.name} ({
                      (patientsByWard[ward.name]?.length || 0) + 
                      ward.rooms.reduce((acc, room) => acc + (patients.filter(p => p.ward === room).length), 0)
                    })
                  </span>
                </button>
                {expandedWards.includes(ward.name) && (
                  <div className="ml-4 space-y-1 border-l border-gray-300 pl-2">
                    {/* Rooms and Patients in Rooms */}
                    {ward.rooms.map((room) => {
                      const patientsInRoom = patients.filter(p => p.ward === room);
                      return (
                        <div key={room} className="space-y-0.5">
                          <div className="px-2 py-0.5 text-[10px] font-bold text-gray-400 flex items-center gap-1">
                            <ChevronRight size={8} />
                            {room} ({patientsInRoom.length})
                          </div>
                          {patientsInRoom.map((patient) => (
                            <button
                              key={patient.id}
                              onClick={() => onPatientSelect(patient)}
                              className={cn(
                                "w-full text-left px-4 py-1 text-xs rounded transition-colors flex items-center gap-2",
                                selectedPatientId === patient.id ? "text-white" : "hover:bg-blue-50"
                              )}
                              style={{ backgroundColor: selectedPatientId === patient.id ? themeColor : undefined }}
                            >
                              <User size={10} />
                              <span>{patient.name} ({patient.age}/{patient.gender === 'male' ? '남' : '여'})</span>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                    
                    {/* Patients directly in the Ward (not in a specific room) */}
                    {patientsByWard[ward.name]?.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => onPatientSelect(patient)}
                        className={cn(
                          "w-full text-left px-2 py-1 text-xs rounded transition-colors flex items-center gap-2",
                          selectedPatientId === patient.id ? "text-white" : "hover:bg-blue-50"
                        )}
                        style={{ backgroundColor: selectedPatientId === patient.id ? themeColor : undefined }}
                      >
                        <User size={10} />
                        <span>{patient.name} ({patient.age}/{patient.gender === 'male' ? '남' : '여'})</span>
                      </button>
                    ))}
                    
                    {ward.rooms.length === 0 && (!patientsByWard[ward.name] || patientsByWard[ward.name].length === 0) && (
                      <div className="text-[10px] text-gray-400 italic px-2 py-1">정보 없음</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
