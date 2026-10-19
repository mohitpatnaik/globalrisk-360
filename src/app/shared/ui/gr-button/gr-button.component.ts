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
  // Default to 'button' so a gr-button inside a <form> never acts as an implicit
  // submit. Without this, every Continue click in the claim wizard also fired the
  // form's ngSubmit, submitting the claim prematurely once the form was valid.
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() readonly pressed = new EventEmitter<void>();
}
