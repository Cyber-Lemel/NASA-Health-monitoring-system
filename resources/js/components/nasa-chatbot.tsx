import React, { useState, useRef, useEffect } from 'react';
import {
    Bot,
    X,
    Send,
    Sparkles,
    Globe,
    Radio,
    Shield,
    Volume2,
    VolumeX,
    RefreshCw,
    ExternalLink,
    ChevronDown,
    Activity,
    User,
    LoaderCircle,
    Maximize2,
    Minimize2,
    CheckCircle2,
    AlertTriangle,
    FileText,
    Share2,
    BookOpen
} from 'lucide-react';
import NasaLogo from '@/components/nasa-logo';

interface ChatSource {
    title: string;
    url: string;
    source?: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: ChatSource[];
    timestamp: string;
    liveFetched?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
    {
        id: 'msg-init-1',
        role: 'assistant',
        content: `### 🛰️ NASA CAPCOM AI • Flight Surgeon Co-Pilot Online

Roger, standing by. I am directly synchronized with the **NASA Deep Space Network (DSN)**, the official **NASA Human Research Program (HRP)** archives, and real-time astronaut physiological telemetry.

#### Authoritative Flight Intelligence Available:
- **The 5 Hazards of Human Spaceflight (RIDGE)**: Space Radiation, Isolation & Confinement, Distance from Earth, Gravity Fields, and Hostile/Closed Environments.
- **Astronaut Biomedical Telemetry**: Real-time heart rate, SpO2, core temperature, and ECG waveform diagnostics.
- **Microgravity Physiology**: Bone mineral density loss (BMD), Spaceflight-Associated Neuro-ocular Syndrome (SANS), and muscle atrophy.
- **Spacesuit Life Support (EMU / xEMU)**: 4.3 PSI envelope, PLSS O2 reserves, sublimator heat exchange, and CO2 scrubbers.

Transmit your mission medical query below or select a quick briefing command.`,
        sources: [
            {
                title: 'NASA: The 5 Hazards of Human Spaceflight (RIDGE)',
                url: 'https://www.nasa.gov/humans-in-space/hazards-of-human-spaceflight/',
                source: 'NASA Human Research Program',
            },
            {
                title: 'NASA Human Research Program (HRP)',
                url: 'https://www.nasa.gov/hrp',
                source: 'NASA JSC Houston',
            },
            {
                title: 'NASA Deep Space Network Operations',
                url: 'https://www.nasa.gov/directorates/somd/space-communications-navigation-program/deep-space-network/',
                source: 'NASA JPL',
            },
        ],
        timestamp: '12:00:00 UTC',
        liveFetched: true,
    },
];

const SUGGESTED_PROMPTS = [
    '⚠️ 5 Hazards of Human Spaceflight (RIDGE)',
    '🦴 Explain bone density loss in microgravity',
    '👁️ What is SANS neuro-ocular syndrome?',
    '☢️ Deep space radiation risks and shielding',
    '🛡️ Check EMU spacesuit life support thresholds',
    '🧑‍🚀 Current crew vital diagnostics status',
];

/**
 * Parses inline markdown tokens: bold (**text**), code (`code`), links ([text](url)), italic (*text*).
 */
function renderInlineTokens(text: string): React.ReactNode[] {
    const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
        if (!part) return null;

        // **bold text**
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
            return (
                <strong key={index} className="font-bold text-white tracking-wide">
                    {part.slice(2, -2)}
                </strong>
            );
        }

        // `inline code / metric`
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
            return (
                <code
                    key={index}
                    className="px-1.5 py-0.5 rounded bg-[#030b14] border border-[#1a4b6c] text-[#5cdbdf] font-mono text-[11px] mx-0.5 font-semibold"
                >
                    {part.slice(1, -1)}
                </code>
            );
        }

        // [link text](url)
        if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
            const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (linkMatch) {
                return (
                    <a
                        key={index}
                        href={linkMatch[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#5cdbdf] underline hover:text-white transition-colors"
                    >
                        {linkMatch[1]}
                    </a>
                );
            }
        }

        // *italic text*
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
            return (
                <em key={index} className="italic text-slate-300">
                    {part.slice(1, -1)}
                </em>
            );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
    });
}

/**
 * Dedicated NASA High-Tech Markdown Formatter Component.
 * Formats headings (###, ####), bullet lists (-), numbered lists (1.), callouts (>), and paragraphs
 * with authentic NASA mission-control typography and high legibility.
 */
