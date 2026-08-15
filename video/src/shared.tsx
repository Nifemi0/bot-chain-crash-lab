import React from "react";
import {AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";

export const INK = "#111315";
export const CREAM = "#f2eee4";
export const YELLOW = "#f5c52b";
export const BLUE = "#5ac8ff";
export const GREEN = "#70e29a";

export const SceneShell = ({index, kicker, title, body, dark = false, children}: {index: string; kicker: string; title: string; body: string; dark?: boolean; children?: React.ReactNode}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{backgroundColor: dark ? INK : CREAM, color: dark ? CREAM : INK, padding: "92px 104px 86px", overflow: "hidden", fontFamily: "Arial, Helvetica, sans-serif"}}>
    <div style={{position: "absolute", inset: 0, opacity: .17, backgroundImage: "linear-gradient(rgba(128,128,128,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,.16) 1px, transparent 1px)", backgroundSize: "54px 54px", translate: `${interpolate(frame, [0, 12 * fps], [0, -54], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}px 0px`}} />
    <Interactive.Div name="Scene number" style={{position: "absolute", right: 104, top: 72, fontSize: 24, fontWeight: 900, letterSpacing: 4, color: YELLOW}}>{index}</Interactive.Div>
    <Interactive.Div name="Kicker" style={{fontSize: 22, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase", opacity: interpolate(frame, [0, 12], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>{kicker}</Interactive.Div>
    <Interactive.Div name="Title" style={{fontSize: 86, lineHeight: .98, letterSpacing: -3, fontWeight: 950, maxWidth: 1380, marginTop: 28, opacity: interpolate(frame, [5, 24], [0, 1], {easing: Easing.bezier(.16,1,.3,1), extrapolateLeft: "clamp", extrapolateRight: "clamp"}), translate: interpolate(frame, [5, 24], ["0px 36px", "0px 0px"], {easing: Easing.bezier(.16,1,.3,1), extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>{title}</Interactive.Div>
    <Interactive.Div name="Body" style={{fontSize: 38, lineHeight: 1.32, maxWidth: 1350, marginTop: 30, opacity: interpolate(frame, [16, 34], [0, .78], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>{body}</Interactive.Div>
    <div style={{marginTop: 42, opacity: interpolate(frame, [28, 48], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}), translate: interpolate(frame, [28, 48], ["0px 24px", "0px 0px"], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>{children}</div>
    <div style={{position: "absolute", left: 104, right: 104, bottom: 45, height: 4, background: dark ? "#34383c" : "#d9d2c4"}}><div style={{height: "100%", width: `${interpolate(frame, [0, 12 * fps], [0, 100], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}%`, background: YELLOW}} /></div>
  </AbsoluteFill>;
};

export const Chip = ({children, tone = "yellow"}: {children: React.ReactNode; tone?: "yellow"|"blue"|"green"|"dark"}) => <div style={{display: "inline-flex", alignItems: "center", minHeight: 58, padding: "0 24px", borderRadius: 999, border: `2px solid ${tone === "dark" ? CREAM : INK}`, background: tone === "yellow" ? YELLOW : tone === "blue" ? BLUE : tone === "green" ? GREEN : INK, color: tone === "dark" ? CREAM : INK, fontSize: 24, fontWeight: 900, letterSpacing: 1.2, textTransform: "uppercase"}}>{children}</div>;

export const Card = ({label, value, detail, accent = YELLOW}: {label: string; value: string; detail: string; accent?: string}) => <div style={{width: 420, minHeight: 188, padding: 28, border: `2px solid ${INK}`, background: "#fffaf0", boxShadow: `10px 10px 0 ${accent}`}}><div style={{fontSize: 18, fontWeight: 900, letterSpacing: 2.5, textTransform: "uppercase"}}>{label}</div><div style={{fontSize: 42, fontWeight: 950, marginTop: 18}}>{value}</div><div style={{fontSize: 22, marginTop: 12, opacity: .65}}>{detail}</div></div>;

export const Logo = ({size = 86}: {size?: number}) => <Img src={staticFile("images/crash-lab-mark.png")} style={{width: size, height: size, objectFit: "contain"}} />;

export const EvidenceRow = ({id, label, delay = 0, status = "VERIFIED"}: {id: string; label: string; delay?: number; status?: string}) => {
  const frame = useCurrentFrame();
  return <div style={{display: "flex", alignItems: "center", gap: 22, padding: "20px 26px", border: "1px solid #555b61", background: "#1a1d20", opacity: interpolate(frame, [delay, delay + 16], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}), translate: interpolate(frame, [delay, delay + 16], ["30px 0px", "0px 0px"], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}><code style={{color: YELLOW, fontSize: 22, fontWeight: 900}}>{id}</code><span style={{fontSize: 27, color: CREAM}}>{label}</span><span style={{marginLeft: "auto", color: GREEN, fontSize: 22}}>{status}</span></div>;
};
