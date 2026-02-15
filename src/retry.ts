import axios, { AxiosRequestConfig } from 'axios';

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryOn: number[];
}

export class RequestRetry {
  private config: RetryConfig;

  constructor(config: RetryConfig) {
    this.config = config;
  }

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const res = await axios(config);
        return res.data;
      } catch (err) {
        lastError = err as Error;
        const status = (err as any).response?.status;
        
        if (status && !this.config.retryOn.includes(status)) {
          throw err;
        }
        
        if (attempt < this.config.maxRetries) {
          await new Promise(r => setTimeout(r, this.config.retryDelay * (attempt + 1)));
        }
      }
    }
    
    throw lastError;
  }
}