function NasaMarkdownRenderer({ content }: { content: string }) {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let listBuffer: { type: 'ul' | 'ol'; items: string[] } | null = null;

    const flushList = () => {
        if (!listBuffer) return;
        const currentBuffer = listBuffer;
        listBuffer = null;

        if (currentBuffer.type === 'ul') {
            elements.push(
                <ul key={`ul-${elements.length}`} className="my-2 space-y-1.5 pl-0.5">
                    {currentBuffer.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] leading-relaxed text-slate-200">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5cdbdf] mt-2 shrink-0 shadow-[0_0_6px_rgba(92,219,223,0.8)]" />
                            <div className="flex-1">{renderInlineTokens(item)}</div>
                        </li>
                    ))}
                </ul>
            );
        } else {
            elements.push(
                <ol key={`ol-${elements.length}`} className="my-2 space-y-2 pl-0.5">
                    {currentBuffer.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] leading-relaxed text-slate-200">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0a1f2e] border border-[#1a4b6c] text-[#5cdbdf] shrink-0 mt-0.5">
                                {idx + 1}
                            </span>
                            <div className="flex-1">{renderInlineTokens(item)}</div>
                        </li>
                    ))}
                </ol>
            );
        }
    };

    lines.forEach((rawLine, lineIdx) => {
        const line = rawLine.trim();

        if (!line) {
            flushList();
            return;
        }

        // H3 (### Header) - NASA HUD Section Title
        if (line.startsWith('### ')) {
            flushList();
            elements.push(
                <h3
                    key={`h3-${lineIdx}`}
                    className="text-sm sm:text-base font-bold text-white tracking-wide border-b border-[#1a4b6c]/60 pb-1.5 mb-2 mt-3 flex items-center gap-2"
                >
                    {renderInlineTokens(line.slice(4))}
                </h3>
            );
            return;
        }

        // H4 (#### Subheader) - NASA HUD Subsection Title
        if (line.startsWith('#### ')) {
            flushList();
            elements.push(
                <h4
                    key={`h4-${lineIdx}`}
                    className="text-[#5cdbdf] font-mono text-xs font-bold uppercase tracking-wider mt-3 mb-1.5 flex items-center gap-1.5"
                >
                    <span className="inline-block w-1.5 h-1.5 bg-[#5cdbdf] rotate-45 shrink-0 shadow-[0_0_5px_rgba(92,219,223,0.7)]" />
                    <span>{renderInlineTokens(line.slice(5))}</span>
                </h4>
            );
            return;
        }

        // Bullet item (- Item or * Item)
        if (line.startsWith('- ') || line.startsWith('* ')) {
            const itemText = line.slice(2);
            if (!listBuffer || listBuffer.type !== 'ul') {
                flushList();
                listBuffer = { type: 'ul', items: [itemText] };
            } else {
                listBuffer.items.push(itemText);
            }
            return;
        }

        // Numbered list item (1. Item, 2. Item)
        const numMatch = line.match(/^\d+\.\s+(.*)$/);
        if (numMatch) {
            const itemText = numMatch[1];
            if (!listBuffer || listBuffer.type !== 'ol') {
                flushList();
                listBuffer = { type: 'ol', items: [itemText] };
            } else {
                listBuffer.items.push(itemText);
            }
            return;
        }

        // Blockquote (> Quote)
        if (line.startsWith('> ')) {
            flushList();
            elements.push(
                <div
                    key={`quote-${lineIdx}`}
                    className="p-3 my-2 border-l-2 border-[#5cdbdf] bg-[#0a1f2e]/60 text-slate-300 text-xs italic leading-relaxed"
                >
                    {renderInlineTokens(line.slice(2))}
                </div>
            );
            return;
        }

        // Standard Paragraph
        flushList();
        elements.push(
            <p key={`p-${lineIdx}`} className="text-xs sm:text-[13px] leading-relaxed text-slate-200 mb-2">
                {renderInlineTokens(line)}
            </p>
        );
    });

    flushList();

    return <div className="space-y-1">{elements}</div>;
}

