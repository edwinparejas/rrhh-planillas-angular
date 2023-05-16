import { Component, AfterViewInit, OnDestroy, forwardRef, Input, ViewEncapsulation } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _moment from 'moment';

const moment = _moment;

@Component({
  selector: 'minedu-datepicker',
  templateUrl: './minedu-datepicker.component.html',
  styleUrls: ['./minedu-datepicker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MineduDatepickerComponent),
      multi: true,
    }
  ],
})
export class MineduDatepickerComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @Input() mode: 'YEAR' | 'MONTH' | 'MONTHYEAR' | 'WEEK' | 'SEMESTER' | '' | null;

  @Input() label = '';

  @Input() max: any;

  @Input() min: any;

  @Input() touchUi = false;

  @Input() mineduFormControl: FormControl;

  @Input() requiredLabel: boolean = false;


  _yearPickerCtrl: FormControl = new FormControl();
  _monthPickerCtrl: FormControl = new FormControl();
  _regularPickerCtrl: FormControl = new FormControl();

  private _onDestroy: Subject<void> = new Subject<void>();

  ngAfterViewInit() {

    switch (this.mode) {
      case 'YEAR':
        this._subscribeToChanges(this._yearPickerCtrl);
        break;

      case 'MONTH':
      case 'SEMESTER':
      case 'MONTHYEAR':
        this._subscribeToChanges(this._monthPickerCtrl);
        break;

      default:
        this._subscribeToChanges(this._regularPickerCtrl);

    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
  }

  // Function to call when the date changes.
  onChange = (date: any) => { };

  // Function to call when the input is touched (when a star is clicked).
  onTouched = () => { };

  writeValue(date: any): void {
    if (date) {
      this._writeValue(date);
    } else {
      this._writeNullValue();
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
    switch (this.mode) {
      case 'YEAR':
        isDisabled ? this._yearPickerCtrl.disable() : this._yearPickerCtrl.enable();
        break;

      case 'MONTH':
      case 'SEMESTER':
      case 'MONTHYEAR':
        isDisabled ? this._monthPickerCtrl.disable() : this._monthPickerCtrl.enable();
        break;

      default:
        isDisabled ? this._regularPickerCtrl.disable() : this._regularPickerCtrl.enable();

    }
  }

  private _writeValue(date: any): any {
    if (!date) {
      return;
    }
    let momentDate = moment(date)
    switch (this.mode) {
      case 'YEAR':
        if (momentDate.isValid()) {
          this._yearPickerCtrl.setValue(date, { emitEvent: false });
        } else {
          this._yearPickerCtrl.setValue(null, { emitEvent: false });
        }
        break;

      case 'MONTHYEAR':
      case 'MONTH':
      case 'SEMESTER':
        if (momentDate.isValid()) {
          this._monthPickerCtrl.setValue(date, { emitEvent: false });
        } else {
          this._monthPickerCtrl.setValue(null, { emitEvent: false });
        }
        break;

      default:
        if (momentDate.isValid()) {
          this._regularPickerCtrl.setValue(date);
        } else {
          this._regularPickerCtrl.setValue(null);
        }
    }
  }

  private _writeNullValue() {
    switch (this.mode) {
      case 'YEAR':
        this._yearPickerCtrl.setValue(null, { emitEvent: false });
        break;

      case 'MONTHYEAR':
      case 'MONTH':
      case 'SEMESTER':
        this._monthPickerCtrl.setValue(null, { emitEvent: false });
        break;

      default:
        this._regularPickerCtrl.setValue(null, { emitEvent: false });
    }
  }


  private _parseMonthAndYear(date: string) {
    const dashIndex = date.indexOf('-');
    const forwardSlashIndex = date.indexOf('/');
    if (dashIndex === -1 && forwardSlashIndex === -1) {
      return;
    }

    if (forwardSlashIndex > -1) {
      return this._getValidStringMonth(date.split('/'));
    }

    if (dashIndex > -1) {
      return this._getValidStringMonth(date.split('-'));
    }
  }

  private _parseYear(date: string) {
    const month = Number(date);
    if (isNaN(month)) { return; }

    return month;
  }

  private _getValidStringMonth(splittedDate: string[]) {
    if (splittedDate.length !== 2) { return; }

    const month = Number(splittedDate[0]);

    if (isNaN(month) || month > 11 || month < 0) { return; }

    const year = Number(splittedDate[1]);

    if (isNaN(year) || year < 0) { return; }

    // Notice we are converting month to human convention, 1..12.
    // This is done because of the way month-picker is building up
    // the moment object using MM/YYYY format instead of and array.
    return (month + 1) + '/' + year;
  }

  private _subscribeToChanges(control: FormControl) {
    if (!control) { return; }

    control.valueChanges
      .pipe(
        takeUntil(this._onDestroy)
      ).subscribe((value) => {
        const date = new Date(value);
        this.onChange(date);
        this.onTouched();
      });

  }

  get _showMonthPicker(): boolean {
    return this.mode === 'MONTH' || this.mode === 'MONTHYEAR' ||
      this.mode === 'SEMESTER'
  }

  get _showRegularDatepicker(): boolean {
    return !this.mode || this.mode === 'WEEK';
  }
}
