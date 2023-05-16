import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noRegistrado'
})
export class NoRegistradoPipe implements PipeTransform {

  transform(value: any): unknown {
	return (value||null)==null?'NO REGISTRADO':value;
  }

}