export default function NasaChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [hasUnread, setHasUnread] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Synthesize simple tactical NASA radio beep sound using Web Audio API
    const playRadioBeep = (freq = 880, duration = 0.08) => {
        if (!isSoundEnabled) return;
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch {
            // Audio context blocked by browser autoplay policy
        }
    };

    // Auto-scroll chat area
    useEffect(() => {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isMinimized, isLoading]);

    // Focus input on open
    useEffect(() => {
        if (isOpen && !isMinimized) {
            setTimeout(() => inputRef.current?.focus(), 150);
            setHasUnread(false);
        }
    }, [isOpen, isMinimized]);

    const handleSendMessage = async (textToSend?: string) => {
        const queryText = (textToSend || input).trim();
        if (!queryText || isLoading) return;

        setInput('');
        playRadioBeep(960, 0.06);

        const userMsg: Message = {
            id: `usr-${Date.now()}`,
            role: 'user',
            content: queryText,
            timestamp: new Date().toUTCString().slice(17, 25) + ' UTC',
        };

        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Get CSRF token
            const csrfToken =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    message: queryText,
                    history: messages.slice(-6).map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            const data = await response.json();

            playRadioBeep(640, 0.12);

            const aiMsg: Message = {
                id: `ai-${Date.now()}`,
                role: 'assistant',
                content: data.reply || 'Data transmission received, standing by for follow-up.',
                sources: data.sources || [],
                timestamp: data.timestamp || new Date().toUTCString().slice(17, 25) + ' UTC',
                liveFetched: data.liveDataFetched ?? true,
            };

            setMessages((prev) => [...prev, aiMsg]);
            if (!isOpen) {
                setHasUnread(true);
            }
        } catch (err) {
            const errorMsg: Message = {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: '⚠️ **Communication Relay Interrupted**: Unable to establish downlink with NASA DSN servers. Operating in localized autonomous medical cache.',
                timestamp: new Date().toUTCString().slice(17, 25) + ' UTC',
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        setMessages(INITIAL_MESSAGES);
        playRadioBeep(440, 0.1);
    };

    return (
        <aside aria-label="NASA CAPCOM AI Assistant" className="fixed bottom-5 right-5 z-50 font-sans selection:bg-[#0284c7] selection:text-white">
            {/* Floating Launcher Button (When closed) */}
            {!isOpen && (
                <button
                    onClick={() => {
                        setIsOpen(true);
                        setIsMinimized(false);
                        playRadioBeep(880, 0.08);
                    }}
                    className="group relative flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-[#06121e] via-[#0b3d91] to-[#041a3d] border border-[#5cdbdf] shadow-2xl shadow-[#5cdbdf]/30 hover:shadow-[#5cdbdf]/50 hover:border-cyan-300 active:scale-95 transition-all cursor-pointer"
                    title="Open NASA CAPCOM AI Assistant"
                >
                    {/* Glowing outer halo */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#5cdbdf] to-blue-600 rounded-full blur-md opacity-40 group-hover:opacity-75 transition-opacity" />

                    {/* Logo & status */}
                    <div className="relative flex items-center justify-center p-1 rounded-full bg-slate-950/80 border border-[#5cdbdf]/60">
                        <NasaLogo size={28} />
                    </div>

                    <div className="relative text-left hidden sm:block">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white tracking-wider">
                            <span>CAPCOM AI</span>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                        </div>
                        <div className="text-[10px] text-[#5cdbdf] font-mono">
                            LIVE NASA INTEL
                        </div>
                    </div>

                    {/* Unread indicator */}
                    {hasUnread && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white animate-pulse">
                            !
                        </span>
                    )}
                </button>
            )}

            {/* Chat Window Panel */}
            {isOpen && (
                <div
                    className={`relative rounded-3xl border border-[#1a4b6c] bg-gradient-to-b from-[#06121e]/98 via-[#030b14]/98 to-[#020813] shadow-2xl shadow-cyan-950/70 backdrop-blur-2xl transition-all flex flex-col overflow-hidden ${
                        isMinimized
                            ? 'w-80 h-16'
                            : 'w-[94vw] sm:w-[480px] md:w-[540px] h-[640px] max-h-[86vh]'
                    }`}
                >
                    {/* Corner Reticles */}
                    <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[#5cdbdf] pointer-events-none z-20" />
                    <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-[#5cdbdf] pointer-events-none z-20" />
                    <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-[#5cdbdf] pointer-events-none z-20" />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[#5cdbdf] pointer-events-none z-20" />

                    {/* Top Console Header */}
                    <div className="px-4 py-3 border-b border-[#1a4b6c] bg-[#041226]/95 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1 rounded-xl bg-slate-900 border border-[#5cdbdf]/60 shadow-[0_0_8px_rgba(92,219,223,0.3)]">
                                <NasaLogo size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider uppercase">
                                        NASA CAPCOM AI
                                    </h3>
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-[#5cdbdf] border border-cyan-800">
                                        DSN LIVE
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>REAL-TIME NASA WEB & TELEMETRY UPLINK</span>
                                </div>
                            </div>
                        </div>

                        {/* Controls: Sound, Clear, Minimize, Close */}
                        <div className="flex items-center gap-1 text-slate-400">
                            <button
                                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                                className="p-1.5 rounded-lg hover:text-[#5cdbdf] hover:bg-slate-800/60 transition-colors cursor-pointer"
                                title={isSoundEnabled ? 'Mute Radio Audio' : 'Enable Radio Audio'}
                            >
                                {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                            </button>

                            <button
                                onClick={handleClearChat}
                                className="p-1.5 rounded-lg hover:text-[#5cdbdf] hover:bg-slate-800/60 transition-colors cursor-pointer"
                                title="Reset Mission Log"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="p-1.5 rounded-lg hover:text-[#5cdbdf] hover:bg-slate-800/60 transition-colors cursor-pointer"
                                title={isMinimized ? 'Expand' : 'Minimize'}
                            >
                                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
                                title="Close CAPCOM Terminal"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Chat Content Body (when not minimized) */}
                    {!isMinimized && (
                        <>
                            {/* Message Feed Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${
                                            msg.role === 'user' ? 'items-end' : 'items-start'
                                        }`}
                                    >
                                        {/* Sender Badge */}
                                        <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-mono text-slate-400">
                                            {msg.role === 'user' ? (
                                                <>
                                                    <span>{msg.timestamp}</span>
                                                    <span className="text-[#5cdbdf] font-bold">MISSION OPERATOR</span>
                                                    <User className="w-3 h-3 text-[#5cdbdf]" />
                                                </>
                                            ) : (
                                                <>
                                                    <Bot className="w-3 h-3 text-[#5cdbdf]" />
                                                    <span className="text-[#5cdbdf] font-bold">CAPCOM AI</span>
                                                    <span>•</span>
                                                    <span>{msg.timestamp}</span>
                                                    {msg.liveFetched && (
                                                        <span className="text-emerald-400 font-mono text-[9px] bg-emerald-950/70 px-1.5 py-0.2 rounded border border-emerald-800/80">
                                                            NASA-VERIFIED
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Message Bubble */}
                                        <div
                                            className={`max-w-[94%] sm:max-w-[90%] p-3.5 sm:p-4 leading-relaxed break-words ${
                                                msg.role === 'user'
                                                    ? 'bg-gradient-to-r from-blue-700/90 to-sky-600/90 border border-cyan-400/40 text-white rounded-2xl rounded-tr-sm shadow-md shadow-cyan-900/20 text-xs sm:text-[13px]'
                                                    : 'bg-[#051329]/95 border border-[#1a4b6c] text-slate-200 rounded-2xl rounded-tl-sm shadow-[0_4px_25px_rgba(0,0,0,0.7)] backdrop-blur-md'
                                            }`}
                                        >
                                            {msg.role === 'user' ? (
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            ) : (
                                                <NasaMarkdownRenderer content={msg.content} />
                                            )}

                                            {/* Outbound Official NASA & Scientific Sources */}
                                            {msg.sources && msg.sources.length > 0 && (
                                                <div className="mt-3.5 pt-3 border-t border-[#1a4b6c]/60 space-y-1.5">
                                                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#5cdbdf] flex items-center gap-1.5 font-bold">
                                                        <Globe className="w-3 h-3" /> OFFICIAL NASA & SCIENTIFIC SOURCES:
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {msg.sources.map((src, i) => (
                                                            <a
                                                                key={i}
                                                                href={src.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0a1f2e] hover:bg-[#0b3d91]/50 border border-[#1a4b6c] hover:border-[#5cdbdf] text-[10px] font-mono text-[#5cdbdf] hover:text-white transition-all shadow-[0_0_6px_rgba(0,0,0,0.5)] group"
                                                            >
                                                                <span className="truncate max-w-[200px]">{src.title}</span>
                                                                <ExternalLink className="w-2.5 h-2.5 shrink-0 text-slate-400 group-hover:text-white" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Thinking / Fetching indicator */}
                                {isLoading && (
                                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#051329]/95 border border-[#1a4b6c] text-[#5cdbdf] font-mono text-xs max-w-[85%] animate-pulse">
                                        <LoaderCircle className="w-4 h-4 animate-spin text-[#5cdbdf] shrink-0" />
                                        <span>Downlinking NASA official archives & telemetry records...</span>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Suggested Quick Prompt Chips */}
                            <div className="px-3 py-2 border-t border-[#1a4b6c]/50 bg-[#030b14]/95 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSendMessage(prompt.slice(2).trim())}
                                        disabled={isLoading}
                                        className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#0a1f2e] hover:bg-[#0b3d91]/50 border border-[#1a4b6c] hover:border-[#5cdbdf] text-[11px] font-mono text-slate-300 hover:text-[#5cdbdf] transition-all shrink-0 cursor-pointer disabled:opacity-50"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>

                            {/* Input Form Bar */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                                className="p-3 border-t border-[#1a4b6c] bg-[#041226]/95 flex items-center gap-2 shrink-0"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask CAPCOM about 5 Hazards, astronaut health, missions..."
                                    disabled={isLoading}
                                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#030b14] border border-[#1a4b6c] text-[#5cdbdf] placeholder:text-slate-500 font-sans text-xs focus:outline-none focus:border-[#5cdbdf] transition-colors disabled:opacity-50"
                                />

                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5cdbdf] hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(92,219,223,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <span>SEND</span>
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}
        </aside>
    );
}
