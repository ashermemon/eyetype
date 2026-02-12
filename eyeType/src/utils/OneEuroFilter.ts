export class LowPassFilter {
  private alpha: number;
  private s: number | null = null;

  constructor(alpha: number) {
    this.alpha = alpha;
  }

  public filter(value: number): number {
    if (this.s === null) {
      this.s = value;
    } else {
      this.s = this.alpha * value + (1.0 - this.alpha) * this.s!;
    }
    return this.s!;
  }

  public setAlpha(alpha: number): void {
    if (alpha <= 0 || alpha > 1.0) {
      return;
    }
    this.alpha = alpha;
  }
}

export class OneEuroFilter {
  private xFilter: LowPassFilter;
  private dxFilter: LowPassFilter;
  private xPrev: number | null = null;
  private lastTime: number | null = null;
  private freq: number;
  private minCutoff: number;
  private beta: number;

  constructor(
    freq: number,
    minCutoff: number = 1.0,
    beta: number = 0.007,
    dCutoff: number = 1.0
  ) {
    this.freq = freq;
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.xFilter = new LowPassFilter(this.alpha(minCutoff));
    this.dxFilter = new LowPassFilter(this.alpha(dCutoff));
  }

  private alpha(cutoff: number): number {
    const te = 1.0 / this.freq;
    const r = 2.0 * Math.PI * cutoff * te;
    const a = r / (r + 1.0);
    return Math.max(0, Math.min(1, a));
  }

  public filter(value: number, timestamp: number | null = null): number {
    if (this.lastTime !== null && timestamp !== null) {
      const dt = (timestamp - this.lastTime) / 1000.0;
      if (dt > 0) {
        this.freq = 1.0 / dt;
      }
    }
    this.lastTime = timestamp;

    const dx = this.xPrev === null ? 0 : (value - this.xPrev) * this.freq;
    const edx = this.dxFilter.filter(dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    
    this.xFilter.setAlpha(this.alpha(cutoff));
    const result = this.xFilter.filter(value);
    this.xPrev = result;
    return result;
  }
}
