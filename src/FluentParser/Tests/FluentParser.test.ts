import { FluentParserBuilder } from "../FluentParserBuilder";
import { byte } from "../Types/byte";

interface FrameData
{
    addr: byte;
    val: byte;
    val1: byte;
    val2: byte;
    val3: byte;
}

interface TestCase
{
    label: string;
    inputStream: number[];
    parserDef: (builder: FluentParserBuilder<FrameData>) => FluentParserBuilder<FrameData>;
    expectSuccessDef?: ((output: any) => void) | null;
    expectFaultDef?: (reason: string) => void;
}


const testCases: TestCase[] =
    [
        {
            label: 'simple test',
            inputStream: [0x01, 0x02],
            parserDef: _ => _.Is(0x01).Is(0x02)
        },
        {
            label: 'should detect simple frame between noise',
            inputStream: [0xFF, 0x01, 0x02, 0xFF],
            parserDef: _ => _.Is(0x01).Is(0x02),
        },
        {
            label: 'should get data from frame',
            inputStream: [0x01, 0x02, 0x03],
            parserDef: _ => _.Is(0x01).Get('val').Is(0x03),
            expectSuccessDef: ({ val }) => { expect(val).toBe(0x02); }
        },
        {
            label: 'should fault with invalid frame',
            inputStream: [0x01, 0x03],
            parserDef: _ => _.Is(0x01).Is(0x02),
            expectSuccessDef: null,
            expectFaultDef: (r) => { }
        },
        {
            label: 'Any',
            inputStream: [0x01, 0x02, 0x03],
            parserDef: _ => _.Is(0x01).Any().Is(0x03),
        },
        {
            label: 'simple If',
            inputStream: [0x01, 0x02],
            parserDef: _ => _.If(0x01, 'if', _ => _.Is(0x02))
        },
        {
            label: 'If should work when is first in ifs sequence',
            inputStream: [0x01, 0x02, 0xAB, 0x05],
            parserDef: _ => _
                .Is(0x01)
                .If(0x02, 'if', _ => _.Get('val1'))
                .If(0x03, 'if', _ => _.Get('val2'))
                .If(0x04, 'if', _ => _.Get('val3'))
                .Is(0x05),
            expectSuccessDef: ({ val1 }) => expect(val1).toBe(0xAB)
        },
        {
            label: 'If should work when is in the middle of ifs sequence',
            inputStream: [0x01, 0x03, 0xAB, 0x05],
            parserDef: _ => _
                .Is(0x01)
                .If(0x02, 'if', _ => _.Get('val1'))
                .If(0x03, 'if', _ => _.Get('val2'))
                .If(0x04, 'if', _ => _.Get('val3'))
                .Is(0x05),
            expectSuccessDef: ({ val2 }) => expect(val2).toBe(0xAB)
        },
        {
            label: 'If should work when is last in ifs sequence',
            inputStream: [0x01, 0x04, 0xAB, 0x05, 0x06],
            parserDef: _ => _
                .Is(0x01)
                .If(0x02, 'if', _ => _.Get('val1'))
                .If(0x03, 'if', _ => _.Get('val2'))
                .If(0x04, 'if', _ => _.Get('val3').Is(0x05))
                .Is(0x06),
            expectSuccessDef: ({ val3 }) => expect(val3).toBe(0xAB)
        },
        {
            label: 'more complicated single If',
            inputStream: [0x00, 0x01, 0x02, 0xFF, 0x03, 0xAB, 0x00],
            parserDef: _ => _
                .Is(0x00)
                .If(0x01, 'if', _ => _.Is(0x02).Any().Is(0x03).Get('val'))
                .Is(0x00),
            expectSuccessDef: ({ val }) => expect(val).toBe(0xAB)
        },
        {
            label: 'not fulfilled if',
            inputStream: [0x01, 0xFF, 0x02],
            parserDef: _ => _
                .Is(0x01)
                .If(0x11, 'if', _ => _.Is(0x12))
                .Is(0x02),
            expectSuccessDef: null,
            expectFaultDef: (r) => { }
        },
        {
            label: 'any If is fulfilled ',
            inputStream: [0x01, 0xFF, 0x02],
            parserDef: _ => _
                .Is(0x01)
                .If(0x11, 'if', _ => _.Is(0x12))
                .If(0x12, 'if', _ => _.Is(0x12))
                .If(0x13, 'if', _ => _.Is(0x12))
                .Is(0x02),
            expectSuccessDef: null,
            expectFaultDef: (r) => { }
        },
        {
            label: 'ending with not fulfilled Ifs',
            inputStream: [0x01, 0xFF],
            parserDef: _ => _
                .Is(0x01)
                .If(0x11, 'if', _ => _.Is(0x12))
                .If(0x12, 'if', _ => _.Is(0x12))
                .If(0x13, 'if', _ => _.Is(0x12)),
            expectSuccessDef: null,
            expectFaultDef: (r) => { }
        },
        {
            label: 'Get2BE',
            inputStream: [0x01, 0x02],
            parserDef: _ => _.Get2BE('val'),
            expectSuccessDef: ({ val }) => expect(val).toBe(0x0102)
        },
        {
            label: 'Get2LE',
            inputStream: [0x01, 0x02],
            parserDef: _ => _.Get2LE('val'),
            expectSuccessDef: ({ val }) => expect(val).toBe(0x0201)
        },
        {
            label: 'Get4BE',
            inputStream: [0x01, 0x02, 0x03, 0x04],
            parserDef: _ => _.Get4BE('val'),
            expectSuccessDef: ({ val }) => expect(val).toBe(0x01020304)
        },
        {
            label: 'Get4LE',
            inputStream: [0x01, 0x02, 0x03, 0x04],
            parserDef: _ => _.Get4LE('val'),
            expectSuccessDef: ({ val }) => expect(val).toBe(0x04030201)
        },
        {
            label: 'IsXor',
            inputStream: [0x01, 0x02, 0x03, 0x00],
            parserDef: _ => _.Any().Any().Any().IsXor()
        },
        {
            label: 'IsXor',
            inputStream: [0xAB, 0xBA, 0x11],
            parserDef: _ => _.Any().Any().IsXor()
        },
        {
            label: 'more complicated frame with noise',
            inputStream: [0xFF, 0xFF, 0xFF, 0x01, 0x02, 0x03, 0x14, 0x31, 0x25, 0x26, 0x27, 0x28, 0xBA, 0xFF, 0xFF, 0xFF],
            parserDef: _ => _
                .Is(0x01).Any().Is(0x03)
                .If(0x14, 'if', _ => _.Get('addr').Get4BE('val'))
                .If(0x15, 'if', _ => _.Is(0xFF))
                .Is(0xBA),
            expectSuccessDef: ({ addr, val }) => { expect(addr).toBe(0x31); expect(val).toBe(0x25262728); }
        }
    ];

