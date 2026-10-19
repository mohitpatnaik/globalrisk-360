import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface TableColumn { key: string; label: string; numeric?: boolean }

@Component({
  selector: 'gr-table',
  templateUrl: './gr-table.component.html',
  styleUrl: './gr-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() rows: ReadonlyArray<Record<string, unknown>> = [];
  @Input() customBody = false;
  @Input() emptyMessage = 'No records match the current filters.';
  @Output() readonly rowSelected = new EventEmitter<Record<string, unknown>>();
  read(row: Record<string, unknown>, key: string): unknown { return row[key] ?? '—'; }
}
