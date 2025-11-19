'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Save,
  Eye,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing your health diary entry...',
  className,
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && !isPreview) {
      // keep DOM in sync with content prop when editing
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [content, isPreview]);

  // Normalize formatBlock value to a tag string like "<h2>" or "<blockquote>"
  const normalizeValueForCommand = (command: string, value?: string) => {
    if (!value) return value;
    if (command === 'formatBlock') {
      // ensure it is like "<h2>"
      return value.startsWith('<') ? value : `<${value}>`;
    }
    return value;
  };

  const execCommand = (command: string, value?: string) => {
    const normalized = normalizeValueForCommand(command, value);
    // execCommand signature: document.execCommand(command, showUI?, value)
    try {
      document.execCommand(command, false, normalized);
    } catch (e) {
      // execCommand is deprecated in some environments; swallow errors gracefully
      // Optionally you can add fallback behavior here if you integrate a rich text lib later.
      // console.warn('execCommand failed', e);
    }

    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const formatButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    // keep the semantic value short here ('h2', 'blockquote') — execCommand use will normalize
    { icon: Type, command: 'formatBlock', value: 'h2', title: 'Heading' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
  ];

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Diary Entry</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={isPreview ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button size="sm" className="bg-rose-600 hover:bg-rose-700">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isPreview ? (
          <>
            <div className="border border-slate-200 rounded-lg mb-4">
              <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50">
                {formatButtons.map(({ icon: Icon, command, value, title }) => (
                  <Button
                    // unique, stable key combining command + value/title
                    key={`${command}-${String(value ?? title)}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => execCommand(command, value)}
                    title={title}
                    className="h-8 w-8 p-0"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
              <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="min-h-[400px] p-4 focus:outline-none prose prose-sm max-w-none"
                style={{ whiteSpace: 'pre-wrap' }}
                data-placeholder={placeholder}
                suppressContentEditableWarning={true}
              />
            </div>
            <div className="text-xs text-slate-500 flex justify-between">
              <span>Write your thoughts, feelings, and experiences</span>
              <span>{content.length} characters</span>
            </div>
          </>
        ) : (
          <div
            className="min-h-[400px] p-4 border border-slate-200 rounded-lg bg-slate-50 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </CardContent>
    </Card>
  );
}
