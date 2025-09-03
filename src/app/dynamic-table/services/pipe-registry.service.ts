import {Injectable} from '@angular/core';
import {CellPipeType, PipeTransformFn} from '../types';
import {DecimalPipe} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PipeRegistryService {

  private registry = new Map<string, PipeTransformFn>();

  constructor() {
    this.register('decimal', (value, digits: string = '1.0-0') => new DecimalPipe('en').transform(value, digits));
  }

  register(name: string, fn: PipeTransformFn): void {
    this.registry.set(name, fn);
  }

  get(name: string): PipeTransformFn {
    const fn = this.registry.get(name);
    if (!fn) throw new Error(`Pipe "${name}" not found in registry`);
    return fn;
  }

  apply(pipe: CellPipeType, value: any): any {
    return this.get(pipe.name)(value, ...(pipe.args || []))
  }
}
