import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'gr-button',
  templateUrl: './gr-button.component.html',
  styleUrl: './gr-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Output() readonly pressed = new EventEmitter<void>();
}
