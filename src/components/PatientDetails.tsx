import React from 'react';
import { Patient, TabType, VisitRecord } from '../types';
import { User, Calendar, Clock, Activity, FileText, ClipboardList, Hospital, Settings as SettingsIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Timestamp } from '../firebase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PatientDetailsProps {
  patient: Patient | null;
  activeTab: TabType;
  onPatientUpdate: (patient: Patient) => void;
  onThemeChange: (color: string) => void;
  themeColor: string;
  isHome: boolean;
}

export default function PatientDetails({
  patient,
  activeTab,
  onPatientUpdate,
  onThemeChange,
  themeColor,
  isHome
}: PatientDetailsProps) {
  const [formData, setFormData] = React.useState<Patient | null>(patient);
  const [newVisit, setNewVisit] = React.useState<VisitRecord>({ date: '', reason: '', notes: '' });

  React.useEffect(() => {
    setFormData(patient);
  }, [patient]);

  if (isHome && activeTab !== 'settings') {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center p-8 border-4 border-gray-200 rounded-3xl shadow-xl max-w-md">
          <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
            <Hospital size={100} />
          </div>
          <h2 className="text-2xl font-bold text-gray-400 mb-2">E-행정 시스템</h2>
          <p className="text-gray-400 font-medium">환자를 선택하거나 새로 등록해 주세요.</p>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Create a base patient object if none exists
    const basePatient: Patient = formData || {
      name: '',
      gender: 'male',
      age: 0,
      uid: 'demo-user',
      visitHistory: []
    };

    let updatedValue: any = value;
    
    // Handle date fields conversion to Timestamp
    if ((name === 'admissionDate' || name === 'dischargeDate') && value) {
      const [year, month, day] = value.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      updatedValue = Timestamp.fromDate(date);
    }
    
    const updated = { ...basePatient, [name]: updatedValue };
    setFormData(updated);
    onPatientUpdate(updated);
  };

  const handleAddVisit = () => {
    if (!formData || !newVisit.date || !newVisit.reason) return;
    const updatedHistory = [...(formData.visitHistory || []), newVisit];
    const updated = { ...formData, visitHistory: updatedHistory };
    setFormData(updated);
    onPatientUpdate(updated);
    setNewVisit({ date: '', reason: '', notes: '' });
  };

  const handleDeleteVisit = (index: number) => {
    if (!formData?.visitHistory) return;
    const updatedHistory = formData.visitHistory.filter((_, i) => i !== index);
    const updated = { ...formData, visitHistory: updatedHistory };
    setFormData(updated);
    onPatientUpdate(updated);
  };

  const renderPatientHeader = () => (
    <div className="bg-[#f8f9fa] border-b border-gray-300 p-4 flex gap-6 items-start">
      <div className="relative group">
        <div className="w-32 h-40 bg-gray-200 border border-gray-400 rounded overflow-hidden flex items-center justify-center text-gray-400">
          {formData?.photoUrl ? (
            <img src={formData.photoUrl} alt="Patient" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User size={48} />
          )}
        </div>
        <div className="mt-2">
          <input
            type="text"
            placeholder="사진 URL"
            name="photoUrl"
            value={formData?.photoUrl || ''}
            onChange={handleChange}
            className="text-[10px] w-32 border border-gray-300 p-1 rounded outline-none"
          />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-x-4 gap-y-2">
        <div className="col-span-4 flex items-center gap-2 mb-2">
          <input
            name="name"
            value={formData?.name || ''}
            onChange={handleChange}
            placeholder="성명"
            className="text-xl font-bold text-[#2c3e50] bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#4682b4] outline-none w-40"
          />
          <div className="flex items-center gap-1 text-gray-500">
            <span>(</span>
            <input
              type="number"
              name="age"
              value={formData?.age || ''}
              onChange={handleChange}
              className="w-12 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#4682b4] outline-none text-center"
            />
            <span>세 / </span>
            <select
              name="gender"
              value={formData?.gender || 'male'}
              onChange={handleChange}
              className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#4682b4] outline-none"
            >
              <option value="male">남</option>
              <option value="female">여</option>
            </select>
            <span>)</span>
          </div>
          <div className="ml-auto flex gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded border border-red-200">
              <span>혈액형:</span>
              <input
                name="bloodType"
                value={formData?.bloodType || ''}
                onChange={handleChange}
                className="w-10 bg-transparent outline-none border-b border-transparent hover:border-red-300"
              />
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded border border-blue-200">
              <span>병동:</span>
              <input
                name="ward"
                value={formData?.ward || ''}
                onChange={handleChange}
                className="w-16 bg-transparent outline-none border-b border-transparent hover:border-blue-300"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">담당과</label>
          <input name="department" value={formData?.department || ''} onChange={handleChange} className="font-medium border-b border-gray-200 hover:border-gray-400 focus:border-[#4682b4] outline-none bg-white/50 px-1" />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">주치의</label>
          <input name="attendingPhysician" value={formData?.attendingPhysician || ''} onChange={handleChange} className="font-medium border-b border-gray-200 hover:border-gray-400 focus:border-[#4682b4] outline-none bg-white/50 px-1" />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">담당교수</label>
          <input name="professor" value={formData?.professor || ''} onChange={handleChange} className="font-medium border-b border-gray-200 hover:border-gray-400 focus:border-[#4682b4] outline-none bg-white/50 px-1" />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">입원일</label>
          <input type="date" name="admissionDate" value={formData?.admissionDate?.toDate?.()?.toISOString().split('T')[0] || ''} onChange={handleChange} className="font-medium border-b border-gray-200 hover:border-gray-400 focus:border-[#4682b4] outline-none bg-white/50 px-1" />
        </div>
      </div>
    </div>
  );

  const renderBedManagement = () => (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-300 pb-2">
          <User size={20} style={{ color: themeColor }} />
          <h3 className="font-bold text-lg">상세 정보</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500">성명</label>
            <input name="name" value={formData?.name || ''} onChange={handleChange} className="border border-gray-300 p-1 rounded" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500">혈액형</label>
            <input name="bloodType" value={formData?.bloodType || ''} onChange={handleChange} className="border border-gray-300 p-1 rounded" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500">성별</label>
            <select name="gender" value={formData?.gender || 'male'} onChange={handleChange} className="border border-gray-300 p-1 rounded">
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500">나이</label>
            <input type="number" name="age" value={formData?.age || ''} onChange={handleChange} className="border border-gray-300 p-1 rounded" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500">담당과</label>
            <input name="department" value={formData?.department || ''} onChange={handleChange} className="border border-gray-300 p-1 rounded" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500">주치의</label>
            <input name="attendingPhysician" value={formData?.attendingPhysician || ''} onChange={handleChange} className="border border-gray-300 p-1 rounded" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500">담당교수</label>
            <input name="professor" value={formData?.professor || ''} onChange={handleChange} className="border border-gray-300 p-1 rounded" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-300 pb-2">
          <Clock size={20} style={{ color: themeColor }} />
          <h3 className="font-bold text-lg">상태 및 일정</h3>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-500">회진시간</label>
          <input name="roundingTime" value={formData?.roundingTime || ''} onChange={handleChange} className="border border-gray-300 p-1 rounded" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-500">현재상태</label>
          <textarea name="currentStatus" value={formData?.currentStatus || ''} onChange={handleChange} className="border border-gray-300 p-1 rounded h-20 resize-none" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-500">특이사항</label>
          <textarea name="specialNotes" value={formData?.specialNotes || ''} onChange={handleChange} className="border border-gray-300 p-1 rounded h-40 resize-none" />
        </div>
      </div>
    </div>
  );

  const renderRegistration = () => (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 border-b border-gray-300 pb-2 mb-4">
        <ClipboardList size={20} style={{ color: themeColor }} />
        <h3 className="font-bold text-lg">접수 및 방문 이력 수정</h3>
      </div>
      
      <div className="bg-gray-100 p-3 rounded-lg mb-4 grid grid-cols-4 gap-2 items-end">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-500">날짜</label>
          <input type="date" value={newVisit.date} onChange={(e) => setNewVisit({...newVisit, date: e.target.value})} className="border border-gray-300 p-1 rounded" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-500">방문사유</label>
          <input type="text" value={newVisit.reason} onChange={(e) => setNewVisit({...newVisit, reason: e.target.value})} className="border border-gray-300 p-1 rounded" placeholder="사유 입력" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-500">기타기록</label>
          <input type="text" value={newVisit.notes} onChange={(e) => setNewVisit({...newVisit, notes: e.target.value})} className="border border-gray-300 p-1 rounded" placeholder="메모" />
        </div>
        <button onClick={handleAddVisit} className="bg-[#4682b4] text-white py-1 rounded font-bold hover:bg-[#3a6d96]" style={{ backgroundColor: themeColor }}>
          추가
        </button>
      </div>

      <div className="flex-1 overflow-y-auto border border-gray-300 rounded bg-gray-50">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#e0e0e0] border-b border-gray-400">
            <tr>
              <th className="p-2 border-r border-gray-400">날짜</th>
              <th className="p-2 border-r border-gray-400">방문사유</th>
              <th className="p-2 border-r border-gray-400">기타기록</th>
              <th className="p-2 w-16 text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            {formData?.visitHistory?.map((visit, idx) => (
              <tr key={idx} className="border-b border-gray-200 hover:bg-blue-50">
                <td className="p-2 border-r border-gray-200">{visit.date}</td>
                <td className="p-2 border-r border-gray-200">{visit.reason}</td>
                <td className="p-2 border-r border-gray-200">{visit.notes}</td>
                <td className="p-2 text-center">
                  <button onClick={() => handleDeleteVisit(idx)} className="text-red-500 hover:text-red-700">삭제</button>
                </td>
              </tr>
            ))}
            {(!formData?.visitHistory || formData.visitHistory.length === 0) && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400 italic">이력이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAdmission = () => (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-300 pb-2">
        <Hospital size={20} style={{ color: themeColor }} />
        <h3 className="font-bold text-lg">입퇴원 관리</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <h4 className="font-bold text-blue-800 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            입원 정보
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500">입원일자</label>
              <input type="date" name="admissionDate" value={formData?.admissionDate?.toDate?.()?.toISOString().split('T')[0] || ''} onChange={handleChange} className="border border-gray-300 p-2 rounded bg-white shadow-sm" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500">병동/병실</label>
              <input name="ward" value={formData?.ward || ''} onChange={handleChange} className="border border-gray-300 p-2 rounded bg-white shadow-sm" placeholder="예: 100병동 101호" />
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-red-50/50 p-4 rounded-xl border border-red-100">
          <h4 className="font-bold text-red-800 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            퇴원 정보
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500">퇴원일자</label>
              <input type="date" name="dischargeDate" value={formData?.dischargeDate?.toDate?.()?.toISOString().split('T')[0] || ''} onChange={handleChange} className="border border-gray-300 p-2 rounded bg-white shadow-sm" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500">퇴원상태</label>
              <select className="border border-gray-300 p-2 rounded bg-white shadow-sm">
                <option>정상퇴원</option>
                <option>전원</option>
                <option>사망</option>
                <option>기타</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-gray-50 p-4 rounded-xl border border-gray-200">
        <label className="text-xs font-bold text-gray-500 mb-2">입퇴원 특이사항</label>
        <textarea name="specialNotes" value={formData?.specialNotes || ''} onChange={handleChange} className="border border-gray-300 p-3 rounded h-32 resize-none bg-white shadow-sm" placeholder="입퇴원 관련 주요 내용을 입력하세요." />
      </div>
    </div>
  );

  const renderOtherHospital = () => (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-300 pb-2">
        <Hospital size={20} style={{ color: themeColor }} />
        <h3 className="font-bold text-lg">타병원 진료 및 전원 기록</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col col-span-1">
          <label className="text-xs font-bold text-gray-500">기관명</label>
          <input name="institutionName" value={formData?.institutionName || ''} onChange={handleChange} className="border border-gray-300 p-2 rounded shadow-sm" placeholder="병원 이름" />
        </div>
        <div className="flex flex-col col-span-2">
          <label className="text-xs font-bold text-gray-500">전원/의뢰 사유</label>
          <input name="transferReason" value={formData?.transferReason || ''} onChange={handleChange} className="border border-gray-300 p-2 rounded shadow-sm" placeholder="전원 사유를 입력하세요." />
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-bold text-gray-500 mb-2">타병원 진료 내역 및 기타 기록</label>
        <textarea name="otherRecords" value={formData?.otherRecords || ''} onChange={handleChange} className="border border-gray-300 p-3 rounded h-64 resize-none shadow-sm" placeholder="타병원에서의 검사 결과, 투약 내역 등을 상세히 기록하세요." />
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-gray-300 pb-4">
        <SettingsIcon size={32} style={{ color: themeColor }} />
        <h2 className="text-2xl font-bold">환경설정</h2>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">테마컬러 변경</h3>
        <div className="flex gap-4">
          <button onClick={() => onThemeChange('#00ced1')} className="w-16 h-16 bg-[#00ced1] border-2 border-gray-400 rounded-md hover:scale-105 transition-transform" />
          <button onClick={() => onThemeChange('#4682b4')} className="w-16 h-16 bg-[#4682b4] border-2 border-gray-400 rounded-md hover:scale-105 transition-transform" />
          <button onClick={() => onThemeChange('#2e8b57')} className="w-16 h-16 bg-[#2e8b57] border-2 border-gray-400 rounded-md hover:scale-105 transition-transform" />
          <button onClick={() => onThemeChange('#8b0000')} className="w-16 h-16 bg-[#8b0000] border-2 border-gray-400 rounded-md hover:scale-105 transition-transform" />
          <button onClick={() => onThemeChange('#4b0082')} className="w-16 h-16 bg-[#4b0082] border-2 border-gray-400 rounded-md hover:scale-105 transition-transform" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-bold text-lg">기타 EMR 리스트</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 p-2 bg-gray-100 rounded hover:bg-blue-50 cursor-pointer">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">H</div>
              <span>TOTAL 간호</span>
            </li>
            <li className="flex items-center gap-2 p-2 bg-gray-100 rounded hover:bg-blue-50 cursor-pointer">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px]">M</div>
              <span>u-Maple 3.0</span>
            </li>
            <li className="flex items-center gap-2 p-2 bg-gray-100 rounded hover:bg-blue-50 cursor-pointer">
              <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-[10px]">E</div>
              <span>E-행정 시스템</span>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white border border-gray-300 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded flex items-center justify-center text-white" style={{ backgroundColor: themeColor }}>
              <span className="text-2xl font-bold">+</span>
            </div>
            <h3 className="text-xl font-bold" style={{ color: themeColor }}>Medical Official</h3>
          </div>
          <p className="text-sm">버전: 3.1 (최신 업데이트)</p>
          <p className="text-sm">문의: ns.0.yujin@gmail.com</p>
          <p className="text-sm">배포일: 2026.04.01</p>
          <p className="text-sm">저작권: 양재원 <span className="text-xs text-gray-400">(ns.0.yujin@gmail.com)</span></p>
          <p className="text-sm font-bold text-blue-600">데이터베이스: 파이어베이스</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'bed': return renderBedManagement();
      case 'registration': return renderRegistration();
      case 'admission': return renderAdmission();
      case 'other': return renderOtherHospital();
      case 'settings': return renderSettings();
      default: return (
        <div className="flex-1 flex items-center justify-center text-gray-400 italic">
          준비 중인 기능입니다.
        </div>
      );
    }
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto flex flex-col">
      {activeTab !== 'settings' && renderPatientHeader()}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}
