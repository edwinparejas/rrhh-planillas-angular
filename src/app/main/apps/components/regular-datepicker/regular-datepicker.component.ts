import { Component, Input, forwardRef, ViewChild } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDatepicker } from '@angular/material/datepicker';

import * as _moment from 'moment';
import { Moment } from 'moment';


const moment = _moment;

export const YEAR_MODE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@Component({
  selector: 'minedu-regular-datepicker',
  templateUrl: './regular-datepicker.component.html',
  styleUrls: ['./regular-datepicker.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: YEAR_MODE_FORMATS },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RegularDatepickerComponent),
      multi: true,
    },
  ],
})
export class RegularDatepickerComponent implements ControlValueAccessor {
  cleaning = false;

  /** Component label */
  @Input() label = '';
  @Input() requiredLabel: boolean = false;

  @Input() mineduFormControl: FormControl;

  _max: Moment;
  @Input() get max(): Date {
    return this._max ? this._max.toDate() : undefined;
  }
  set max(max: Date) {
    if (max) {
      const momentDate = moment(max);
      this._max = momentDate.isValid() ? momentDate : undefined;
    }
  }

  _min: Moment;
  @Input() get min(): Date {
    return this._min ? this._min.toDate() : undefined;
  }
  set min(min: Date) {
    if (min) {
      const momentDate = moment(min);
      this._min = momentDate.isValid() ? momentDate : undefined;
    }
  }

  private _mode: 'WEEK' | 'SEMESTER' | '' | null = '';
  @Input() get mode(): 'WEEK' | 'SEMESTER' | '' | null {
    return this._mode;
  }
  set mode(mode: 'WEEK' | 'SEMESTER' | '' | null) {
    this._mode = mode;
    this._setupFilter();
  }

  @Input() touchUi = false;

  _customFilter: (d: Moment) => boolean;

  @ViewChild(MatDatepicker) _picker: MatDatepicker<Moment>;

  _inputCtrl: FormControl = new FormControl();

  // Function to call when the date changes.
  onChange = (date: any) => { };

  clear() {
    this._inputCtrl.setValue(null, { emitEvent: false });
    this.cleaning = false;
  }

  // Function to call when the input is touched (when a star is clicked).
  onTouched = () => { };

  writeValue(date: any): void {
    if (date) {
      const momentDate = moment(date);
      if (momentDate.isValid()) {
        this._inputCtrl.setValue(moment(date), { emitEvent: false });
        this.cleaning = true;
      } else {
        this._inputCtrl.setValue(null, { emitEvent: false });
        this.cleaning = false;
      }
    } else {
      this._inputCtrl.setValue(null, { emitEvent: false });
      this.cleaning = false;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Allows Angular to disable the input.
  setDisabledState(isDisabled: boolean): void {
    if (this._picker) {
      isDisabled ? this._picker.disabled = true : this._picker.disabled = false;
    }
    isDisabled ? this._inputCtrl.disable() : this._inputCtrl.enable();
  }

  _dateChangeHandler(chosenDate: Moment) {
    this.onChange(chosenDate.toDate());
    this.onTouched();
    this.cleaning = true;
  }

  _openDatepickerOnClick(datepicker: MatDatepicker<Moment>) {
    if (!datepicker.opened) {
      datepicker.open();
      this.onTouched();
    }
  }

  _openDatepickerOnFocus(datepicker: MatDatepicker<Moment>) {
    setTimeout(() => {
      if (!datepicker.opened) {
        datepicker.open();
        this.onTouched();
      }
    });
  }

  private _setupFilter() {
    switch (this.mode) {
      case 'WEEK':
        this._customFilter = (d: Moment) => {
          return !d.day();
        };
        break;
    }
  }

}
