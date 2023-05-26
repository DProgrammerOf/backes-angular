import { Pipe, PipeTransform } from '@angular/core';
import { isString, isUndefined } from './utils/utils';

@Pipe({
  name: 'tokm'
})
export class ToKm implements PipeTransform {
  transform(value: string): string {
    return value.replaceAll(' ', '.'); 
  }

}
