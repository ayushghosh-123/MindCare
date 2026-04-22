// components/EmailReviewPanel.tsx
'use client';

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle, Send, X, Edit, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/hooks/use-toast";
import { useAuth } from "@clerk/nextjs";

interface EmailReviewPanelProps {
  initialSubject: string;
  initialBody: string;
  evaluation?: {
    status: "approved" | "needs_edit";
    issues: string[];
  };
  sessionId: string;
  error?: string | null;
  onComplete: (result: { status: 'approved' | 'edit' | 'reject' }) => void;
}

/**
 * Interactive card logic for human-in-the-loop (HITL) approval.
 * Allows the user to view, edit, or reject the AI-generated wellness email.
 */
export function EmailReviewPanel({ 
  initialSubject,
  initialBody, 
  evaluation, 
  sessionId, 
  error,
  onComplete 
}: EmailReviewPanelProps) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [currentBody, setCurrentBody] = useState(initialBody);
  const [loading, setLoading] = useState(false);

  const handleAction = async (decision: 'approved' | 'edit' | 'reject') => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch("/api/agent/email/resume", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({
          sessionId,
          decision,
          updatedContent: (decision === 'approved' || decision === 'edit') ? currentBody : undefined
        })
      });

      if (response.ok) {
        toast({
          title: decision === 'approved' ? "Email Sent!" : "Draft Rejected",
          description: decision === 'approved' ? "Your wellness update is on its way." : "The draft has been discarded.",
          variant: decision === 'approved' ? "success" : "error"
        });
        onComplete({ status: decision });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process decision.");
      }
    } catch (err: any) {
      toast({
        title: "Workflow Error",
        description: err.message,
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Error State UI ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-amber-500/10 overflow-hidden animate-in fade-in zoom-in duration-700">
        <div className="p-10 bg-amber-50/50">
          <h2 className="text-3xl font-black text-amber-900 tracking-tighter flex items-center gap-4 mb-4">
            <AlertCircle className="h-8 w-8 stroke-[3]" />
            Configuration Required
          </h2>
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
             <p className="text-lg font-bold text-amber-900 mb-3">Wait, there&s a small issue!</p>
             <p className="text-sm text-amber-700/80 leading-relaxed font-medium">
               {error}
             </p>
          </div>
          <div className="p-8 bg-amber-100/30 rounded-3xl space-y-4">
             <p className="text-[10px] font-black text-amber-900/40 uppercase tracking-[0.2em]">Sanctum Sync Protocol:</p>
             <ul className="text-sm text-amber-900/70 space-y-3 font-medium">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Navigate to your Sanctuary Profile
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Ensure your transmission address is verified
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Allow a moment for celestial synchronization
                </li>
             </ul>
          </div>
          <div className="mt-10">
            <Button 
              variant="ghost" 
              className="w-full h-16 text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-3xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
              onClick={() => handleAction('reject')}
              disabled={loading}
            >
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-900"></div> : "Dismiss Protocol"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-[#2C2A4A]/10 overflow-hidden animate-in fade-in slide-in-from-top-6 duration-1000">
      <div className="p-10 bg-[#f3f3f3]">
        <div className="flex justify-between items-start gap-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-[#1b0c53] tracking-tighter leading-tight flex items-center gap-4">
              <Send className="h-8 w-8 text-[#5f559a] stroke-[3]" />
              Transmission Review
            </h2>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-[#5f559a]/40 uppercase tracking-[0.2em]">Celestial Objective:</p>
              <p className="text-lg font-bold text-[#1b0c53] capitalize">
                {initialSubject}
              </p>
            </div>
          </div>
          <div className={cn(
            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all duration-700",
            evaluation?.status === "approved" ? "bg-[#bdb2ff] text-[#1b0c53]" : "bg-white text-[#5f559a]/40"
          )}>
            {evaluation?.status === "approved" ? "Sanctum Verified" : "Review Required"}
          </div>
        </div>
      </div>

      <div className="p-10 space-y-10">
        {evaluation && evaluation.issues.length > 0 && (
          <div className="bg-[#fcfced] p-8 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-3 text-amber-700 font-black text-xs uppercase tracking-widest">
              <AlertCircle className="h-5 w-5 stroke-[3]" />
              Adjustment Tokens:
            </div>
            <ul className="space-y-3">
              {evaluation.issues.map((issue, idx) => (
                <li key={idx} className="text-sm text-amber-900/70 font-medium flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-[10px] font-black text-[#5f559a]/40 uppercase tracking-[0.2em] pl-4">Draft Projection</p>
          {isEditing ? (
            <textarea 
              value={currentBody} 
              onChange={(e) => setCurrentBody(e.target.value)} 
              rows={12}
              className="w-full text-lg font-medium text-[#1b0c53] bg-[#f3f3f3] border-none rounded-3xl p-8 focus:ring-4 focus:ring-[#bdb2ff]/20 leading-relaxed resize-none shadow-inner transition-all"
              placeholder="Deepen your narrative..."
            />
          ) : (
            <div className="bg-[#f3f3f3] p-10 rounded-3xl text-[#1b0c53] whitespace-pre-wrap text-xl font-medium leading-[1.6] shadow-inner italic">
              {currentBody}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
           <Button 
             variant="ghost" 
             className="flex-1 h-16 text-[#5f559a]/40 hover:text-red-500 hover:bg-red-50 rounded-3xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all" 
             onClick={() => handleAction('reject')} 
             disabled={loading}
           >
             <X className="h-5 w-5 mr-3 stroke-[3]" />
             Discard Stream
           </Button>
           <Button 
             variant="ghost" 
             className="flex-1 h-16 bg-[#f3f3f3] hover:bg-white text-[#1b0c53] rounded-3xl font-black text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-all" 
             onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)} 
             disabled={loading}
           >
             {isEditing ? (
               <><CheckCircle2 className="h-5 w-5 mr-3 stroke-[3]" /> Finalize Ajust</>
             ) : (
               <><Edit className="h-5 w-5 mr-3 stroke-[3]" /> Refine Projection</>
             )}
           </Button>
           <Button 
             className="flex-1 h-16 bg-[#1b0c53] hover:bg-black text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#1b0c53]/20 active:scale-95 transition-all min-w-[220px]" 
             onClick={() => handleAction('approved')} 
             disabled={loading}
           >
             {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
             ) : (
               <><Send className="h-5 w-5 mr-3 stroke-[3]" /> Align & Transmit</>
             )}
           </Button>
        </div>
      </div>
      
      <div className="p-10 bg-[#f3f3f3] text-center">
        <p className="text-[10px] text-[#5f559a]/30 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
          <Info className="h-4 w-4" />
          Transmission targets are defined within your Sanctuary Archetype profile.
        </p>
      </div>
    </div>
  );
}
