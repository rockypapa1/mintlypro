import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Edit2, Trash2, CheckCircle, ShieldBan } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rulesError, setRulesError] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [reward, setReward] = useState('');
  const [icon, setIcon] = useState('📱');
  const [url, setUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [approvalType, setApprovalType] = useState('auto');

  useEffect(() => {
    setLoading(true);
    setRulesError(false);
    const q = query(collection(db, "tasks"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(fetchedTasks);
      setLoading(false);
    }, (e: any) => {
      console.error(e);
      if (e?.message?.includes("Missing or insufficient permissions")) {
        setRulesError(true);
        toast.error("Firebase Rules Error: Please allow read/write in Firebase Console.");
      } else {
        toast.error("Failed to load tasks");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setReward('');
    setIcon('📱');
    setUrl('');
    setIsActive(true);
    setApprovalType('auto');
    setIsModalOpen(true);
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setTitle(task.title);
    setReward(task.rewardValue?.toString() || '');
    setIcon(task.icon);
    setUrl(task.url || '');
    setIsActive(task.status === 'active');
    setApprovalType(task.approvalType || 'auto');
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      title,
      icon,
      reward: `₹${reward}`,
      rewardValue: parseInt(reward) || 0,
      url,
      status: isActive ? 'active' : 'inactive',
      approvalType,
      updatedAt: Date.now()
    };

    try {
      if (editingTask) {
        await setDoc(doc(db, "tasks", editingTask.id), taskData, { merge: true });
        toast.success("Task updated");
      } else {
        await addDoc(collection(db, "tasks"), { ...taskData, createdAt: Date.now() });
        toast.success("Task created");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="space-y-6">
      {rulesError && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-2xl p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
            <ShieldBan className="w-5 h-5" />
            Firebase Security Rules Error
          </h2>
          <p className="text-sm">
            Your Firebase Firestore Database is blocking read/write requests. To fix this so the Admin panel can manage tasks:
          </p>
          <ol className="list-decimal pl-5 text-sm mt-3 space-y-1">
            <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-bold">Firebase Console</a></li>
            <li>Select your project <strong>earning-wh</strong></li>
            <li>Go to <strong>Firestore Database</strong> &gt; <strong>Rules</strong></li>
            <li>Replace the default rules with the secure rules provided by the AI Assistant.</li>
            <li>Click <strong>Publish</strong>. Then refresh this page.</li>
          </ol>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Tasks</h1>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl font-bold transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500 animate-pulse font-medium">Loading tasks...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div key={task.id} className={`bg-[#111] border rounded-2xl p-5 ${task.status === 'active' ? 'border-[#333]' : 'border-red-500/30 opacity-70'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#222] rounded-xl flex items-center justify-center text-2xl">
                  {task.icon}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(task)} className="p-1.5 text-zinc-400 hover:text-white bg-[#222] rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-red-500 hover:text-red-400 bg-red-500/10 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-lg text-white mb-1">{task.title}</h3>
              <p className="text-amber-500 font-bold mb-3">{task.reward}</p>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 overflow-hidden text-ellipsis whitespace-nowrap mb-2">
                <span className="px-2 py-0.5 bg-[#222] rounded text-zinc-400">URL</span>
                {task.url || 'No URL'}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${task.approvalType === 'manual' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                  {task.approvalType === 'manual' ? 'MANUAL APPROVAL' : 'AUTO APPROVE'}
                </span>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
             <div className="col-span-full text-center py-12 text-zinc-600 font-medium bg-[#111] rounded-2xl border border-[#222]">
               No tasks found. Create one.
             </div>
          )}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#222] p-6 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-zinc-500 mb-2">ICON</label>
                  <input 
                    type="text" 
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white text-center focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-zinc-500 mb-2">TITLE</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Subscribe on YouTube"
                    className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">REWARD (₹)</label>
                <input 
                  type="number" 
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">DESTINATION URL (Optional)</label>
                <input 
                  type="url" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">APPROVAL TYPE</label>
                <select 
                  value={approvalType}
                  onChange={(e) => setApprovalType(e.target.value)}
                  className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500 appearance-none"
                >
                  <option value="auto">Auto Approve (Instant Reward)</option>
                  <option value="manual">Manual Approve (Admin Verification Required)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`flex items-center justify-center w-6 h-6 rounded-md border ${isActive ? 'bg-amber-500 border-amber-500 text-black' : 'border-[#333] text-transparent'}`}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-zinc-300">Active (Visible to users)</span>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-[#222] text-white font-semibold rounded-xl hover:bg-[#333] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
