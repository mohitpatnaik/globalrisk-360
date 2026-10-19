import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GrButtonComponent } from '../ui/gr-button/gr-button.component';
@Component({ selector: 'app-not-found', imports: [RouterLink, GrButtonComponent], templateUrl: './not-found.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class NotFoundComponent {}
