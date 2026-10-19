import { InjectionToken } from '@angular/core';

export interface AppConfig { apiBaseUrl: string; demoMode: boolean }
export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
export const DEMO_MODE = new InjectionToken<boolean>('DEMO_MODE');
