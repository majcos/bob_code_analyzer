/**
 * Main Chat Interface
 * ChatGPT-style interface for Bob Code Analyzer
 */

import React, { useState, useRef } from 'react';
import Head from 'next/head';
import { Send, Loader2, Paperclip, Image as ImageIcon } from 'lucide-react';
import type { BobAnalysisResponse } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: Array<{
    type: 'image' | 'video' | 'file';
    url: string;
    name: string;
  }>;
  timestamp: Date;
  metadata?: {
    filesAnalyzed?: string[];
    promptUsed?: string;
  };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...files]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const analyzeInput = async () => {
    if (!input.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      attachments: attachments.map((file) => ({
        type: file.type.startsWith('image/')
          ? 'image'
          : file.type.startsWith('video/')
          ? 'video'
          : 'file',
        url: URL.createObjectURL(file),
        name: file.name,
      })),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setLoading(true);

    try {
      // Detect if input is a GitHub URL
      const githubUrlPattern = /github\.com\/([^\/]+)\/([^\/\s]+)|^([^\/]+)\/([^\/\s]+)$/;
      const isGithubUrl = githubUrlPattern.test(input.trim());

      let response;
      if (isGithubUrl) {
        // Analyze as repository
        response = await fetch('/api/analyze/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoUrl: input.trim() }),
        });
      } else {
        // Analyze as plain code or question
        response = await fetch('/api/analyze/code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: input.trim(),
            question: input.trim(),
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error((data as any).error || 'Analysis failed');
      }

      const result = data as BobAnalysisResponse;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.result,
        timestamp: new Date(),
        metadata: {
          filesAnalyzed: result.filesAnalyzed,
          promptUsed: result.promptUsed,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
      scrollToBottom();
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to analyze'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const extractRepoFromContext = (): string => {
    // Extract repo URL from previous messages
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'user') {
        const githubUrlPattern = /github\.com\/([^\/]+)\/([^\/\s]+)|^([^\/]+)\/([^\/\s]+)$/;
        const match = msg.content.match(githubUrlPattern);
        if (match) {
          return msg.content.trim();
        }
      }
    }
    return '';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      analyzeInput();
    }
  };

  return (
    <>
      <Head>
        <title>Bob Code Analyzer</title>
        <meta name="description" content="AI-Powered Repository Analysis" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h1 className="text-xl font-semibold text-gray-900">
              Bob Code Analyzer
            </h1>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  How can I help you today?
                </h2>
                <p className="text-gray-600 mb-8">
                  Paste a GitHub repository URL or ask me anything about code
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  <button
                    onClick={() =>
                      setInput('Analyze https://github.com/vercel/next.js')
                    }
                    className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 mb-1">
                      Analyze a repository
                    </div>
                    <div className="text-sm text-gray-600">
                      Get insights on any GitHub repo
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      setInput('What are common security vulnerabilities in Node.js apps?')
                    }
                    className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 mb-1">
                      Ask about code
                    </div>
                    <div className="text-sm text-gray-600">
                      Get answers to technical questions
                    </div>
                  </button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">B</span>
                  </div>
                )}
                <div
                  className={`max-w-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  } rounded-2xl px-4 py-3`}
                >
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {message.attachments.map((att, idx) => (
                        <div key={idx} className="rounded overflow-hidden">
                          {att.type === 'image' && (
                            <img
                              src={att.url}
                              alt={att.name}
                              className="max-w-full h-auto"
                            />
                          )}
                          {att.type === 'video' && (
                            <video
                              src={att.url}
                              controls
                              className="max-w-full h-auto"
                            />
                          )}
                          {att.type === 'file' && (
                            <div className="text-sm">{att.name}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.metadata && (
                    <details className="mt-3 text-sm opacity-75">
                      <summary className="cursor-pointer">
                        View details
                      </summary>
                      <div className="mt-2 space-y-2">
                        {message.metadata.filesAnalyzed && (
                          <div>
                            <div className="font-semibold">Files analyzed:</div>
                            <div className="text-xs">
                              {message.metadata.filesAnalyzed.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">U</span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">B</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <div className="max-w-3xl mx-auto">
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm"
                  >
                    <span className="truncate max-w-xs">{file.name}</span>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                multiple
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Attach files"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message Bob Code Analyzer..."
                  rows={1}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 bg-white"
                  style={{ minHeight: '48px', maxHeight: '200px' }}
                />
              </div>
              <button
                onClick={analyzeInput}
                disabled={loading || (!input.trim() && attachments.length === 0)}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                title="Send message"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Bob can analyze GitHub repositories and answer code questions
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

// Made with Bob
