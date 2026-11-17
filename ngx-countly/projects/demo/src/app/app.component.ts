import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CountlyEventDirective, CountlyService } from 'ngx-countly';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CountlyEventDirective],
  template: `
    <h1>ngx-countly demo</h1>
    <nav><a routerLink="/">Home</a> · <a routerLink="/pricing">Pricing</a></nav>
    <router-outlet />
    <p>
      <button countlyEvent="signup" [countlySegmentation]="{ plan: 'pro' }">Sign up (directive)</button>
      <button (click)="buy()">Buy (service)</button>
      <button (click)="crash()">Throw an error</button>
    </p>
  `,
})
export class AppComponent {
  private readonly countly = inject(CountlyService);

  buy() {
    this.countly.event('purchase', { sum: 49, segmentation: { currency: 'EUR' } });
  }

  crash() {
    throw new Error('demo crash');
  }
}
