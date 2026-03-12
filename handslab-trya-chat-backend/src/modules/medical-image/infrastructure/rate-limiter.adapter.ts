import { Injectable } from '@nestjs/common';
import { IRateLimiter } from '../domain/interfaces';

/**
 * Infrastructure adapter for rate limiting medical image analysis
 * Implements queue-based rate limiting to prevent API throttling
 */
@Injectable()
export class RateLimiterAdapter implements IRateLimiter {
  private readonly maxRequestsPerMinute: number;
  private readonly requestDelayMs: number;
  private lastRequestTime = 0;
  private requestQueue: Array<{ resolve: () => void; reject: (error: Error) => void }> = [];
  private isProcessingQueue = false;

  constructor(maxRequestsPerMinute: number = 4) {
    this.maxRequestsPerMinute = maxRequestsPerMinute;
    this.requestDelayMs = Math.floor(60000 / this.maxRequestsPerMinute);
    
    console.log(`⏱️ RateLimiter initialized: ${this.maxRequestsPerMinute} req/min (delay: ${this.requestDelayMs}ms)`);
  }

  async waitForSlot(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      if (timeSinceLastRequest < this.requestDelayMs) {
        const waitTime = this.requestDelayMs - timeSinceLastRequest;
        console.log(`⏳ Rate limit: waiting ${Math.ceil(waitTime / 1000)}s before next request...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      const { resolve } = this.requestQueue.shift()!;
      this.lastRequestTime = Date.now();
      resolve();
    }

    this.isProcessingQueue = false;
  }

  getStatus(): {
    maxRequestsPerMinute: number;
    requestDelayMs: number;
    queueLength: number;
    timeSinceLastRequest: number;
    nextRequestAvailableIn: number;
  } {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const nextRequestAvailableIn = Math.max(0, this.requestDelayMs - timeSinceLastRequest);

    return {
      maxRequestsPerMinute: this.maxRequestsPerMinute,
      requestDelayMs: this.requestDelayMs,
      queueLength: this.requestQueue.length,
      timeSinceLastRequest,
      nextRequestAvailableIn,
    };
  }

  isProcessing(): boolean {
    return this.isProcessingQueue;
  }
}
