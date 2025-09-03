import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild
} from '@angular/core';
import {CommonModule, NgTemplateOutlet} from '@angular/common';
import {MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {CalculateCellValuePipe} from '../../pipes/calculate-cell-value.pipe';
import {TemplateNameDirective} from '../../diretives/template-name.directive';
import {CellClassType, TableColumnConfigType} from '../../types';

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
      <table mat-table [dataSource]="dataSource" matSort class="full-width-table">

        <!-- Checkbox Column -->
        @if (selection) {
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
                [disabled]="isCheckboxDisabled(row)"
              ></mat-checkbox>
            </td>
          </ng-container>
        }

        <!-- Dynamic Columns -->
        @for (col of columns; track col.field) {
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

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row
            *matRowDef="let row; columns: displayedColumns;"
            [class]="getClass(rowClass, row)"
            [style]="getStyle(rowStyle, row)"
        ></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" [attr.colspan]="selection ? columns.length + 1 : columns.length"
              style="text-align: center">رکوردی یافت نشد
          </td>
        </tr>

      </table>

      <mat-paginator
        [length]="totalRecords"
        [pageSize]="rows"
        [pageSizeOptions]="[10,20,50,100]"
        (page)="onPageChange($event)"
      ></mat-paginator>

    </div>
  `,
  styles: [`
    .full-width-table {
      width: 100%;
    }
  `]
})
export class CustomTableComponent implements AfterContentInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;
  @ContentChildren(TemplateNameDirective) templates!: QueryList<TemplateNameDirective>;

  private _data: any[] = [];
  @Input()
  set data(value: any[]) {
    this._data = value || [];
    if (this.dataSource) {
      this.dataSource.data = this._data;
    }
  }

  get data(): any[] {
    return this._data;
  }

  @Input() columns: TableColumnConfigType[] = [];
  @Input() rowClass?: CellClassType
  @Input() rowStyle?: (row: any) => any;
  @Input() dataKey: string = 'id';
  @Input() rows: number = 10;
  @Input() selection: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() rowCheckboxDisabled: (row: any) => boolean = () => false;

  @Output() pageChange = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];
  private _selectedItems: any[] = [];

  get selectedItems(): any[] {
    return this._selectedItems;
  }

  set selectedItems(value: any[]) {
    const active = value.filter(item => !this.isCheckboxDisabled(item));
    this._selectedItems = active;
    this.selectionChange.emit(active);
  }

  ngAfterContentInit() {
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.displayedColumns = this.selection
      ? ['select', ...this.columns.map(c => c.field)]
      : this.columns.map(c => c.field);

    if (this.templates.length) {
      this.templates.forEach(tpl => {
        const col = this.columns.find(c => c.field === tpl.name);
        if (col) col.body = tpl.template;
      });
    }
  }

  onPageChange(event: PageEvent) {
    this.pageChange.emit({
      page: event.pageIndex,
      size: event.pageSize,
      sortField: this.sort.active,
      sortOrder: this.sort.direction === 'asc' ? 1 : -1
    });
  }

  getClass(tagClass: any, row: any): string | null {
    return typeof tagClass === 'function' ? tagClass(row) : tagClass || null;
  }

  getStyle(tagStyle: any, row: any): any {
    return typeof tagStyle === 'function' ? tagStyle(row) : tagStyle || null;
  }

  isCheckboxDisabled(row: any): boolean {
    return this.rowCheckboxDisabled(row);
  }

  isSelected(row: any): boolean {
    return this.selectedItems.some(item => item[this.dataKey] === row[this.dataKey]);
  }

  toggleSelection(row: any): void {
    if (this.isCheckboxDisabled(row)) return;
    this.isSelected(row) ? this.selectedItems = this.selectedItems.filter(i => i[this.dataKey] !== row[this.dataKey]) : this.selectedItems = [...this.selectedItems, row];
  }

  isAllSelected(): boolean {
    const selectable = this.data.filter(d => !this.isCheckboxDisabled(d));
    return this.selectedItems.length === selectable.length;
  }

  isSomeSelected(): boolean {
    return this.selectedItems.length > 0 && !this.isAllSelected();
  }

  masterToggle(): void {
    this.isAllSelected() ? this.selectedItems = [] : this.selectedItems = this.data.filter(d => !this.isCheckboxDisabled(d));
  }

  reload(): void {
    this.dataSource.data = this.data;
    this.paginator.firstPage();
    this.selectedItems = [];
  }
}
