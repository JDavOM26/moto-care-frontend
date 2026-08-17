import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private _isLoading = signal<boolean>(false);
  public readonly isLoading = this._isLoading.asReadonly();

  private requestCount = 0;
  private showTimeout: any;

  show() {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.showTimeout = setTimeout(() => {
        this._isLoading.set(true);
      }, 300);
    }
  }

  hide() {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      clearTimeout(this.showTimeout);
      this._isLoading.set(false);
    }
  }
}
