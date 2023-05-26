import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'todate'
})
export class ToDate implements PipeTransform {
  transform(value: String | undefined, format: String): string {
    if (value == undefined)
        return '';
    return moment(value.toString()).format(format.toString());
  }

}
