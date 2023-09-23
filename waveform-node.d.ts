export function getWaveForm(filepath: string, options: {
  numOfSample: number;
  waveformType: string;
  samplesPerSecond: number;
}, callback: (arg0: Error, arg1: number[]) => any): void;
export { waveformTypeEnum as waveformType };
declare namespace waveformTypeEnum {
  const STACK: number;
  const LINE: number;
}
