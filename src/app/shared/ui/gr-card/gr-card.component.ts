import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'gr-card',
  templateUrl: './gr-card.component.html',
  styleUrl: './gr-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrCardComponent { @Input() title = ''; }
