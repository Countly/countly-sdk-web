import { Directive, HostListener, inject, Input } from '@angular/core';
import { CountlyService } from './countly.service';

/**
 * Records a Countly event when the host is clicked:
 *
 * ```html
 * <button countlyEvent="signup" [countlySegmentation]="{ plan: 'pro' }">Sign up</button>
 * ```
 */
@Directive({
  selector: '[countlyEvent]',
  standalone: true,
})
export class CountlyEventDirective {
  private readonly countly = inject(CountlyService);

  /** The event key. */
  @Input({ required: true }) countlyEvent!: string;

  /** Segmentation sent with the event. */
  @Input() countlySegmentation?: Record<string, unknown>;

  @HostListener('click')
  onClick(): void {
    this.countly.event(this.countlyEvent, this.countlySegmentation ? { segmentation: this.countlySegmentation } : {});
  }
}
