import React from "react";
import {Audio} from "@remotion/media";
import {TransitionSeries, linearTiming} from "@remotion/transitions";
import {fade} from "@remotion/transitions/fade";
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from "remotion";
import {HookScene} from "./scenes/01-hook";
import {IntroScene} from "./scenes/02-intro";
import {LiveScanScene} from "./scenes/03-live-scan";
import {CoverageScene} from "./scenes/04-coverage";
import {EvidenceScene} from "./scenes/05-evidence";
import {AiScene} from "./scenes/06-ai";
import {FallbackScene} from "./scenes/07-fallback";
import {HistoryScene} from "./scenes/08-history";
import {CrashScene} from "./scenes/09-crash";
import {PassportScene} from "./scenes/10-passport";
import {CloseScene} from "./scenes/11-close";

export const MainVideo = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={360} name="Hook"><HookScene/></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:18})}/>
      <TransitionSeries.Sequence durationInFrames={360} name="Mission"><IntroScene/></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:18})}/>
      <TransitionSeries.Sequence durationInFrames={600} name="Live scan"><LiveScanScene/></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:18})}/>
      <TransitionSeries.Sequence durationInFrames={540} name="Coverage"><CoverageScene/></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:18})}/>
      <TransitionSeries.Sequence durationInFrames={510} name="Evidence"><EvidenceScene/></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:18})}/>
      <TransitionSeries.Sequence durationInFrames={600} name="DeepSeek"><AiScene/></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:18})}/>
      <TransitionSeries.Sequence durationInFrames={420} name="Fallback"><FallbackScene/></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:18})}/>
      <TransitionSeries.Sequence durationInFrames={360} name="Private history"><HistoryScene/></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:18})}/>
      <TransitionSeries.Sequence durationInFrames={540} name="Canonical crash"><CrashScene/></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:18})}/>
      <TransitionSeries.Sequence durationInFrames={450} name="Passport"><PassportScene/></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:18})}/>
      <TransitionSeries.Sequence durationInFrames={660} name="Close"><CloseScene/></TransitionSeries.Sequence>
    </TransitionSeries>
    <Audio src={staticFile("voiceover/crash-lab-demo-v2.mp3")} volume={1}/>
    <Audio src={staticFile("audio/ambient-bed.m4a")} loop loopVolumeCurveBehavior="extend" volume={(f)=>interpolate(f,[0,60,5070,5220],[0,.075,.075,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})}/>
    <div style={{position:"absolute",top:0,left:0,right:0,height:5,background:"rgba(255,255,255,.18)"}}><div style={{height:"100%",width:`${interpolate(frame,[0,5219],[0,100],{extrapolateRight:"clamp"})}%`,background:"#f5c52b"}}/></div>
  </AbsoluteFill>;
};
