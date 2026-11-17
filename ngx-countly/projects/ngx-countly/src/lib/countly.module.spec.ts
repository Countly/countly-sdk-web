import { Component, ErrorHandler, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { COUNTLY_LOADER } from './countly.config';
import { CountlyErrorHandler } from './countly-error-handler';
import { CountlyModule } from './countly.module';
import { CountlyService } from './countly.service';

function fakeSdk() {
  const calls: [string, unknown[]][] = [];
  const record = (name: string) => (...args: unknown[]) => void calls.push([name, args]);
  const sdk = { init: record('init'), track_sessions: record('track_sessions'), add_event: record('add_event'), track_pageview: record('track_pageview') };
  return { sdk, named: (name: string) => calls.filter(([n]) => n === name).map(([, args]) => args) };
}

@Component({ standalone: false, template: '' })
class PageComponent {}

// a feature module: only the directive, no providers
@Component({ standalone: false, template: `<button countlyEvent="signup">Sign up</button>` })
class SignupComponent {}

@NgModule({ imports: [CountlyModule], declarations: [SignupComponent], exports: [SignupComponent] })
class SignupModule {}

describe('CountlyModule', () => {
  function setup(config: Parameters<typeof CountlyModule.forRoot>[0]) {
    const fake = fakeSdk();
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([{ path: '', component: PageComponent }, { path: 'pricing', component: PageComponent }]),
        CountlyModule.forRoot(config),
        SignupModule,
      ],
      declarations: [PageComponent],
      providers: [{ provide: COUNTLY_LOADER, useValue: () => Promise.resolve({ default: fake.sdk }) }],
    });
    return { ...fake, countly: TestBed.inject(CountlyService) };
  }

  const settle = async (countly: CountlyService) => { await countly.sdk(); await Promise.resolve(); };

  it('starts the SDK like provideCountly, without the module-only options', async () => {
    const { countly, named } = setup({ appKey: 'key', url: 'https://countly.test', routerTracking: true, errorHandler: true });
    await settle(countly);
    expect(named('init')).toEqual([[{ app_key: 'key', url: 'https://countly.test', debug: false }]]);
    expect(named('track_sessions').length).toBe(1);
  });

  it('turns on router tracking and the error handler from the config', async () => {
    const { countly, named } = setup({ appKey: 'key', url: 'https://countly.test', routerTracking: { viewName: () => 'Named' }, errorHandler: true });
    expect(TestBed.inject(ErrorHandler)).toBeInstanceOf(CountlyErrorHandler);
    await TestBed.inject(Router).navigateByUrl('/pricing');
    await settle(countly);
    expect(named('track_pageview')).toEqual([['Named', undefined, undefined]]);
  });

  it('leaves both off unless asked', async () => {
    const { countly, named } = setup({ appKey: 'key', url: 'https://countly.test' });
    expect(TestBed.inject(ErrorHandler)).not.toBeInstanceOf(CountlyErrorHandler);
    await TestBed.inject(Router).navigateByUrl('/pricing');
    await settle(countly);
    expect(named('track_pageview')).toEqual([]);
  });

  it('gives declared components in feature modules the countlyEvent directive', async () => {
    const { countly, named } = setup({ appKey: 'key', url: 'https://countly.test' });
    const fixture = TestBed.createComponent(SignupComponent);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();
    await settle(countly);
    expect(named('add_event')).toEqual([[{ key: 'signup', count: 1 }]]);
  });
});
