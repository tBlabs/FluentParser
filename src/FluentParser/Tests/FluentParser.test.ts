import { FluentParserBuilder } from "../FluentParserBuilder";

interface TestCase
{
    label: string;
    inputStream: number[];
    parserDef: (FluentParserBuilder) => FluentParserBuilder;
    expectSuccessDef?: ((output: any) => void) | null;
    expectFaultDef?: () => void;
}

const testCases: TestCase[] =
    [
        {
            label: 'simple test',
            inputStream: [0x01, 0x02],
            parserDef: _ => _.Is(0x01).Is(0x02)
        },
        {
            label: 'should detect simple frame between noice',
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
            expectFaultDef: () => { }
        },
        {
            label: 'Any',
            inputStream: [0x01, 0x02, 0x03],
            parserDef: _ => _.Is(0x01).Any().Is(0x03),
        },
        {
            label: 'simple If',
            inputStream: [0x01, 0x02],
            parserDef: _ => _.If(0x01, _ => _.Is(0x02))
        },
        {
            label: 'If should work when is first in ifs sequence',
            inputStream: [0x01, 0x02, 0xAB, 0x05],
            parserDef: _ => _
                .Is(0x01)
                .If(0x02, _ => _.Get('val1'))
                .If(0x03, _ => _.Get('val2'))
                .If(0x04, _ => _.Get('val3'))
                .Is(0x05),
            expectSuccessDef: ({ val1 }) => expect(val1).toBe(0xAB)
        },
        {
            label: 'If should work when is in the middle of ifs sequence',
            inputStream: [0x01, 0x03, 0xAB, 0x05],
            parserDef: _ => _
                .Is(0x01)
                .If(0x02, _ => _.Get('val1'))
                .If(0x03, _ => _.Get('val2'))
                .If(0x04, _ => _.Get('val3'))
                .Is(0x05),
            expectSuccessDef: ({ val2 }) => expect(val2).toBe(0xAB)
        },
        {
            label: 'If should work when is last in ifs sequence',
            inputStream: [0x01, 0x04, 0xAB, 0x05, 0x06],
            parserDef: _ => _
                .Is(0x01)
                .If(0x02, _ => _.Get('val1'))
                .If(0x03, _ => _.Get('val2'))
                .If(0x04, _ => _.Get('val3').Is(0x05))
                .Is(0x06),
            expectSuccessDef: ({ val3 }) => expect(val3).toBe(0xAB)
        },
        {
            label: 'more complicated single If',
            inputStream: [0x00, 0x01, 0x02, 0xFF, 0x03, 0xAB, 0x00],
            parserDef: _ => _
                .Is(0x00)
                .If(0x01, _ => _.Is(0x02).Any().Is(0x03).Get('val'))
                .Is(0x00),
            expectSuccessDef: ({ val }) => expect(val).toBe(0xAB)
        },
        {
            label: 'not fulfilled if',
            inputStream: [0x01, 0xFF, 0x02],
            parserDef: _ => _
                .Is(0x01)
                .If(0x11, _ => _.Is(0x12))
                .Is(0x02),
            expectSuccessDef: null,
            expectFaultDef: () => { }
        },
        {
            label: 'any if is fulfilled ',
            inputStream: [0x01, 0xFF, 0x02],
            parserDef: _ => _
                .Is(0x01)
                .If(0x11, _ => _.Is(0x12))
                .If(0x12, _ => _.Is(0x12))
                .If(0x13, _ => _.Is(0x12))
                .Is(0x02),
            expectSuccessDef: null,
            expectFaultDef: () => { }
        },
        {
            label: 'ending with ifs',
            inputStream: [0x01, 0xFF],
            parserDef: _ => _
                .Is(0x01)
                .If(0x11, _ => _.Is(0x12))
                .If(0x12, _ => _.Is(0x12))
                .If(0x13, _ => _.Is(0x12)),
            expectSuccessDef: null,
            expectFaultDef: () => { }
        },
        {
            label: 'Get2LE',
            inputStream: [0x01, 0x02],
            parserDef: _ => _.Get2LE('val'),
            expectSuccessDef: ({ val }) => expect(val).toBe(0x0102)
        },
        {
            label: 'Get2BE',
            inputStream: [0x01, 0x02],
            parserDef: _ => _.Get2BE('val'),
            expectSuccessDef: ({ val }) => expect(val).toBe(0x0201)
        },
        {
            label: 'Get4LE',
            inputStream: [0x01, 0x02, 0x03, 0x04],
            parserDef: _ => _.Get4LE('val'),
            expectSuccessDef: ({ val }) => expect(val).toBe(0x01020304)
        },
        {
            label: 'Get4BE',
            inputStream: [0x01, 0x02, 0x03, 0x04],
            parserDef: _ => _.Get4BE('val'),
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
            label: 'more complicated frame with noice',
            inputStream: [0xFF, 0xFF, 0xFF, 0x01, 0x02, 0x03, 0x14, 0x31, 0x25, 0x26, 0x27, 0x28, 0xBA, 0xFF, 0xFF, 0xFF],
            parserDef: _ => _
                .Is(0x01).Any().Is(0x03)
                .If(0x14, _=>_.Get('addr').Get4LE('val'))
                .If(0x15, _=>_.Is(0xFF))
                .Is(0xBA),
            expectSuccessDef: ({addr, val}) => { expect(addr).toBe(0x31); expect(val).toBe(0x25262728); }
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
            parser.OnFault(() =>
            {
                if (test.expectFaultDef)
                    test.expectFaultDef();

                done();
            });
        }

        test.inputStream.forEach(b => parser.Parse(b));
    })
})


describe('FluentParser', () =>
{
    let parserBuilder: FluentParserBuilder;

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

    it('should detect two frames between noice', () =>
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
});
