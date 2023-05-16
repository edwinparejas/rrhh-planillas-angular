import { Pipe, PipeTransform } from '@angular/core';
import { MineduUtils } from '@minedu/utils/minedu-utils';

@Pipe({name: 'filter'})
export class FilterPipe implements PipeTransform
{
    
    transform(mainArr: any[], searchText: string, property: string): any
    {
        return MineduUtils.filterArrayByString(mainArr, searchText);
    }
}
