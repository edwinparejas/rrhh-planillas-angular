import { Pipe, PipeTransform } from "@angular/core";
import * as moment_ from "moment";

const moment = moment_;
const DATE_FORMAT = "DD/MM/YYYY";

@Pipe({
    name: "dateFormat"
})
export class DateFormatPipe implements PipeTransform {
    transform(value: any, defaultMsg: string|null = null, format: string|null = null): any {
        if (!value) return defaultMsg !== null ? defaultMsg : "-";
        return moment(value).format(format ? format : DATE_FORMAT);
    }
}
