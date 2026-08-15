import React from "react";
import { Composition, registerRoot } from "remotion";
import { RemotionRoot } from "./src/index";

const Root = () => (
  <Composition id="CrashLabDemo" component={RemotionRoot} durationInFrames={5220} fps={30} width={1920} height={1080} />
);

registerRoot(Root);
