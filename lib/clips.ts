import clipsData from "./clips-index.json";
import metricsData from "./metrics.json";

export type VesselClass = "cargo" | "tanker" | "passenger" | "tug";

export type Clip = {
  id: string;
  trueClass: VesselClass;
  sourceFile: string;
  startSec: number;
  split: "train" | "test";
  spectrogramPath: string;
  audioPath: string;
  bandEnergy: { low: number; mid: number; high: number };
  predictedClass: VesselClass;
  confidence: Record<VesselClass, number>;
};

export type Metrics = {
  classes: VesselClass[];
  model: string;
  nTrainWindows: number;
  nTestWindows: number;
  testAccuracy: number;
  perClass: Record<VesselClass, { precision: number; recall: number; f1: number }>;
  confusionMatrix: number[][];
  note: string;
};

export const clips = clipsData as Clip[];
export const metrics = metricsData as Metrics;

export const CLASS_LABEL: Record<VesselClass, string> = {
  cargo: "Cargo",
  tanker: "Tanker",
  passenger: "Passenger",
  tug: "Tug",
};

export function getClip(id: string): Clip | undefined {
  return clips.find((c) => c.id === id);
}

export function isCorrect(clip: Clip): boolean {
  return clip.trueClass === clip.predictedClass;
}
