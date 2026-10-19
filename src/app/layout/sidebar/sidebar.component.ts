import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideActivity, LucideClipboardList, LucideFilePlus, LucideFileText, LucideLayoutDashboard, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideActivity, LucideClipboardList, LucideFilePlus, LucideFileText, LucideLayoutDashboard, LucideX],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input() mobileOpen = false;
  @Output() readonly closed = new EventEmitter<void>();
}
