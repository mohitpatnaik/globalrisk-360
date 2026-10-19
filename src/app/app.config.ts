import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { API_BASE_URL, APP_CONFIG, DEMO_MODE } from './core/tokens/app-config.token';
import { POLICY_API } from './core/api/policy.api';
import { CLAIM_API } from './core/api/claim.api';
import { ACTIVITY_API } from './core/api/activity.api';
import { DASHBOARD_API } from './core/api/dashboard.api';
import { REFERENCE_DATA_API } from './core/api/reference-data.api';
import { InMemoryActivityApi, InMemoryApi, InMemoryClaimApi, InMemoryPolicyApi } from './core/api/in-memory-api.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: APP_CONFIG, useValue: { apiBaseUrl: environment.apiBaseUrl, demoMode: environment.demoMode } },
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    { provide: DEMO_MODE, useValue: environment.demoMode },
    { provide: POLICY_API, useExisting: InMemoryPolicyApi },
    { provide: CLAIM_API, useExisting: InMemoryClaimApi },
    { provide: ACTIVITY_API, useExisting: InMemoryActivityApi },
    { provide: DASHBOARD_API, useExisting: InMemoryApi },
    { provide: REFERENCE_DATA_API, useExisting: InMemoryApi },
  ]
};
