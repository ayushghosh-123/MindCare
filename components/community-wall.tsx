// 'use client';

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { MessageSquare, Zap, Star } from 'lucide-react';

// export function CommunityWall() {
//   const updates = [
//     {
//       title: "v1.2: Smooth Ride Update",
//       desc: "Improved routing architecture to eliminate dashboard flickering.",
//       icon: <Zap className="h-4 w-4 text-amber-500" />
//     },
//     {
//       title: "New Color Palette",
//       desc: "Switched to Soft Periwinkle (#D3D3FF) for a more calming experience.",
//       icon: <Star className="h-4 w-4 text-blue-400" />
//     }
//   ];

//   return (
//     <Card className="border-[#D3D3FF]/50 bg-[#F0F0FF]/50">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2 text-slate-800 text-lg">
//           <MessageSquare className="h-5 w-5 text-[#8A8AFF]" />
//           Community & Updates
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {/* User Feedback Section */}
//         <div className="bg-[#F8F8FF] p-4 rounded-xl border border-[#D3D3FF] shadow-sm">
//           <p className="text-sm italic text-slate-600 mb-3">
//             "Now that's a great tool.... Hoping for newer updates and a smooth ride with this app"
//           </p>
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-bold text-[#8A8AFF]">Recent Feedback</span>
//             <div className="flex gap-0.5">
//               {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3 w-3 fill-[#D3D3FF] stroke-[#8A8AFF]" />)}
//             </div>
//           </div>
//         </div>

//         {/* Product Updates Feed */}
//         <div className="space-y-3">
//           <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">What's New</h4>
//           {updates.map((update, idx) => (
//             <div key={idx} className="flex items-start gap-3 p-2 hover:bg-[#F8F8FF] rounded-lg transition-colors">
//               <div className="mt-1">{update.icon}</div>
//               <div>
//                 <p className="text-sm font-semibold text-slate-800">{update.title}</p>
//                 <p className="text-xs text-slate-500 leading-relaxed">{update.desc}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
