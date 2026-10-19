import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'gr-badge',
  templateUrl: './gr-badge.component.html',
  styleUrl: './gr-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrBadgeComponent { @Input() tone: BadgeTone = 'neutral'; }
