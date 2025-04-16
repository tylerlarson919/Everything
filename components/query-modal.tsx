// query-modal.tsx
import React, { useState, useEffect } from "react";
import { Modal, ModalBody } from "@heroui/modal";
import { Task, Habit, Goal } from "../config/types";
import { firestore, auth } from "../config/firebase";
import { doc, setDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import CloseIcon from "./icons/close";
import { onAuthStateChanged } from "firebase/auth";

interface QueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalType: string;
  data?: Task | Habit | Goal;
}

export const QueryModal: React.FC<QueryModalProps> = ({ isOpen, onClose, modalType, data }) => {
  const [formData, setFormData] = useState<Task | Habit | Goal | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    console.log("useEffect triggered with:", { isOpen, modalType, hasData: !!data });

    if (data) {
        console.log("Setting form data from provided data");

      setFormData(data);
    } else {
        console.log("Creating default form data for type:", modalType);
      // Initialize with default data based on modalType
      if (modalType.includes("Task")) {
        setFormData({
          id: crypto.randomUUID(),
          name: "",
          description: "",
          emoji: "📝",
          xp: 0,
          startTime: "",
          endTime: "",
          coins: 0,
          color: "#000000"
        } as Task);
      } else if (modalType.includes("Habit")) {
        setFormData({
          id: crypto.randomUUID(),
          name: "",
          description: "",
          emoji: "🔄",
          xp: 0,
          health: 0,
          formed: false,
          recurrence: []
        } as Habit);
      } else if (modalType.includes("Goal")) {
        setFormData({
          id: crypto.randomUUID(),
          name: "",
          description: "",
          emoji: "🎯",
          xp: 0,
          dueDate: "",
          coins: 0,
          color: "#000000"
        } as Goal);
      }
    }
  }, [data, modalType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log("handleChange called with:", { name, value });

    setFormData((prevData) => {
      if (!prevData) return null;
  
      // Type guard to ensure prevData is of the correct type
      if (modalType.includes("Task") && "startTime" in prevData) {
        return { ...prevData, [name]: value } as Task;
      } else if (modalType.includes("Goal") && "dueDate" in prevData) {
        return { ...prevData, [name]: value } as Goal;
      } else if (modalType.includes("Habit") && "recurrence" in prevData) {
        return { ...prevData, [name]: value } as Habit;
      }
      return prevData;
    });
  };

  const handleSubmit = async () => {
    console.log("handleSubmit called, formData:", formData);
  
    if (!formData) return;
    if (!currentUser) {
      console.error("No user is signed in");
      return;
    }
  
    try {
        const userId = currentUser.uid;
        const collectionName = modalType.includes("Task") ? "tasks" : modalType.includes("Habit") ? "habits" : "goals";
      
        // Correct the path to make playerData a document
        if (modalType.startsWith("add")) {
          // For new documents, use collection to reference the correct subcollection
          const collectionRef = collection(firestore, `users/${userId}/${collectionName}`);
          await addDoc(collectionRef, formData);
        } else {
          // For updates, use the existing ID
          if ("id" in formData && formData.id) {
            const docRef = doc(firestore, `users/${userId}/${collectionName}/${formData.id}`);
            await updateDoc(docRef, formData as any);
          } else {
            console.error("No ID found for document update");
            return;
          }
        }
      
        console.log("Document successfully saved");
        onClose();
      } catch (error) {
        console.error("Error saving data:", error);
      }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  const renderFields = () => {
    if (!formData) return null;
  
    const inputClass = "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  
    return (
      <>
        <div>
          <label className={labelClass}>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className={inputClass} />
        </div>
        
        <div>
          <label className={labelClass}>Description</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            placeholder="Description" 
            className={`${inputClass} min-h-[80px] resize-none`} 
          />
        </div>
        
        <div>
          <label className={labelClass}>Emoji</label>
          <input name="emoji" value={formData.emoji} onChange={handleChange} placeholder="Emoji" className={inputClass} />
        </div>
        
        <div>
          <label className={labelClass}>XP Points</label>
          <input name="xp" type="number" value={formData.xp} onChange={handleChange} placeholder="XP" className={inputClass} />
        </div>
        
        {modalType.includes("Task") && "startTime" in formData && (
          <>
            <div>
              <label className={labelClass}>Start Time</label>
              <input name="startTime" type="datetime-local" value={formData.startTime} onChange={handleChange} className={inputClass} />
            </div>
            
            <div>
              <label className={labelClass}>End Time</label>
              <input name="endTime" type="datetime-local" value={formData.endTime} onChange={handleChange} className={inputClass} />
            </div>
            
            <div>
              <label className={labelClass}>Coins</label>
              <input name="coins" type="number" value={formData.coins} onChange={handleChange} placeholder="Coins" className={inputClass} />
            </div>
            
            <div>
              <label className={labelClass}>Color</label>
              <div className="flex gap-2">
                <input name="color" type="color" value={formData.color} onChange={handleChange} className="w-10 h-10 rounded cursor-pointer" />
                <input name="color" type="text" value={formData.color} onChange={handleChange} placeholder="Color hex" className={inputClass} />
              </div>
            </div>
          </>
        )}
        
        {modalType.includes("Goal") && "dueDate" in formData && (
          <>
            <div>
              <label className={labelClass}>Due Date</label>
              <input name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} className={inputClass} />
            </div>
            
            <div>
              <label className={labelClass}>Coins</label>
              <input name="coins" type="number" value={formData.coins} onChange={handleChange} placeholder="Coins" className={inputClass} />
            </div>
            
            <div>
              <label className={labelClass}>Color</label>
              <div className="flex gap-2">
                <input name="color" type="color" value={formData.color} onChange={handleChange} className="w-10 h-10 rounded cursor-pointer" />
                <input name="color" type="text" value={formData.color} onChange={handleChange} placeholder="Color hex" className={inputClass} />
              </div>
            </div>
          </>
        )}
        
        {modalType.includes("Habit") && "recurrence" in formData && (
          <>
            <div>
              <label className={labelClass}>Health</label>
              <input name="health" type="number" value={formData.health} onChange={handleChange} placeholder="Health" className={inputClass} />
            </div>
            
            <div>
              <label className={labelClass}>Recurrence</label>
              <div className="flex flex-row gap-2 mb-2">
                {[
                  { key: "Sunday", label: "S" },
                  { key: "Monday", label: "M" },
                  { key: "Tuesday", label: "T" },
                  { key: "Wednesday", label: "W" },
                  { key: "Thursday", label: "T" },
                  { key: "Friday", label: "F" },
                  { key: "Saturday", label: "S" }
                ].map((day) => (
                  <div
                    key={day.key}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                      formData.recurrence.includes(day.key) 
                        ? "bg-blue-600 text-white" 
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                    onClick={() => {
                      setFormData((prevData) => {
                        if (!prevData || !("recurrence" in prevData)) return prevData;
                        
                        const updatedRecurrence = prevData.recurrence.includes(day.key)
                          ? prevData.recurrence.filter(d => d !== day.key)
                          : [...prevData.recurrence, day.key];
                          
                        return { ...prevData, recurrence: updatedRecurrence } as Habit;
                      });
                    }}
                  >
                    {day.label}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </> 
    );
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[100] transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="bg-white dark:bg-black/20 rounded-lg backdrop-blur-sm p-6 w-full max-w-md z-[101]">
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white" onClick={handleClose}>
          <CloseIcon className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-semibold mb-6 text-center">
          {modalType.includes("add") ? "Add" : "Edit"} {modalType.includes("Task") ? "Task" : modalType.includes("Habit") ? "Habit" : "Goal"}
        </h2>
        
        <div className="space-y-4">
          {renderFields()}
        </div>
        
        <div className="mt-8 flex justify-end">
          <button 
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};