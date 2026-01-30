import React from 'react';
import { Rocket, Clock, ArrowLeft, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComingSoonPageProps {
    title?: string;
    description?: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
    title = "Feature Coming Soon",
    description = "We're currently building the next generation of this module. It will be available shortly with enhanced capabilities and a premium experience."
}) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-16 text-center relative overflow-hidden group">
                {/* Background Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 group-hover:bg-[#1A2E6E]/5 transition-colors duration-700"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 group-hover:bg-[#1A2E6E]/5 transition-colors duration-700"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="p-5 bg-slate-50 rounded-3xl mb-8 relative">
                        <div className="absolute inset-0 bg-[#1A2E6E]/5 rounded-3xl animate-pulse"></div>
                        <Rocket className="w-12 h-12 text-[#1A2E6E] relative z-10" />

                        <div className="absolute -top-2 -right-2 flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500"></span>
                        </div>
                    </div>

                    <span className="px-4 py-1.5 bg-[#1A2E6E]/10 text-[#1A2E6E] text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">
                        Module Under Construction
                    </span>

                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
                        {title}
                    </h1>

                    <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10 max-w-lg mx-auto">
                        {description}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-8 py-4 bg-[#1A2E6E] text-white font-bold rounded-2xl shadow-xl shadow-[#1A2E6E]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Return to Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all text-sm flex items-center gap-2"
                        >
                            <Layout className="w-4 h-4" />
                            Overview
                        </button>
                    </div>

                    <div className="mt-16 flex items-center gap-8 border-t border-slate-100 pt-10 w-full justify-center">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl font-black text-slate-300 tracking-tighter">01</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Design Phase<br />Complete</span>
                        </div>
                        <div className="w-12 h-px bg-slate-100"></div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl font-black text-[#1A2E6E] tracking-tighter">02</span>
                            <span className="text-[10px] font-bold text-[#1A2E6E] uppercase tracking-widest text-center">Development<br />In Progress</span>
                        </div>
                        <div className="w-12 h-px bg-slate-100"></div>
                        <div className="flex flex-col items-center gap-1 opacity-30">
                            <span className="text-2xl font-black text-slate-300 tracking-tighter">03</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Deployment<br />Coming Soon</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComingSoonPage;
