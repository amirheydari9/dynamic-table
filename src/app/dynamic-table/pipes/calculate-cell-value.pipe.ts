import {inject, Pipe, PipeTransform} from '@angular/core';
import {TableColumnConfigType} from '../types';
import {PipeRegistryService} from '../services/pipe-registry.service';

@Pipe({
  name: 'calculateCellValue',
})
export class CalculateCellValuePipe implements PipeTransform {

  pipeRegistry = inject(PipeRegistryService)

  transform(rowData: any, column: TableColumnConfigType): any {
    let value = column.cellValue
      ? (typeof column.cellValue === 'function' ? column.cellValue(rowData) : column.cellValue)
      : rowData[column.field];

    if (column?.pipes?.length) {
      value = column.pipes.reduce((currentValue, pipe) => {
        return this.pipeRegistry.apply(pipe, currentValue);
      }, value);
    }

    return value;
  }
}
