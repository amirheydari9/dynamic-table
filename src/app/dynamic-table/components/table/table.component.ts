import {
  AfterContentInit,
  AfterViewInit,
  Component,
  contentChildren,
  effect,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import {CommonModule, NgTemplateOutlet} from '@angular/common';
import {MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {CalculateCellValuePipe} from '../../pipes/calculate-cell-value.pipe';
import {TemplateNameDirective} from '../../diretives/template-name.directive';
import {CellClassType, CellStyleType, TableColumnConfigType} from '../../types';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    NgTemplateOutlet,
    CalculateCellValuePipe
  ],
  template: `
    <div class="mat-elevation-z8">
      <table mat-table (matSortChange)="onPageChange()" [dataSource]="dataSource" matSort
             class="full-width-table">

        <!-- Checkbox Column -->
        @if (selection()) {
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox
                (change)="masterToggle()"
                [checked]="isAllSelected()"
                [indeterminate]="isSomeSelected()"
              ></mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row">
              <mat-checkbox
                (click)="$event.stopPropagation()"
                (change)="toggleSelection(row)"
                [checked]="isSelected(row)"
              ></mat-checkbox>
            </td>
          </ng-container>
        }

        <!-- Dynamic Columns -->
        @for (col of columns(); track col.field) {
          <ng-container [matColumnDef]="col.field">
            <th mat-header-cell *matHeaderCellDef>
              @if (col.sortable) {
                <span mat-sort-header>{{ col.header }}</span>
              } @else {
                <span>{{ col.header }}</span>
              }
            </th>
            <td mat-cell *matCellDef="let row"
                [class]="getClass(col.cellClass, row)"
                [style]="getStyle(col.cellStyle, row)">
              @if (col.body) {
                <ng-container *ngTemplateOutlet="col.body; context: { $implicit: row }"/>
              } @else {
                {{ row | calculateCellValue: col }}
              }
            </td>
          </ng-container>
        }

        <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
        <tr mat-row
            *matRowDef="let row; columns: displayedColumns();"
            [class]="getClass(rowClass(), row)"
            [style]="getStyle(rowStyle(), row)"
        ></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" [attr.colspan]="selection ? columns().length + 1 : columns().length"
              style="text-align: center">رکوردی یافت نشد
          </td>
        </tr>

      </table>

      <mat-paginator
        [showFirstLastButtons]="true"
        [disabled]="!(dataSource.data.length)"
        [length]="totalRecords()"
        [pageSize]="rows()"
        [pageSizeOptions]="[10,20,50,100]"
        (page)="onPageChange()"
      ></mat-paginator>

    </div>
  `,
  styles: [`
    .full-width-table {
      width: 100%;
    }
  `]
})
export class CustomTableComponent implements AfterContentInit, AfterViewInit {

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns = signal<string[]>([]);
  selectedItems = signal<any[]>([]);

  constructor() {
    effect(() => {
      this.dataSource.data = this.data() || [];
    });
    effect(() => {
      this.selectionChange.emit(this.selectedItems());
    });
  }

  data = input<any[]>([]);
  columns = input.required<TableColumnConfigType[]>();
  rowClass = input<CellClassType | undefined>();
  rowStyle = input<CellStyleType | undefined>();
  dataKey = input<string>('id');
  rows = input<number>(10);
  selection = input<boolean>(false);
  totalRecords = input<number>(0);

  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);
  table = viewChild(MatTable<any>);
  templates = contentChildren(TemplateNameDirective);

  pageChange = output<any>();
  selectionChange = output<any[]>();

  ngAfterContentInit() {
    this.displayedColumns.set(
      this.selection()
        ? ['select', ...this.columns().map(c => c.field)]
        : this.columns().map(c => c.field)
    );
    if (this.templates().length) {
      this.templates().forEach(tpl => {
        const col = this.columns().find(c => c.field === tpl.name);
        if (col) col.body = tpl.template;
      });
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort();
    this.onPageChange()
  }

  onPageChange() {
    this.selectedItems.set([]);
    this.pageChange.emit({
      page: this.paginator().pageIndex,
      size: this.paginator().pageSize,
      sortField: (!!this.sort().direction) ? this.sort().active : undefined,
      sortOrder: (!!this.sort().direction) ? this.sort().direction : undefined
    });
  }

  getClass(tagClass: any, row: any): string | null {
    return typeof tagClass === 'function' ? tagClass(row) : tagClass || null;
  }

  getStyle(tagStyle: any, row: any): any {
    return typeof tagStyle === 'function' ? tagStyle(row) : tagStyle || null;
  }

  isSelected(row: any): boolean {
    return this.selectedItems().some(item => item[this.dataKey()] === row[this.dataKey()]);
  }

  toggleSelection(row: any): void {
    this.isSelected(row)
      ? this.selectedItems.set(this.selectedItems().filter(i => i[this.dataKey()] !== row[this.dataKey()]))
      : this.selectedItems.set([...this.selectedItems(), row]);
  }

  isAllSelected(): boolean {
    if (this.dataSource.data.length > 0) {
      return this.selectedItems().length === this.dataSource.data.length;
    }
    return false
  }

  isSomeSelected(): boolean {
    return this.selectedItems().length > 0 && !this.isAllSelected();
  }

  masterToggle(): void {
    this.isAllSelected() ? this.selectedItems.set([]) : this.selectedItems.set(this.dataSource.data);
  }

  //TODO
  reload(): void {
    this.dataSource.data = [];
    this.paginator().firstPage()
    this.selectedItems.set([]);
  }

  onSelect($event: Event) {
    console.log($event)
  }
}
