import { Component, ErrorHandler, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { COUNTLY_LOADER } from './countly.config';
import { CountlyEventDirective } from './countly-event.directive';
import { CountlyErrorHandler } from './countly-error-handler';
import { CountlyService } from './countly.service';
import { provideCountly, withErrorHandler, withRouterTracking } from './provide-countly';

/** The calls a test SDK received, by method. */
function fakeSdk() {
  const calls: [string, unknown[]][] = [];
  const record = (name: string) => (...args: unknown[]) => void calls.push([name, args]);
  const sdk = {
    init: record('init'), track_sessions: record('track_sessions'), add_event: record('add_event'),
    start_event: record('start_event'), end_event: record('end_event'), track_pageview: record('track_pageview'),
    recordError: record('recordError'), user_details: record('user_details'), change_id: record('change_id'),
    add_consent: record('add_consent'), remove_consent: record('remove_consent'),
  };
  return { sdk, calls, named: (name: string) => calls.filter(([n]) => n === name).map(([, args]) => args) };
}

@Component({ standalone: true, template: '' })
class Page {}

@Component({
  standalone: true,
  imports: [CountlyEventDirective],
  template: `<button countlyEvent="signup" [countlySegmentation]="{ plan: 'pro' }">Sign up</button>`,
})
class WithButton {}

const config = { appKey: 'key', url: 'https://countly.test' };

function setup(platform = 'browser', ...features: Parameters<typeof provideCountly>[1][]) {
  const fake = fakeSdk();
  TestBed.configureTestingModule({
    providers: [
      { provide: PLATFORM_ID, useValue: platform },
      // the CommonJS shape the bundler gives a dynamic import
      { provide: COUNTLY_LOADER, useValue: () => Promise.resolve({ default: fake.sdk }) },
      provideRouter([{ path: '', component: Page }, { path: 'products/:id', component: Page }]),
      provideCountly(config, ...features),
    ],
  });
  return { ...fake, countly: TestBed.inject(CountlyService) };
}

describe('ngx-countly', () => {
  it('starts the SDK with the config and tracks sessions', async () => {
    const { countly, named } = setup();
    expect(await countly.sdk()).toBeDefined();
    expect(named('init')).toEqual([[{ app_key: 'key', url: 'https://countly.test', debug: false }]]);
    expect(named('track_sessions').length).toBe(1);
  });

  it('passes extra SDK options through and can skip session tracking', async () => {
    const fake = fakeSdk();
    TestBed.configureTestingModule({
      providers: [
        { provide: COUNTLY_LOADER, useValue: () => Promise.resolve(fake.sdk) },
        provideCountly({ ...config, trackSessions: false, sdk: { require_consent: true } }),
      ],
    });
    await TestBed.inject(CountlyService).sdk();
    expect(fake.named('init')).toEqual([[{ app_key: 'key', url: 'https://countly.test', debug: false, require_consent: true }]]);
    expect(fake.named('track_sessions')).toEqual([]);
  });

  it('queues calls made before the SDK has loaded', async () => {
    const { countly, named } = setup();
    countly.event('early', { sum: 3 });
    await countly.sdk();
    await Promise.resolve();
    expect(named('add_event')).toEqual([[{ key: 'early', count: 1, sum: 3 }]]);
  });

  it('wraps events, views, errors, users, ids and consent', async () => {
    const { countly, named } = setup();
    countly.event('buy', { count: 2, segmentation: { plan: 'pro' } });
    countly.startEvent('checkout');
    countly.endEvent('checkout', { sum: 9 });
    countly.view('Home', { tab: 'a' });
    countly.error(new Error('boom'));
    countly.error('as text', { fatal: true });
    countly.user({ name: 'Ada' });
    countly.changeId('user-1');
    countly.addConsent(['events', 'views']);
    countly.removeConsent('crashes');
    await countly.sdk();
    await Promise.resolve();

    expect(named('add_event')).toEqual([[{ key: 'buy', count: 2, segmentation: { plan: 'pro' } }]]);
    expect(named('start_event')).toEqual([['checkout']]);
    expect(named('end_event')).toEqual([[{ key: 'checkout', sum: 9 }]]);
    expect(named('track_pageview')).toEqual([['Home', undefined, { tab: 'a' }]]);
    const errors = named('recordError');
    expect((errors[0][0] as Error).message).toBe('boom');
    expect(errors[0][1]).toBe(true);
    expect((errors[1][0] as Error).message).toBe('as text');
    expect(errors[1][1]).toBe(false);
    expect(named('user_details')).toEqual([[{ name: 'Ada' }]]);
    expect(named('change_id')).toEqual([['user-1', true]]);
    expect(named('add_consent')).toEqual([[['events', 'views']]]);
    expect(named('remove_consent')).toEqual([['crashes']]);
  });

  it('does nothing on the server', async () => {
    const { countly, calls } = setup('server');
    countly.event('ignored');
    expect(await countly.sdk()).toBeUndefined();
    expect(await countly.run(() => 'never')).toBeUndefined();
    expect(calls).toEqual([]);
  });

  it('records a view per navigation, by path or a custom name', async () => {
    const { countly, named } = setup('browser', withRouterTracking({
      viewName: (url, route) => route.params['id'] ? 'Product' : url,
      segments: (_url, route) => route.params['id'] ? { id: route.params['id'] } : undefined,
    }));
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/?ref=mail');
    await router.navigateByUrl('/products/42#reviews');
    await countly.sdk();
    await Promise.resolve();
    expect(named('track_pageview')).toEqual([['/?ref=mail', undefined, undefined], ['Product', undefined, { id: '42' }]]);
  });

  it('names views by path without query or fragment by default', async () => {
    const { countly, named } = setup('browser', withRouterTracking());
    await TestBed.inject(Router).navigateByUrl('/products/7?ref=x#top');
    await countly.sdk();
    await Promise.resolve();
    expect(named('track_pageview')).toEqual([['/products/7', undefined, undefined]]);
  });

  it('reports uncaught errors as crashes and still logs them', async () => {
    const { countly, named } = setup('browser', withErrorHandler());
    const handler = TestBed.inject(ErrorHandler);
    expect(handler).toBeInstanceOf(CountlyErrorHandler);
    const log = spyOn(console, 'error');

    handler.handleError({ rejection: new Error('from a promise') });
    await countly.sdk();
    await Promise.resolve();

    const [[error, nonfatal]] = named('recordError');
    expect((error as Error).message).toBe('from a promise');
    expect(nonfatal).toBe(false);
    expect(log).toHaveBeenCalled();
  });

  it('records an event when a countlyEvent element is clicked', async () => {
    const { countly, named } = setup();
    const fixture = TestBed.createComponent(WithButton);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();
    await countly.sdk();
    await Promise.resolve();
    expect(named('add_event')).toEqual([[{ key: 'signup', count: 1, segmentation: { plan: 'pro' } }]]);
  });
});
