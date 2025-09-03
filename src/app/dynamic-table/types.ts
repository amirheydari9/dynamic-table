import {TemplateRef} from '@angular/core';

export type TableColumnConfigType = {
  header: string;
  field: string;
  sortable?: boolean,
  cellValue?: CellValueType;
  cellClass?: CellClassType;
  cellStyle?: CellStyleType;
  body?: TemplateRef<any>;
  pipes?: CellPipeType[];
}
export type CellStyleType = { [key: string]: any } | ((rowData: any) => { [key: string]: any });
export type CellClassType = string | ((rowData: any) => string);
export type CellValueType = any | ((rowData: any) => any);
export type CellPipeType = { name?: string; args?: any[] };

export type PageChangedType = { page: number, size: number, sortField: string | string[], sortOrder: number }

export type PipeTransformFn = (value: any, ...args: any[]) => any;
