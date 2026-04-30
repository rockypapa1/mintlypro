import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MessageCircle, CheckCircle, XCircle, ExternalLink, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminWhatsApp() {
  const [requests, setRequests] = useState<any[]>([]);
  const [pairingCodes, setPairingCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    const q = query(collection(db, "whatsapp_requests"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(data);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await setDoc(doc(db, "whatsapp_requests", id), {
        status: newStatus,
        updatedAt: Date.now(),
        awardedPoints: newStatus === 'approved' ? 1200 : 0
      }, { merge: true });
      toast.success(`Request marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleAssignCode = async (id: string) => {
    const rawCode = pairingCodes[id];
    if (!rawCode) {
      toast.error("Please enter a pairing code");
      return;
    }
    
    // Remove any spaces or dashes for validation, WhatsApp codes are 8 alphanumeric chars
    const cleanCode = rawCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    if (cleanCode.length !== 8) {
      toast.error("Code must be exactly 8 characters long (excluding dashes)");
      return;
    }

    // Format as XXXX-XXXX for better readability
    const formattedCode = `${cleanCode.slice(0, 4)}-${cleanCode.slice(4)}`;
    
    try {
      await setDoc(doc(db, "whatsapp_requests", id), {
        loginCode: formattedCode
      }, { merge: true });
      toast.success("Code sent to user successfully");
    } catch (error) {
      toast.error("Failed to assign code");
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">WhatsApp Tasks</h1>
        <p className="text-zinc-400 text-sm">Manage user WhatsApp linking requests and use WhatsApp Web.</p>
      </div>

      <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] flex flex-col items-start min-h-[500px]">
        <div className="flex w-full items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#00ec77]" />
            WhatsApp Web
          </h2>
          <a 
            href="https://web.whatsapp.com" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 bg-[#00ec77] hover:bg-[#00c965] text-black px-4 py-2 rounded-xl font-bold transition-all text-sm"
          >
            Open in New Tab <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
        <p className="text-sm text-zinc-400 mb-4 w-full">
          Note: WhatsApp blocks their website from loading in side-frames (like the one below). For the real WhatsApp functionality, please use the "Open in New Tab" button.
        </p>
        <div className="w-full flex-grow bg-white rounded-xl overflow-hidden relative">
           <iframe src="https://web.whatsapp.com" className="w-full h-full border-0 min-h-[500px]" title="WhatsApp Web" />
        </div>
      </div>

      <div className="bg-[#111111] rounded-2xl border border-[#222222] overflow-hidden">
        <div className="p-5 border-b border-[#222222]">
          <h2 className="text-lg font-bold text-white">Requests & Pairing</h2>
        </div>
        <div className="p-4 space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-bold text-white text-lg">{req.phoneNumber}</p>
                <p className="text-zinc-400 text-xs">{new Date(req.createdAt).toLocaleString()}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                    req.status === 'approved' ? 'bg-[#00ec77]/10 text-[#00ec77]' :
                    req.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                    'bg-amber-500/10 text-amber-500'
                  }`}>
                    {req.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-3 flex-1 max-w-sm">
                <p className="text-xs font-semibold text-zinc-500 mb-2">Assign Pairing Code</p>
                {req.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pairingCodes[req.id] !== undefined ? pairingCodes[req.id] : (req.loginCode || '')}
                      onChange={(e) => setPairingCodes({...pairingCodes, [req.id]: e.target.value.toUpperCase()})}
                      placeholder="ABCD-1234"
                      maxLength={10}
                      className="bg-black border border-[#333] rounded-lg px-3 py-2 w-full text-white focus:outline-none focus:border-[#00ec77] font-mono shadow-inner"
                    />
                    <button
                      onClick={() => handleAssignCode(req.id)}
                      className="p-2.5 bg-[#00ec77]/10 text-[#00ec77] hover:bg-[#00ec77]/20 rounded-lg transition-colors flex items-center justify-center shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="bg-black border border-[#333] rounded-lg px-3 py-2 text-center">
                    <span className="font-mono text-white text-lg tracking-widest">{req.loginCode || 'NO CODE'}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t border-[#333] md:border-t-0">
                  <button 
                    onClick={() => handleUpdateStatus(req.id, 'approved')}
                    className="flex-1 md:flex-none p-2 bg-[#00ec77]/10 text-[#00ec77] hover:bg-[#00ec77]/20 rounded-lg transition-colors flex justify-center"
                    title="Approve"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(req.id, 'rejected')}
                    className="flex-1 md:flex-none p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors flex justify-center"
                    title="Reject"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="py-8 text-center text-zinc-500">
              No WhatsApp requests found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
