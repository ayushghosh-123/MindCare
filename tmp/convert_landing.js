const fs = require('fs');

function htmlToJsx(html) {
    let jsx = html.replace(/class=/g, 'className=');
    jsx = jsx.replace(/<!--(.*?)-->/g, '{/* $1 */}');
    jsx = jsx.replace(/<br>/g, '<br />');
    jsx = jsx.replace(/<hr>/g, '<hr />');
    jsx = jsx.replace(/<input(.*?)>/g, (match) => {
        if (!match.endsWith('/>')) return match.replace('>', ' />');
        return match;
    });
    jsx = jsx.replace(/<img(.*?)>/g, (match) => {
        if (!match.endsWith('/>')) return match.replace('>', ' />');
        return match;
    });
    // Fix inline styles
    jsx = jsx.replace(/style="([^"]*)"/g, (match, stylestring) => {
        const styles = stylestring.split(';').filter(s => s.trim() !== '');
        let styleObjStr = styles.map(s => {
            const [key, value] = s.split(':');
            if(!key || !value) return '';
            const camelKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
            return `${camelKey}: '${value.trim()}'`;
        }).filter(s=>s!== '').join(', ');
        return `style={{ ${styleObjStr} }}`;
    });
    
    // Extract everything inside body
    const bodyMatch = jsx.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return bodyMatch ? bodyMatch[1] : jsx;
}

// 1. Landing Page
const landingHtml = fs.readFileSync('tmp/landing_prof.html', 'utf8');
const landingJsx = htmlToJsx(landingHtml);
const landingComponent = `import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function MindCareLanding() {
  return (
    <div className="bg-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* 🌟 Include custom CSS just for this component */}
      <style dangerouslySetInnerHTML={{__html: \`
        .font-headline { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
        .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(201, 196, 209, 0.15); }
        .ambient-shadow { box-shadow: 0px 20px 40px rgba(44, 42, 74, 0.06); }
        
        .phone-frame {
            position: relative;
            width: 280px;
            height: 580px;
            background: #1a1a1a;
            border-radius: 3rem;
            padding: 12px;
            box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.25), 0 30px 60px -30px rgba(0, 0, 0, 0.3);
            border: 4px solid #2f3131;
        }
        .phone-screen {
            background: #0d0c1d;
            border-radius: 2.25rem;
            overflow: hidden;
            width: 100%;
            height: 100%;
            position: relative;
        }
        .phone-notch {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 25px;
            background: #1a1a1a;
            border-bottom-left-radius: 1.25rem;
            border-bottom-right-radius: 1.25rem;
            z-index: 20;
        }
        
        .brain-viz-container {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at center, #2d2452 0%, #0d0c1d 100%);
        }

        .wave-layer {
            position: absolute;
            width: 200%;
            height: 200%;
            background: url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 C150,400 350,600 500,500 C650,400 850,600 1000,500 L1000,1000 L0,1000 Z' fill='%235f559a' fill-opacity='0.15'/%3E%3C/svg%3E");
            background-repeat: repeat-x;
            background-position: bottom;
            bottom: -20%;
            animation: wave 20s linear infinite;
        }
        .wave-layer-2 {
            animation: wave 12s linear infinite reverse;
            opacity: 0.5;
            bottom: -10%;
        }

        .pulsating-orb {
            width: 180px;
            height: 180px;
            background: radial-gradient(circle, #bdb2ff 0%, transparent 70%);
            filter: blur(20px);
            border-radius: 50%;
            animation: pulse-slow 8s ease-in-out infinite;
        }

        .doodle-accent { position: relative; }
        .doodle-accent::after {
            content: ""; position: absolute; bottom: -4px; left: 0; width: 100%; height: 8px;
            background: url("data:image/svg+xml,%3Csvg width='100' height='10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 5 Q 25 0, 50 5 T 100 5' stroke='%23bdb2ff' stroke-width='2' fill='none'/%3E%3C/svg%3E") repeat-x;
            opacity: 0.6; z-index: -1;
        }
        
        @keyframes wave {
            0% { transform: translateX(0) translateZ(0) scaleY(1) }
            50% { transform: translateX(-25%) translateZ(0) scaleY(0.8) }
            100% { transform: translateX(-50%) translateZ(0) scaleY(1) }
        }
        @keyframes pulse-slow {
            0%, 100% { opacity: 0.4; transform: scale(1) }
            50% { opacity: 0.8; transform: scale(1.1) }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px) }
            50% { transform: translateY(-20px) }
        }
      \`}} />
      ${landingJsx.replace(/<header[\s\S]*?<\/header>/, '')}
    </div>
  );
}
`;

fs.writeFileSync('components/landing/MindCareLanding.tsx', landingComponent);
console.log("Updated components/landing/MindCareLanding.tsx");
