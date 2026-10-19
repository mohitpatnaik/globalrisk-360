import { ClaimStateMachine } from './claim-state-machine';

describe('ClaimStateMachine', () => {
  it('allows an underwriter to start review of a submitted claim', () => {
    expect(ClaimStateMachine.nextStatus('SUBMITTED', 'START_REVIEW', 'UNDERWRITER'))
      .toBe('UNDER_REVIEW');
  });

  it('prevents a viewer from changing claim state', () => {
    expect(ClaimStateMachine.actionsFor('SUBMITTED', 'VIEWER')).toEqual([]);
  });
});
