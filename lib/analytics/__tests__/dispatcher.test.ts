// lib/analytics/__tests__/dispatcher.test.ts
// Unit tests for the analytics dispatcher.
// Run with: npx jest lib/analytics/__tests__/dispatcher.test.ts

import { dispatchTrack, dispatchIdentify, dispatchReset } from '../dispatcher';

// --- Mocks ---
jest.mock('posthog-js', () => ({
  capture: jest.fn(),
  identify: jest.fn(),
  reset: jest.fn(),
}));

jest.mock('../providers/AmplitudeProvider', () => ({
  amplitudeTrack: jest.fn(),
  amplitudeIdentify: jest.fn(),
  amplitudeReset: jest.fn(),
}));

import posthog from 'posthog-js';
import {
  amplitudeTrack,
  amplitudeIdentify,
  amplitudeReset,
} from '../providers/AmplitudeProvider';

// Ensure window is defined for all tests
Object.defineProperty(global, 'window', { value: global, writable: true });

// ─────────────────────────────────────────────────────────────────────────────
// dispatchTrack
// ─────────────────────────────────────────────────────────────────────────────
describe('dispatchTrack', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls posthog.capture with event name and properties', () => {
    dispatchTrack('lesson_started', { level_id: '1' });
    expect(posthog.capture).toHaveBeenCalledWith('lesson_started', { level_id: '1' });
  });

  it('calls amplitudeTrack with the same event name and properties', () => {
    dispatchTrack('lesson_started', { level_id: '1' });
    expect(amplitudeTrack).toHaveBeenCalledWith('lesson_started', { level_id: '1' });
  });

  it('does NOT throw if PostHog throws — Amplitude still fires', () => {
    (posthog.capture as jest.Mock).mockImplementationOnce(() => {
      throw new Error('PostHog network error');
    });
    expect(() => dispatchTrack('paywall_viewed')).not.toThrow();
    expect(amplitudeTrack).toHaveBeenCalledWith('paywall_viewed', {});
  });

  it('does NOT throw if Amplitude throws — PostHog still fires', () => {
    (amplitudeTrack as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Amplitude network error');
    });
    expect(() => dispatchTrack('paywall_viewed')).not.toThrow();
    expect(posthog.capture).toHaveBeenCalledWith('paywall_viewed', {});
  });

  it('defaults to empty properties if none are passed', () => {
    dispatchTrack('onboarding_started');
    expect(posthog.capture).toHaveBeenCalledWith('onboarding_started', {});
    expect(amplitudeTrack).toHaveBeenCalledWith('onboarding_started', {});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// dispatchIdentify
// ─────────────────────────────────────────────────────────────────────────────
describe('dispatchIdentify', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls posthog.identify with userId and traits', () => {
    dispatchIdentify('user-123', { role: 'student', plan: 'premium' });
    expect(posthog.identify).toHaveBeenCalledWith('user-123', { role: 'student', plan: 'premium' });
  });

  it('calls amplitudeIdentify with the same userId and traits', () => {
    dispatchIdentify('user-123', { role: 'student', plan: 'premium' });
    expect(amplitudeIdentify).toHaveBeenCalledWith('user-123', { role: 'student', plan: 'premium' });
  });

  it('skips both providers when userId is empty', () => {
    dispatchIdentify('');
    expect(posthog.identify).not.toHaveBeenCalled();
    expect(amplitudeIdentify).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// dispatchReset
// ─────────────────────────────────────────────────────────────────────────────
describe('dispatchReset', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls posthog.reset and amplitudeReset', () => {
    dispatchReset();
    expect(posthog.reset).toHaveBeenCalled();
    expect(amplitudeReset).toHaveBeenCalled();
  });

  it('does NOT throw if posthog.reset throws', () => {
    (posthog.reset as jest.Mock).mockImplementationOnce(() => {
      throw new Error('PostHog reset failed');
    });
    expect(() => dispatchReset()).not.toThrow();
    expect(amplitudeReset).toHaveBeenCalled();
  });
});

