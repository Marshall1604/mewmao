"use client";

import React, { useEffect, useRef } from "react";
import { useStore } from "@/context/StoreContext";
import { Volume2, VolumeX } from "lucide-react";

export default function AmbientAudio() {
  const { isAudioPlaying, toggleAudio } = useStore();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (isAudioPlaying) {
      try {
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.04, ctx.currentTime);
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        // Warm underground lounge drone (F major chord harmonic tone)
        const osc1 = ctx.createOscillator();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(174.61, ctx.currentTime); // F3

        const osc2 = ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(261.63, ctx.currentTime); // C4

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(masterGain);

        osc1.start();
        osc2.start();
        osc1Ref.current = osc1;
        osc2Ref.current = osc2;
      } catch (e) {
        console.warn("AudioContext error", e);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [isAudioPlaying]);

  return (
    <button
      onClick={toggleAudio}
      title={isAudioPlaying ? "Tắt âm thanh ngầm" : "Bật âm thanh Underground Lounge"}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 bg-white/80 hover:bg-orange-50 border-zinc-200 text-zinc-700 hover:border-orange-300"
    >
      {isAudioPlaying ? (
        <>
          <span className="w-2 h-2 rounded-full bg-mewmao-orange animate-ping" />
          <Volume2 className="w-3.5 h-3.5 text-mewmao-orange" />
          <span className="hidden sm:inline text-[11px] text-mewmao-orange font-semibold">Underground Vibe: ON</span>
        </>
      ) : (
        <>
          <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline text-[11px] text-zinc-500">Âm thanh Lounge</span>
        </>
      )}
    </button>
  );
}
