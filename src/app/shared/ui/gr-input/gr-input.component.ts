import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

let nextInputId = 0;

@Component({
  selector: 'gr-input',
  templateUrl: './gr-input.component.html',
  styleUrl: './gr-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrInputComponent {
  @Input({ required: true }) label = '';
  @Input() type: 'text' | 'search' | 'email' | 'number' = 'text';
  @Input() value = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() disabled = false;
  @Output() readonly valueChange = new EventEmitter<string>();
  readonly inputId = `gr-input-${nextInputId++}`;
  onInput(event: Event): void { this.valueChange.emit((event.target as HTMLInputElement).value); }
}
