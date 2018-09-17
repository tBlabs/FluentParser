import { FluentParserBuilder, FluentParser } from "./FluentParser";

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
        parserDef:  _ => _.Is(0x01).Is(0x02)
    },
    {
        label: 'should detect simple frame between noice',
        inputStream: [0xFF, 0x01, 0x02, 0xFF],
        parserDef: _ => _.Is(0x01).Is(0x02),
    },
    {
        label: 'should get data from frame',
        inputStream: [0x01, 0x02, 0x03],
        parserDef: _=>_.Is(0x01).Get('val').Is(0x03),
        expectSuccessDef: ({val})=> {  expect(val).toBe(0x02); }            
    },
    {
        label: 'should fault with invalid frame', 
        inputStream: [0x01, 0x03], 
        parserDef: _=>_.Is(0x01).Is(0x02), 
        expectSuccessDef: null, 
        expectFaultDef: ()=>{}   
    },
    {
        label: 'Any', 
        inputStream: [0x01, 0x02, 0x03], 
        parserDef: _=>_.Is(0x01).Any().Is(0x03),   
    },
    {
        label: 'If', 
        inputStream: [0x01, 0x02], 
        parserDef: _=>_.If(0x01, _=>_.Is(0x02)) 
    },
    {
        label: 'If should work when is first in ifs sequence',
        inputStream: [0x01, 0x02, 0xAB, 0x05],
        parserDef: _=>_.Is(0x01)
                .If(0x02, _ => _.Get('val1'))
                .If(0x03, _ => _.Get('val2'))
                .If(0x04, _ => _.Get('val3'))
                .Is(0x05),
        expectSuccessDef: ({val1}) => expect(val1).toBe(0xAB)
    },
    {
        label: 'If should work when is in the middle of ifs sequence',
        inputStream: [0x01, 0x03, 0xAB, 0x05],
        parserDef: _=>_.Is(0x01)
                .If(0x02, _ => _.Get('val1'))
                .If(0x03, _ => _.Get('val2'))
                .If(0x04, _ => _.Get('val3'))
                .Is(0x05),
        expectSuccessDef: ({val2}) => expect(val2).toBe(0xAB)
    },
    {
        label: 'If should work when is last in ifs sequence',
        inputStream: [0x01, 0x04, 0xAB, 0x05, 0x06],
        parserDef: _=>_.Is(0x01)
                .If(0x02, _ => _.Get('val1'))
                .If(0x03, _ => _.Get('val2'))
                .If(0x04, _ => _.Get('val3').Is(0x05))
                .Is(0x06),
        expectSuccessDef: ({val3}) => expect(val3).toBe(0xAB)
    },
    {
        label: 'more complicated single If',
        inputStream: [0x00, 0x01, 0x02, 0xFF, 0x03, 0xAB, 0x00],
        parserDef: _=>_.Is(0x00)
                .If(0x01, _ => _.Is(0x02).Any().Is(0x03).Get('val'))
                .Is(0x00),
        expectSuccessDef: ({val}) => expect(val).toBe(0xAB)
    },
    {
        label: 'not fulfilled if',
        inputStream: [0x01, 0xFF, 0x02],
        parserDef: _=>_.Is(0x01)
                .If(0x11, _ => _.Is(0x12))
                .Is(0x02),
        expectSuccessDef: null,
        expectFaultDef: ()=>{}
    },
    {
        label: 'any if is fulfilled ',
        inputStream: [0x01, 0xFF, 0x02],
        parserDef: _=>_.Is(0x01)
                .If(0x11, _ => _.Is(0x12))
                .If(0x12, _ => _.Is(0x12))
                .If(0x13, _ => _.Is(0x12))
                .Is(0x02),
        expectSuccessDef: null,
        expectFaultDef: ()=>{}
    },
    {
        label: 'Get2LE',
        inputStream: [0x01, 0x02],
        parserDef: _=>_.Get2LE('val'),
        expectSuccessDef: ({val}) => expect(val).toBe(0x0102)              
    }
];

testCases.forEach(test=>
{
    it(test.label, (done)=>
    {
        const parser = test.parserDef(new FluentParserBuilder()).Build();

        if (test.expectSuccessDef !== null)
        {
            parser.OnComplete((out)=>
            {
                if (test.expectSuccessDef)
                    test.expectSuccessDef(out);

                done();
            });
        }

        if (test.expectFaultDef)
        {
            parser.OnFault(()=>
            {
                if (test.expectFaultDef)
                    test.expectFaultDef();

                done();
            });
        }

        test.inputStream.forEach(b => parser.Parse(b));
    })
})


describe('FluentParser', ()=>
{
    let parserBuilder: FluentParserBuilder;

    beforeEach(()=>
    {
        parserBuilder = new FluentParserBuilder();
    });

    it('should detect two frames', ()=>
    {
        const inputStream = [0x01, 0x02, 0x01, 0x02];

        const parser = parserBuilder
            .Is(0x01).Is(0x02)
            .Build();
        
        let framesCount = 0;
        parser.OnComplete(()=>
        {
            framesCount++;
        });

        inputStream.forEach(b => parser.Parse(b));

        expect(framesCount).toBe(2);
    });

    it('should detect two frames', ()=>
    {
        const inputStream = [0x01, 0x02, 0x01, 0x02];

        const parser = parserBuilder
            .Is(0x01).Is(0x02)
            .Build();
        
        let framesCount = 0;
        parser.OnComplete(()=>
        {
            framesCount++;
        });

        inputStream.forEach(b => parser.Parse(b));

        expect(framesCount).toBe(2);
    });

    it('simple If', (done)=>
    {
        const inputStream = [0x02, 0x03];

        const parser = parserBuilder
            .If(0x02, _ => _.Is(0x03))
            .Build();
        
        parser.OnComplete(()=>
        {
            done(); // no timeout === test pass
        });

        inputStream.forEach(b => parser.Parse(b));
    }); 

    it('more complicated single If', (done)=>
    {
        const inputStream = [0x00, 0x01, 0x02, 0xFF, 0x03, 0xAB, 0x00];

        const parser = parserBuilder
            .Is(0x00)
            .If(0x01, _ => _.Is(0x02).Any().Is(0x03).Get('val'))
            .Is(0x00)
            .Build();
        
        parser.OnComplete(({val})=>
        {
            expect(val).toBe(0xAB);
            done(); // no timeout === test pass
        });

        inputStream.forEach(b => parser.Parse(b));
    }); 

    xit('not fulfilled Ifs', (done)=>
    {
        const inputStream = [0x01, 0xFF, 0x03];

        const parser = parserBuilder
            .Is(0x01)
            .If(0x02, _ => _.Is(0x02))
            // .If(0x03, _ => _.Is(0x02))
            // .If(0x04, _ => _.Is(0x02))
            .Is(0x03)
            .Build();
        
        parser.OnFault(()=>
        {
            done(); // no timeout === test pass
        });

        inputStream.forEach(b => parser.Parse(b));
    }); 
})