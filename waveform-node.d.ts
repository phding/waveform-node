export function getWaveForm(filepath: string, options: {
  numOfSample: number;
  waveformType: number;
  samplesPerSecond: number;
}, callback: (error: Error, peaks: number[]) => any): void;
export { waveformTypeEnum as waveformType };
declare namespace waveformTypeEnum {
  const STACK: number;
  const LINE: number;
}
