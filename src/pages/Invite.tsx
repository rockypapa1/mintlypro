import React from "react";
import { motion } from "motion/react";
import { Users, Copy, Share2, TrendingUp, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Invite() {
  const referralCode = "WAVE99X";

  const handleCopy = () => {
    // navigator.clipboard.writeText(referralCode);
    alert("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left space-y-1 block md:flex md:items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Refer & Earn</h1>
          <p className="text-slate-500 text-sm mt-1">Invite your friends and earn a lifetime commission!</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="bg-gradient-to-br from-indigo-600 via-primary-600 to-blue-600 text-white overflow-hidden relative border-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-8 relative z-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4 border border-white/20">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Earn 20% Commission</h2>
            <p className="text-indigo-100 mb-8 max-w-sm">Get 20% of all coins your friends earn forever. They also get a 500 coin welcome bonus!</p>
            
            <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex flex-col items-start">
                <span className="text-xs font-medium text-indigo-200 uppercase tracking-wider mb-1">Your Referral Code</span>
                <span className="text-2xl font-black font-mono tracking-widest">{referralCode}</span>
              </div>
              <Button size="sm" onClick={handleCopy} className="bg-white text-primary-600 hover:bg-slate-50 rounded-xl h-10 px-4">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
            
            <Button size="lg" className="w-full max-w-md mt-4 bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20 border-0 header-text rounded-xl h-14">
              <Share2 className="w-5 h-5 mr-2" />
              Share Link now
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Referrals</p>
                <h3 className="text-2xl font-bold text-slate-900">42</h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Earned</p>
                <h3 className="text-2xl font-bold text-slate-900 flex items-end gap-1">
                  12.5k <span className="text-sm text-amber-500 mb-1">💰</span>
                </h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="font-bold text-lg mb-4">How it works</h3>
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {[
            { step: 1, text: "Share your code or link with friends." },
            { step: 2, text: "Friend signs up and gets 500 coins bonus." },
            { step: 3, text: "You get 20% of everything they earn, forever!" },
          ].map((item) => (
            <div key={item.step} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 bg-white text-slate-500 font-bold shadow-sm md:order-1 relative z-10 group-[.is-active]:bg-primary-600 group-[.is-active]:text-white group-[.is-active]:border-primary-100 transition-colors">
                {item.step}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white border border-slate-100 shadow-sm ml-4 md:ml-0 md:mr-0 group-[.is-active]:border-primary-200">
                <p className="text-sm font-medium text-slate-700">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
