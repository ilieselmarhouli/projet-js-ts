export interface ChartInstance {
  destroy(): void;
}

declare global {
  const Chart: {
    new (item: HTMLCanvasElement, config: unknown): ChartInstance;
  };
}

export {};
