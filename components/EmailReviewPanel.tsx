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
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-t-8 border-amber-500 bg-[#F8F8FF]/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-6 w-6" />
            Configuration Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-900">
             <p className="font-semibold text-lg mb-2">Wait, there&s a small issue!</p>
             <p className="text-sm opacity-90 leading-relaxed">
               {error}
             </p>
          </div>
          <div className="p-4 bg-[#F0F0FF] rounded-xl space-y-3">
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">How to fix this:</p>
             <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside px-1">
                <li>Go to your <strong>Profile</strong> tab</li>
                <li>Ensure your <strong>Email Address</strong> is saved</li>
                <li>Wait 30 seconds for the cloud to sync</li>
             </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full h-12 text-slate-600 border-slate-300 hover:bg-[#F0F0FF] rounded-xl"
            onClick={() => handleAction('reject')}
            disabled={loading}
          >
            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div> : "Dismiss and Refresh"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-t-8 border-[#D3D3FF] bg-[#F8F8FF]/80 backdrop-blur-sm">
      <CardHeader className="border-b pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-[#8A8AFF]">
              <Send className="h-6 w-6" />
              Review Your Wellness Update
            </CardTitle>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Subject: {initialSubject}
            </p>
          </div>
          <Badge variant={evaluation?.status === "approved" ? "outline" : "destructive"} 
                 className={evaluation?.status === "approved" ? "bg-green-50 text-green-700 border-green-200" : ""}>
            {evaluation?.status === "approved" ? "AI REVIEWED" : "NEEDS QUALITY CHECK"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {evaluation && evaluation.issues.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-bold">
              <AlertCircle className="h-4 w-4" />
              AI Quality Suggestions:
            </div>
            <ul className="list-disc list-inside text-sm text-amber-600 pl-2">
              {evaluation.issues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-widest pl-1">Draft Body</label>
          {isEditing ? (
            <Textarea 
              value={currentBody} 
              onChange={(e) => setCurrentBody(e.target.value)} 
              rows={12}
              className="text-slate-800 leading-relaxed font-monofont p-4 border-2 border-[#D3D3FF]/50 focus:border-[#8A8AFF] rounded-xl"
            />
          ) : (
            <div className="bg-[#F0F0FF] p-6 rounded-xl text-slate-700 whitespace-pre-wrap leading-relaxed border-2 border-dashed border-slate-200 italic shadow-inner">
              {currentBody}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
        <div className="flex gap-4 w-full">
           <Button 
             variant="outline" 
             className="flex-1 text-slate-600 border-slate-300 hover:bg-slate-100" 
             onClick={() => handleAction('reject')} 
             disabled={loading}
           >
             <X className="h-4 w-4 mr-2" />
             Discard
           </Button>
           <Button 
             variant="secondary" 
             className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold" 
             onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)} 
             disabled={loading}
           >
             {isEditing ? (
               <><CheckCircle2 className="h-4 w-4 mr-2" /> Preview</>
             ) : (
               <><Edit className="h-4 w-4 mr-2" /> Edit Draft</>
             )}
           </Button>
        </div>
        <Button 
          className="w-full sm:w-auto min-w-[200px] bg-[#D3D3FF] hover:bg-[#BDBDFE] text-white font-black text-lg py-6 shadow-lg transform active:scale-95 transition-all" 
          onClick={() => handleAction('approved')} 
          disabled={loading}
        >
          {loading ? (
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <><Send className="h-5 w-5 mr-3" /> APPROVE & SEND</>
          )}
        </Button>
      </CardFooter>
      
      <p className="text-center text-[10px] text-slate-400 py-4 italic uppercase tracking-tighter flex items-center justify-center gap-1">
        <Info className="h-3 w-3" />
        This email will be delivered to the recipient addresses stored in your Supabase user profile.
      </p>
    </Card>
  );
}
