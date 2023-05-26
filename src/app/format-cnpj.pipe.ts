import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tocnpj'
})
export class ToCnpj implements PipeTransform {
  transform(value: String | undefined): any {
    if (value) {
        value = value.replace(/\D/g, '');
        if (value.length != 14) {
            return value;
        }

        value = value.substring(0, 14);
        value = value.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/,
        '$1.$2.$3/$4-$5'
        );
    } else {
        return 'CNPJ não informado'
    }
    return value;
  }
}