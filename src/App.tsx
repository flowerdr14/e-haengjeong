import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, collection, query, onSnapshot, setDoc, doc, deleteDoc, Timestamp, handleFirestoreError, OperationType, User } from './firebase';
import { Patient, TabType } from './types';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import PatientDetails from './components/PatientDetails';
import { Hospital, LogIn, ShieldAlert } from 'lucide-react';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('bed');
  const [loading, setLoading] = useState(true);
  const [themeColor, setThemeColor] = useState('#4682b4');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHome, setIsHome] = useState(true);

  // Patients Listener
  useEffect(() => {
    const q = query(collection(db, 'patients'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientList: Patient[] = [];
      snapshot.forEach((doc) => {
        patientList.push({ id: doc.id, ...doc.data() } as Patient);
      });
      setPatients(patientList);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'patients');
    });

    return () => unsubscribe();
  }, []);

  // Sync selected patient with latest data from patients list
  useEffect(() => {
    if (selectedPatient?.id) {
      const updated = patients.find(p => p.id === selectedPatient.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedPatient)) {
        setSelectedPatient(updated);
      }
    }
  }, [patients, selectedPatient]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.ward?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.attendingPhysician?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    if (!selectedPatient) return;
    
    try {
      const patientData = {
        ...selectedPatient,
        uid: 'demo-user', // Default UID for demo
        updatedAt: Timestamp.now(),
        createdAt: selectedPatient.createdAt || Timestamp.now(),
      };
      
      const docRef = selectedPatient.id 
        ? doc(db, 'patients', selectedPatient.id)
        : doc(collection(db, 'patients'));
      
      await setDoc(docRef, patientData);
      alert('저장되었습니다.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'patients');
    }
  };

  const handleDelete = async () => {
    if (!selectedPatient?.id) return;
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deleteDoc(doc(db, 'patients', selectedPatient.id));
      setSelectedPatient(null);
      alert('삭제되었습니다.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `patients/${selectedPatient.id}`);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleNewPatient = () => {
    setSelectedPatient({
      name: '새 환자',
      gender: 'male',
      age: 0,
      uid: 'demo-user',
      admissionDate: Timestamp.now(),
      visitHistory: []
    });
    setActiveTab('bed');
    setIsHome(false);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsHome(false);
  };

  const handleExit = () => {
    setSelectedPatient(null);
    setIsHome(true);
  };

  const handlePatientSelect = (patient: Patient | null) => {
    setSelectedPatient(patient);
    if (patient) setIsHome(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f0f0f0]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4682b4]"></div>
      </div>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onSave={handleSave}
      onEdit={() => {}} // Edit is handled by state updates in PatientDetails
      onDelete={handleDelete}
      onSearch={handleSearch}
      onExit={handleExit}
      onLogout={() => {}}
      user={null}
      themeColor={themeColor}
    >
      <Sidebar
        patients={filteredPatients}
        selectedPatientId={selectedPatient?.id}
        onPatientSelect={handlePatientSelect}
        onSearch={handleSearch}
        themeColor={themeColor}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-[#e0e0e0] p-1 border-b border-gray-400 flex items-center justify-between">
          <div className="flex items-center gap-2 px-2">
            <span className="font-bold" style={{ color: themeColor }}>현재 환자:</span>
            <span className="font-medium">{selectedPatient?.name || '선택 없음'}</span>
          </div>
          <div className="flex gap-1">
            {!isHome && (
              <button
                onClick={handleExit}
                className="px-4 py-0.5 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs font-bold"
              >
                종료
              </button>
            )}
            <button
              onClick={handleNewPatient}
              className="px-4 py-0.5 text-white rounded hover:opacity-90 text-xs font-bold"
              style={{ backgroundColor: themeColor }}
            >
              + 새 환자 등록
            </button>
          </div>
        </div>
        <PatientDetails
          patient={selectedPatient}
          activeTab={activeTab}
          onPatientUpdate={setSelectedPatient}
          onThemeChange={setThemeColor}
          themeColor={themeColor}
          isHome={isHome}
        />
      </div>
    </Layout>
  );
}
