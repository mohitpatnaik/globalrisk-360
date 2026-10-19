import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const STATUS_TONES: Record<string, StatusTone> = {
  DRAFT: 'neutral', CLOSED: 'neutral', SUBMITTED: 'warning', INFO_REQUESTED: 'warning',
  UNDER_REVIEW: 'info', REOPENED: 'info', ACTIVE: 'success', APPROVED: 'success',
  SETTLED: 'success', REJECTED: 'danger', CANCELLED: 'danger', EXPIRED: 'danger',
};

@Component({
  selector: 'gr-status-indicator',
  templateUrl: './gr-status-indicator.component.html',
  styleUrl: './gr-status-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrStatusIndicatorComponent {
  @Input({ required: true }) status = 'DRAFT';
  get tone(): StatusTone { return STATUS_TONES[this.status] ?? 'neutral'; }
  get label(): string {
    const s = String(this.status ?? '');
    return s.toLowerCase().replace(/_/g, ' ').replace(/^./, (v) => v.toUpperCase());
  }
}
