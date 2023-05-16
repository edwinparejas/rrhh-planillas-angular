import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';

import { MINEDU_CONFIG } from '@minedu/services/config.service';

@NgModule()
export class MineduModule
{
    constructor(@Optional() @SkipSelf() parentModule: MineduModule)
    {
        if ( parentModule )
        {
            throw new Error('MineduModule is already loaded. Import it in the AppModule only!');
        }
    }

    static forRoot(config): ModuleWithProviders<MineduModule>
    {
        return {
            ngModule : MineduModule,
            providers: [
                {
                    provide : MINEDU_CONFIG,
                    useValue: config
                }
            ]
        };
    }
}
