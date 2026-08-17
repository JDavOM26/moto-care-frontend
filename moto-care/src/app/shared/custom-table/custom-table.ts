import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  QueryList,
  TemplateRef,
  ViewChild,
  computed,
  effect,
  input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { TableColumn } from './models/table.models';
import { TableColumnDefDirective } from './directives/table-column.directive';

@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './custom-table.html',
  styleUrl: './custom-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomTableComponent<T> implements AfterViewInit {

  public data = input.required<T[]>();
  public columns = input.required<TableColumn[]>();


  public pageSizeOptions = input<number[]>([5, 10, 25, 50]);
  public defaultPageSize = input<number>(10);

  public displayedColumns = computed(() => this.columns().map(c => c.key));

  public dataSource = new MatTableDataSource<T>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @ContentChildren(TableColumnDefDirective)
  public customColumns!: QueryList<TableColumnDefDirective>;

  constructor() {
    effect(() => {
      this.dataSource.data = this.data();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public getCustomTemplate(columnKey: string): TemplateRef<any> | null {
    if (!this.customColumns) return null;
    const directive = this.customColumns.find(dir => dir.columnName() === columnKey);
    return directive ? directive.template : null;
  }
}
