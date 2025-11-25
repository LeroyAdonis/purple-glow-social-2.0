'use client';

import React, { useActionState, useState, useEffect } from 'react';
import { generatePostAction } from '../app/actions/generate';
import SchedulePostModal from './modals/schedule-post-modal';
import CustomSelect from './custom-select';
import { Language } from '../lib/i18n';

const initialState = {
    success: false,
    error: '',
    data: { content: '', imageUrl: '', postId: '' }
};

interface ContentGeneratorProps {
    currentLanguage?: Language;
}

export default function ContentGenerator({ currentLanguage = 'en' }: ContentGeneratorProps) {
    const [state, formAction, isPending] = useActionState(generatePostAction, initialState);

    // Controlled inputs to drive preview logic
    const [platform, setPlatform] = useState("instagram");
    const [vibe, setVibe] = useState("Mzansi Cool (Local Slang)");
    const [prompt, setPrompt] = useState("");

    // Local state for editing generated result
    const [localContent, setLocalContent] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    // Schedule modal state
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    // Sync server state to local state when generation finishes
    useEffect(() => {
        if (state?.data?.content) {
            setLocalContent(state.data.content);
            setIsEditing(false);
        }
    }, [state]);

    const handleDiscard = () => {
        setLocalContent("");
        setIsEditing(false);
        // Optionally reset other state if needed, but keeping form inputs is usually better UX
    };

    const handleSchedule = () => {
        setIsScheduleModalOpen(true);
    };

    // --- PREVIEW RENDERERS ---

    const renderInstagramPreview = () => (
        <div className="bg-white text-black rounded-xl overflow-hidden shadow-2xl max-w-sm mx-auto font-sans border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-white border-2 border-transparent overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Purple+Glow&background=9D4EDD&color=fff" alt="User" />
                        </div>
                    </div>
                    <span className="text-xs font-bold">purple_glow_sa</span>
                </div>
                <i className="fa-solid fa-ellipsis text-xs"></i>
            </div>

            {/* Image */}
            <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden relative">
                {state?.data?.imageUrl ? (
                    <img src={state.data.imageUrl} alt="Generated" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-gray-400 text-xs">Image Preview</span>
                )}
            </div>

            {/* Actions */}
            <div className="p-3">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-4 text-xl">
                        <i className="fa-regular fa-heart hover:text-red-500 cursor-pointer"></i>
                        <i className="fa-regular fa-comment cursor-pointer"></i>
                        <i className="fa-regular fa-paper-plane cursor-pointer"></i>
                    </div>
                    <i className="fa-regular fa-bookmark cursor-pointer"></i>
                </div>
                <div className="text-xs font-bold mb-2">Liked by mzansi_creator and others</div>
                <div className="text-xs leading-relaxed">
                    <span className="font-bold mr-2">purple_glow_sa</span>
                    {isEditing ? (
                        <textarea
                            className="w-full mt-2 p-2 border border-gray-300 rounded bg-gray-50 text-black focus:outline-none focus:border-blue-500"
                            rows={4}
                            value={localContent}
                            onChange={(e) => setLocalContent(e.target.value)}
                        />
                    ) : (
                        <span className="whitespace-pre-wrap">{localContent}</span>
                    )}
                </div>
                <div className="text-[10px] text-gray-400 mt-2 uppercase">2 HOURS AGO</div>
            </div>
        </div>
    );

    const renderTwitterPreview = () => (
        <div className="bg-black text-white rounded-xl overflow-hidden shadow-2xl max-w-md mx-auto font-sans border border-gray-800 p-4">
            <div className="flex gap-3">
                <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                        <img src="https://ui-avatars.com/api/?name=Purple+Glow&background=9D4EDD&color=fff" alt="User" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-sm mb-1">
                        <span className="font-bold">Purple Glow</span>
                        <i className="fa-solid fa-certificate text-blue-400 text-[10px]"></i>
                        <span className="text-gray-500">@purpleglow_sa · 1h</span>
                    </div>

                    <div className="text-sm leading-relaxed mb-3">
                        {isEditing ? (
                            <textarea
                                className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white focus:outline-none focus:border-blue-500"
                                rows={4}
                                value={localContent}
                                onChange={(e) => setLocalContent(e.target.value)}
                            />
                        ) : (
                            <div className="whitespace-pre-wrap">{localContent}</div>
                        )}
                    </div>

                    {state?.data?.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border border-gray-800 mb-3">
                            <img src={state.data.imageUrl} alt="Generated" className="w-full h-auto object-cover" />
                        </div>
                    )}

                    <div className="flex justify-between text-gray-500 text-sm max-w-xs">
                        <div className="flex items-center gap-2 hover:text-blue-400 cursor-pointer"><i className="fa-regular fa-comment"></i> <span>12</span></div>
                        <div className="flex items-center gap-2 hover:text-green-400 cursor-pointer"><i className="fa-solid fa-retweet"></i> <span>4</span></div>
                        <div className="flex items-center gap-2 hover:text-pink-500 cursor-pointer"><i className="fa-regular fa-heart"></i> <span>32</span></div>
                        <div className="flex items-center gap-2 hover:text-blue-400 cursor-pointer"><i className="fa-solid fa-share-nodes"></i></div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLinkedInPreview = () => (
        <div className="bg-white text-black rounded-xl overflow-hidden shadow-2xl max-w-md mx-auto font-sans border border-gray-300">
            <div className="p-3 flex gap-2 mb-1">
                <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=Purple+Glow&background=0077b5&color=fff" alt="User" />
                </div>
                <div>
                    <div className="text-sm font-bold leading-tight">Purple Glow SA</div>
                    <div className="text-xs text-gray-500">AI Social Assistant for Mzansi SMBs</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">1h • <i className="fa-solid fa-earth-americas"></i></div>
                </div>
            </div>

            <div className="px-3 pb-2 text-sm text-gray-800 leading-relaxed">
                {isEditing ? (
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-black focus:outline-none focus:border-blue-500"
                        rows={6}
                        value={localContent}
                        onChange={(e) => setLocalContent(e.target.value)}
                    />
                ) : (
                    <div className="whitespace-pre-wrap">{localContent}</div>
                )}
            </div>

            {state?.data?.imageUrl && (
                <div className="w-full bg-gray-100">
                    <img src={state.data.imageUrl} alt="Generated" className="w-full h-auto object-cover" />
                </div>
            )}

            <div className="px-3 py-2 border-t border-gray-200 mt-2">
                <div className="flex justify-around items-center">
                    <button className="flex items-center gap-1 text-gray-500 hover:bg-gray-100 px-2 py-3 rounded flex-1 justify-center transition-colors">
                        <i className="fa-regular fa-thumbs-up text-lg"></i> <span className="text-xs font-bold">Like</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 hover:bg-gray-100 px-2 py-3 rounded flex-1 justify-center transition-colors">
                        <i className="fa-regular fa-comment-dots text-lg"></i> <span className="text-xs font-bold">Comment</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 hover:bg-gray-100 px-2 py-3 rounded flex-1 justify-center transition-colors">
                        <i className="fa-solid fa-repeat text-lg"></i> <span className="text-xs font-bold">Repost</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 hover:bg-gray-100 px-2 py-3 rounded flex-1 justify-center transition-colors">
                        <i className="fa-regular fa-paper-plane text-lg"></i> <span className="text-xs font-bold">Send</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderFacebookPreview = () => (
        <div className="bg-white text-black rounded-xl overflow-hidden shadow-2xl max-w-md mx-auto font-sans border border-gray-300">
            <div className="p-3 flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=Purple+Glow&background=1877F2&color=fff" alt="User" />
                </div>
                <div>
                    <div className="text-sm font-bold text-gray-900">Purple Glow SA</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">Just now • <i className="fa-solid fa-earth-americas"></i></div>
                </div>
                <i className="fa-solid fa-ellipsis ml-auto text-gray-500"></i>
            </div>

            <div className="px-3 pb-2 text-sm text-gray-900 leading-relaxed">
                {isEditing ? (
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-black focus:outline-none focus:border-blue-500"
                        rows={4}
                        value={localContent}
                        onChange={(e) => setLocalContent(e.target.value)}
                    />
                ) : (
                    <div className="whitespace-pre-wrap">{localContent}</div>
                )}
            </div>

            {state?.data?.imageUrl && (
                <div className="w-full bg-gray-100 border-t border-b border-gray-200">
                    <img src={state.data.imageUrl} alt="Generated" className="w-full h-auto object-cover" />
                </div>
            )}

            <div className="px-3 py-2">
                <div className="flex justify-between items-center text-gray-500 text-xs mb-2">
                    <div className="flex items-center gap-1"><i className="fa-solid fa-thumbs-up text-blue-500"></i> 15</div>
                    <div>3 Comments</div>
                </div>
                <div className="border-t border-gray-200 pt-1 flex justify-between">
                    <button className="flex-1 py-2 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded flex items-center justify-center gap-2"><i className="fa-regular fa-thumbs-up"></i> Like</button>
                    <button className="flex-1 py-2 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded flex items-center justify-center gap-2"><i className="fa-regular fa-comment"></i> Comment</button>
                    <button className="flex-1 py-2 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded flex items-center justify-center gap-2"><i className="fa-solid fa-share"></i> Share</button>
                </div>
            </div>
        </div>
    );

    const renderPlatformPreview = () => {
        switch (platform) {
            case 'instagram': return renderInstagramPreview();
            case 'twitter': return renderTwitterPreview();
            case 'linkedin': return renderLinkedInPreview();
            case 'facebook': return renderFacebookPreview();
            default: return renderInstagramPreview();
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* INPUT CARD */}
            <div className="aerogel-card p-8 rounded-3xl relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 h-fit">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-grape opacity-10 blur-3xl rounded-full pointer-events-none"></div>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-joburg-teal border border-glass-border shadow-[0_0_15px_-5px_#00E0FF]">
                        <i className="fa-solid fa-pen-nib"></i>
                    </div>
                    <h3 className="font-display font-bold text-2xl">Content Architect</h3>
                </div>

                <form action={formAction} className="space-y-6">
                    {/* Hidden field to pass language */}
                    <input type="hidden" name="language" value={currentLanguage} />
                    
                    <div>
                        <label className="block font-mono text-xs text-gray-400 mb-2">TOPIC / PRODUCT</label>
                        <textarea
                            name="topic"
                            rows={4}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. A summer sale on futuristic sneakers for urban explorers in Joburg..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-neon-grape focus:bg-white/10 focus:outline-none transition-all font-body resize-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-mono text-xs text-gray-400 mb-2">VIBE CHECK</label>
                            <CustomSelect
                                value={vibe}
                                onChange={setVibe}
                                options={[
                                    { value: "Mzansi Cool (Local Slang)", label: "Mzansi Cool 🇿🇦" },
                                    { value: "Professional Corporate", label: "Corporate Pro" },
                                    { value: "High Energy Cyberpunk", label: "Cyberpunk Energy" },
                                    { value: "Warm & Community", label: "Warm Community" }
                                ]}
                                placeholder="Select vibe"
                            />
                            <input type="hidden" name="vibe" value={vibe} />
                        </div>
                        <div>
                            <label className="block font-mono text-xs text-gray-400 mb-2">PLATFORM</label>
                            <CustomSelect
                                value={platform}
                                onChange={setPlatform}
                                options={[
                                    { value: "instagram", label: "Instagram", icon: "fa-brands fa-instagram", color: "text-pink-500" },
                                    { value: "twitter", label: "Twitter / X", icon: "fa-brands fa-twitter", color: "text-blue-400" },
                                    { value: "linkedin", label: "LinkedIn", icon: "fa-brands fa-linkedin", color: "text-blue-600" },
                                    { value: "facebook", label: "Facebook", icon: "fa-brands fa-facebook", color: "text-blue-500" }
                                ]}
                                placeholder="Select platform"
                            />
                            <input type="hidden" name="platform" value={platform} />
                        </div>
                    </div>

                    {state?.error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono">
                            ERROR: {state.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-4 bg-gradient-to-r from-neon-grape to-[#5A189A] text-white font-body font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(157,78,221,0.4)] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <>
                                <i className="fa-solid fa-circle-notch animate-spin"></i> Processing...
                            </>
                        ) : (
                            <>
                                <span className="group-hover:animate-pulse">Initialize Generation</span> <i className="fa-solid fa-wand-magic-sparkles"></i>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* OUTPUT CARD */}
            <div className="aerogel-card p-8 rounded-3xl relative overflow-hidden flex flex-col min-h-[500px] bg-black/40 backdrop-blur-xl border border-white/10">

                {isPending && (
                    <div className="absolute inset-0 z-20 bg-void/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-neon-grape animate-spin mb-6"></div>
                        <h4 className="font-display font-bold text-xl mb-2">Consulting the Neural Net</h4>
                        <p className="font-mono text-joburg-teal text-sm animate-pulse">Generating Text & Rendering Visuals...</p>
                        <div className="mt-8 font-mono text-xs text-gray-500">
                            <div>AI MODEL: GEMINI 2.5 FLASH</div>
                            <div>VISUAL MODEL: IMAGEN 3</div>
                        </div>
                    </div>
                )}

                {!localContent && !isPending && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                        <i className="fa-brands fa-space-awesome text-7xl mb-6"></i>
                        <p className="font-body text-xl">Awaiting input coordinates...</p>
                    </div>
                )}

                {localContent && !isPending && (
                    <div className="flex-1 flex flex-col h-full animate-enter">
                        <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] tracking-widest text-joburg-teal border border-joburg-teal/30 px-2 py-1 rounded bg-joburg-teal/10">PREVIEW MODE</span>
                                <span className="text-xs text-gray-400 capitalize">• {platform}</span>
                            </div>
                            <div className="flex gap-2">
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-gray-400 hover:text-white transition-colors text-xs flex gap-2 items-center bg-white/5 px-3 py-1 rounded-lg border border-white/10 hover:border-neon-grape"
                                    >
                                        <i className="fa-solid fa-pen"></i> Edit Text
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="text-joburg-teal hover:text-white transition-colors text-xs flex gap-2 items-center bg-joburg-teal/10 px-3 py-1 rounded-lg border border-joburg-teal/30"
                                    >
                                        <i className="fa-solid fa-check"></i> Done
                                    </button>
                                )}
                                <button
                                    onClick={() => { navigator.clipboard.writeText(localContent); alert('Copied!') }}
                                    className="text-gray-400 hover:text-white transition-colors text-xs flex gap-2 items-center bg-white/5 px-3 py-1 rounded-lg border border-white/10 hover:border-white/50"
                                >
                                    <i className="fa-regular fa-copy"></i>
                                </button>
                            </div>
                        </div>

                        {/* Platform Specific Preview Container */}
                        <div className="flex-1 flex items-center justify-center py-4 bg-black/20 rounded-xl border border-white/5 overflow-y-auto mb-6 custom-scrollbar">
                            {renderPlatformPreview()}
                        </div>

                        <div className="mt-auto pt-4 border-t border-white/10 flex gap-4">
                            <button
                                onClick={handleDiscard}
                                className="flex-1 py-3 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors text-sm font-bold"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSchedule}
                                className="flex-1 py-3 bg-white text-black rounded-xl hover:scale-105 transition-transform text-sm font-bold shadow-lg flex items-center justify-center gap-2"
                            >
                                <i className="fa-regular fa-calendar-check"></i> Schedule Post
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Schedule Modal */}
            <SchedulePostModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                postContent={localContent}
                platform={platform.charAt(0).toUpperCase() + platform.slice(1)}
            />
        </div>
    );
}