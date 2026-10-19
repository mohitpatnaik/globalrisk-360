import { ClaimAction } from '../models/claim.model';

export const CLAIM_ACTION_LABELS: Record<ClaimAction, string> = {
  SUBMIT: 'Submit',
  START_REVIEW: 'Start review',
  REQUEST_INFO: 'Request information',
  RESUBMIT: 'Resubmit',
  APPROVE: 'Approve',
  REJECT: 'Reject',
  SETTLE: 'Settle',
  CLOSE: 'Close',
  REOPEN: 'Reopen',
};
