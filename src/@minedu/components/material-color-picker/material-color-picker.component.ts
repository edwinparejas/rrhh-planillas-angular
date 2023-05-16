import { Component, EventEmitter, forwardRef, Input, Output, ViewEncapsulation } from '@angular/core';

import { mineduAnimations } from '@minedu/animations/animations';
import { MatColors } from '@minedu/mat-colors/mat-color';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const MINEDU_MATERIAL_COLOR_PICKER_VALUE_ACCESSOR: any = {
    provide    : NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MineduMaterialColorPickerComponent),
    multi      : true
};

@Component({
    selector     : 'minedu-material-color-picker',
    templateUrl  : './material-color-picker.component.html',
    styleUrls    : ['./material-color-picker.component.scss'],
    animations   : mineduAnimations,
    encapsulation: ViewEncapsulation.None,
    providers    : [MINEDU_MATERIAL_COLOR_PICKER_VALUE_ACCESSOR]
})
export class MineduMaterialColorPickerComponent implements ControlValueAccessor
{
    colors: any;
    hues: string[];
    view: string;
    selectedColor: any;
    selectedPalette: string;
    selectedHue: string;

    @Output()
    colorChanged: EventEmitter<any>;

    private _color: string;
    private _modelChange: (value: any) => void;
    private _modelTouched: (value: any) => void;
   
    constructor()
    {
        this.colorChanged = new EventEmitter();
        this.colors = MatColors.all;
        this.hues = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'A100', 'A200', 'A400', 'A700'];
        this.selectedHue = '500';
        this.view = 'palettes';

        this._color = '';
        this._modelChange = () => {
        };
        this._modelTouched = () => {
        };
    }

  
    @Input()
    set color(value)
    {
        if ( !value || value === '' || this._color === value )
        {
            return;
        }
        const colorParts = value.split('-');
        this.selectedHue = colorParts[colorParts.length - 1];
        colorParts.pop();
        this.selectedPalette = colorParts.join('-');
        this._color = value;
    }

    get color(): string
    {
        return this._color;
    }

    registerOnChange(fn: any): void
    {
        this._modelChange = fn;
    }

    registerOnTouched(fn: any): void
    {
        this._modelTouched = fn;
    }
   
    writeValue(color: any): void
    {
        if ( !color )
        {
            return;
        }

        this.color = color;
        this.updateSelectedColor();
    }
    
    selectPalette(event, palette): void
    {
        event.stopPropagation();
        this.view = 'hues';
        this.selectedPalette = palette;
        this.updateSelectedColor();
    }
    
    selectHue(event, hue): void
    {
        event.stopPropagation();
        this.selectedHue = hue;
        this.updateSelectedColor();
    }

    removeColor(event): void
    {
        event.stopPropagation();
        this.view = 'palettes';
        this.selectedPalette = '';
        this.selectedHue = '';
        this.updateSelectedColor();
    }

    updateSelectedColor(): void
    {
        if ( this.selectedColor && this.selectedColor.palette === this.selectedPalette && this.selectedColor.hue === this.selectedHue )
        {
            return;
        }

        this.selectedColor = {
            palette: this.selectedPalette,
            hue    : this.selectedHue,
            class  : this.selectedPalette + '-' + this.selectedHue,
            bg     : this.selectedPalette === '' ? '' : MatColors.getColor(this.selectedPalette)[this.selectedHue],
            fg     : this.selectedPalette === '' ? '' : MatColors.getColor(this.selectedPalette).contrast[this.selectedHue]
        };

        this.colorChanged.emit(this.selectedColor);
        this._modelTouched(this.selectedColor.class);
        this._modelChange(this.selectedColor.class);
    }
    
    goToPalettesView(event): void
    {
        event.stopPropagation();
        this.view = 'palettes';
    }  
    onMenuOpen(): void
    {
        if ( this.selectedPalette === '' )
        {
            this.view = 'palettes';
        }
        else
        {
            this.view = 'hues';
        }
    }
}
