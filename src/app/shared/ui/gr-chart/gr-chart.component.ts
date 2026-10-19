import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, Input, OnChanges, SimpleChanges, ViewChild, inject } from '@angular/core';
import type { EChartsOption } from 'echarts';
import type { EChartsType } from 'echarts/core';

@Component({ selector: 'gr-chart', templateUrl: './gr-chart.component.html', styleUrl: './gr-chart.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class GrChartComponent implements AfterViewInit, OnChanges {
  private readonly destroyRef = inject(DestroyRef);
  private chart?: EChartsType;
  @ViewChild('host', { static: true }) private readonly host!: ElementRef<HTMLDivElement>;
  @Input({ required: true }) option: EChartsOption = {};
  @Input() ariaLabel = 'Data visualization';

  ngAfterViewInit(): void { void this.initialize(); }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['option'] && this.chart) this.chart.setOption(this.option, true);
  }

  private async initialize(): Promise<void> {
    const [{ init, use }, { BarChart, LineChart, PieChart }, { GridComponent, LegendComponent, TooltipComponent }, { CanvasRenderer }] = await Promise.all([
      import('echarts/core'), import('echarts/charts'), import('echarts/components'), import('echarts/renderers'),
    ]);
    use([BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);
    this.chart = init(this.host.nativeElement);
    this.chart.setOption(this.option);
    const observer = new ResizeObserver(() => this.chart?.resize());
    observer.observe(this.host.nativeElement);
    this.destroyRef.onDestroy(() => { observer.disconnect(); this.chart?.dispose(); });
  }
}
