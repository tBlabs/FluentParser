import { IRunMode } from './services/runMode/IRunMode';
import { ILogger } from './services/logger/ILogger';
import { injectable, inject } from 'inversify';
import { Types } from './IoC/Types';
import { IStartupArgs } from './services/environment/IStartupArgs';

@injectable()
export class Main
{
    constructor(
        @inject(Types.IStartupArgs) private _args: IStartupArgs,
        @inject(Types.ILogger) private _log: ILogger,
        @inject(Types.IRunMode) private _runMode: IRunMode)
    { }

    public async Run(): Promise<void>
    {
        this._log.Info('Main.Run', 'Starting in "' + this._runMode.Current + '" mode with args:', this._args.Args); // Don't Try it with "npm run run --foo bar" or "npm run run -- --foo bar", it won't work! Call script directly: "tsc || /bin/startup.js --foo bar"
      

        alfaBoardFrameBuilder
        .Add(HEADER)
        .Add('cmd')
        .Add4LE('value')


        // AlfaBoard 
        alfaBoardParserBuilder.Is(0xAB)
        .If(PONG_CMD)
        .If(SET_OK_CMD, _=>_.Get('addr').Get4LE('value'))
        .If(GET_OK_CMD, _=>_.Get('addr').Get4LE('value'))
        .IsXor();

        airSensorParserBuilder
        .Is(0xAA).Is(0xC0)
        .Get('pm25L').Get('pm25H')
        .Get('pm10L').Get('pm10H')
        .Drop(3)
        .Is(0xAB)
        .Complete(({ pm25L, pm25H, pm10L, pm10H }) =>
        {
            const pm25: number = ((pm25H << 8) + pm25L) / 10;
            const pm10: number = ((pm10H << 8) + pm10L) / 10;
            onCompleteCallback({ pm25, pm10 });
        });
        /* Put your code here */
        /* And then run `npm run serve` */
        /* Don't forget to set your enviroment variables (`.env` file) */
    }
}
