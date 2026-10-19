import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly pending = signal<((result: boolean) => void) | null>(null);

  /** Opens a confirm dialog and returns a promise that resolves when the user responds. */
  confirm(message: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      // Simple approach: use native confirm for the demo
      const result = window.confirm(message);
      resolve(result);
    });
  }
}
