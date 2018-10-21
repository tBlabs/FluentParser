import { FluentParserBuilder } from "../FluentParserBuilder";
import { FluentBuilder } from "../../FluentBuilder/FluentBuilder";
import { FluentParser } from "../FluentParser";

test('Builder and Parser works together', () =>
{
    expect.assertions(3);

    // Frame building
    const frameBuilder = new FluentBuilder();
    const frame = frameBuilder
        .Byte(0xAB).Byte(0xCD).Word2LE(0x1234).Word4LE(0x12345678).Xor()
        .Build();

    // Data structure declaration
    interface FrameData
    {
        cmd: number;
        value1: number;
        value2: number;
    }

    // Parser definition
    const parserBuilder = new FluentParserBuilder<FrameData>();
    const parser: FluentParser<FrameData> = parserBuilder
        .Is(0xAB)
        .Get('cmd')
        .Get2LE('value1')
        .Get4LE('value2').IsXor()
        .Build();

    // Hook up on parse complete 
    parser.OnComplete(({ cmd, value1, value2 }) =>
    {
        expect(cmd).toBe(0xCD);
        expect(value1).toBe(0x1234);
        expect(value2).toBe(0x12345678);
    });

    // Pump data into parser
    frame.forEach((b) =>
    {
        parser.Parse(b);
    });
});