testCases.forEach(test =>
{
    it(test.label, (done) =>
    {
        const parser = test.parserDef(new FluentParserBuilder()).Build();

        if (test.expectSuccessDef !== null)
        {
            parser.OnComplete((out) =>
            {
                if (test.expectSuccessDef)
                    test.expectSuccessDef(out);

                done();
            });
        }

        if (test.expectFaultDef)
        {
            parser.OnFault((reason) =>
            {
                if (test.expectFaultDef)
                    test.expectFaultDef(reason);

                done();
            });
        }

        test.inputStream.forEach(b => parser.Parse(b));
    });
});

describe('FluentParser', () =>
{
    let parserBuilder: FluentParserBuilder<FrameData>;

    beforeEach(() =>
    {
        parserBuilder = new FluentParserBuilder();
    });

    it('should detect two frames', () =>
    {
        const inputStream = [0x01, 0x02, 0x01, 0x02];

        const parser = parserBuilder
            .Is(0x01).Is(0x02)
            .Build();

        let framesCount = 0;
        parser.OnComplete(() =>
        {
            framesCount++;
        });

        inputStream.forEach(b => parser.Parse(b));

        expect(framesCount).toBe(2);
    });

    it('should detect two frames between noise', () =>
    {
        const inputStream = [0xFF, 0x01, 0x02, 0xFF, 0x01, 0x02, 0xFF];

        const parser = parserBuilder
            .Is(0x01).Is(0x02)
            .Build();

        let framesCount = 0;
        parser.OnComplete(() =>
        {
            framesCount++;
        });

        inputStream.forEach(b => parser.Parse(b));

        expect(framesCount).toBe(2);
    });

    it('should detect frames with Ifs', () =>
    {
        const inputStream = [0x01, 0x11, 0x02, 0x01, 0x12, 0x02, 0x01, 0x12, 0x02];

        const parser = parserBuilder
            .Is(0x01)
            .If(0x11, 'if', _ => _)
            .If(0x12, 'if', _ => _)
            .Is(0x02)
            .Build();

        let framesCount = 0;
        parser.OnComplete(() =>
        {
            framesCount++;
        });

        inputStream.forEach(b => parser.Parse(b));

        expect(framesCount).toBe(3);
    });

    it('simple if', () =>
    {
        const inputStream = [0x01, 0x02];

        const parser = parserBuilder
            .If(0x01, 'if', _ => _.Is(0x02))
            .Build();

        let framesCount = 0;
        parser.OnComplete(() =>
        {
            framesCount++;
        });

        inputStream.forEach(b => parser.Parse(b));

        expect(framesCount).toBe(1);
    });

    it('real life test', () =>
    {
        const inputStream = [0xbb, 0xaa, 0x02, 0x01, 0xde, 0xcd, 0xbc, 0xab, 0x16, 0xbb, 0xaa, 0x02, 0x01, 0xde, 0xcd, 0xbc, 0xab, 0x16];

        interface RealLifeFrameData
        {
            type: number;
            addr: number;
            value: number;
        }

        const parser = (new FluentParserBuilder<RealLifeFrameData>())
            .Is(0xBB).Is(0xAA)
            .If(0x01, 'type', _ => _)
            .If(0x02, 'type', _ => _.Get('addr').Get4LE('value'))
            .IsXor()
            .Build();

        let framesCount = 0;
        parser.OnComplete(({ type, addr, value }) =>
        {
            expect(type).toBe(0x02);
            expect(addr).toBe(0x01);
            expect(value).toBe(0xABBCCDDE);
            framesCount++;
        });

        inputStream.forEach(b => parser.Parse(b));

        expect(framesCount).toBe(2);
    });
});
