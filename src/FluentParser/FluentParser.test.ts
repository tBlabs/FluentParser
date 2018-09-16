import { FluentParserBuilder, FluentParser } from "./FluentParser";

interface Fixture
{
    testName: string;
    inputStream: number[];
    parserDefinition: FluentParserBuilder;
    expectSuccessDef: (done) => void;
    expectFaultDef: (done) => void;
}

// const fixtures: Fixture[] = 
[
    [
        'simple test',
     [0x01, 0x02],
      _ => _.Is(0x01).Is(0x02),
    ],

       [
        'should detect simple frame between noice',
        [0xFF, 0x01, 0x02, 0xFF],
        _ => _.Is(0x01).Is(0x02),
       ],
       [
        'should get data from frame',
         [0x01, 0x02, 0x03],
        _=>_.Is(0x01).Get('val').Is(0x03),
         ({val})=> {  expect(val).toBe(0x02); }
            
       ]
    // ['simple test', [0x01, 0x03], _ => _.Is(0x01).Is(0x02), (done)=>done(), ()=>{} ]
]
.forEach(f=>
{
    it(f[0], (done)=>
    {
        const parser = f[2](new FluentParserBuilder()).Build();

        parser.OnComplete((out)=>{

           if (f[3]) f[3](out);
            done();
        });

        f[1].forEach(b => parser.Parse(b));

     //   console.log(parser);
    })
})


describe('FluentParser', ()=>
{
    let parserBuilder: FluentParserBuilder;

    beforeEach(()=>
    {
        parserBuilder = new FluentParserBuilder();
    });

    it('should detect simple frame', (done)=>
    {
        const inputStream = [0x01, 0x02];

        const parser = parserBuilder
            .Is(0x01).Is(0x02)
            .Build();
        
        parser.OnComplete(()=>
        {
            done(); // no timeout === test pass
        });

        inputStream.forEach(b => parser.Parse(b));
    });

    it('should detect simple frame between noice', (done)=>
    {
        const inputStream = [0xFF, 0x01, 0x02, 0xFF];

        const parser = parserBuilder
            .Is(0x01).Is(0x02)
            .Build();
        
        parser.OnComplete(()=>
        {
            done(); // no timeout === test pass
        });

        inputStream.forEach(b => parser.Parse(b));
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

    it('should fault on invalid frame', (done)=>
    {
        const inputStream = [0x01, 0x03];

        const parser = parserBuilder
            .Is(0x01).Is(0x02)
            .Build();
        
        parser.OnFault(()=>
        {
            done(); // no timeout === test pass
        });

        inputStream.forEach(b => parser.Parse(b));
    });

    it('should parse', (done)=>
    {
        const inputStream = [0x01, 0x02, 0x03];

        const parser = parserBuilder
            .Is(0x01).Any().Is(0x03)
            .Build();
        
        parser.OnComplete(()=>
        {
            done(); // no timeout === test pass
        });

        inputStream.forEach(b => parser.Parse(b));
    });

    it('should get data from frame', (done)=>
    {
        const inputStream = [0x01, 0x02, 0x03];

        const parser = parserBuilder
            .Is(0x01).Get('val').Is(0x03)
            .Build();
        
        parser.OnComplete(({val})=>
        {
            expect(val).toBe(0x02);
            done(); // no timeout === test pass
        });

        inputStream.forEach(b => parser.Parse(b));
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
    
    it('few Ifs', (done)=>
    {
        const inputStream = [0x01, 0x03, 0xAB, 0x05];

        const parser = parserBuilder
            .Is(0x01)
            .If(0x02, _ => _.Get('val1'))
            .If(0x03, _ => _.Get('val2'))
            .If(0x04, _ => _.Get('val3'))
            .Is(0x05)
            .Build();
        
        parser.OnComplete(({val2})=>
        {
            expect(val2).toBe(0xAB);
            done(); // no timeout === test pass
        });

        inputStream.forEach(b => parser.Parse(b));
    });

    it('If should work between other Ifs', (done)=>
    {
        const inputStream = [0x01, 0x03, 0xAB, 0x06, 0x07, 0x05];

        const parser = parserBuilder
            .Is(0x01)
            .If(0x02, _ => _.Get('val1'))
            .If(0x03, _ => _.Get('val2').Is(0x06).Is(0x07))
            .If(0x04, _ => _.Get('val3'))
            .Is(0x05)
            .Build();
        
        parser.OnComplete(({val2})=>
        {
            expect(val2).toBe(0xAB);
            done(); // no timeout === test pass
        });

        inputStream.forEach(b => parser.Parse(b));
    });

    it('If should work when is last If', (done)=>
    {
        const inputStream = [0x01, 0x04, 0xAB, 0x06, 0x05];

        const parser: FluentParser = parserBuilder
            .Is(0x01)
            .If(0x02, _ => _.Get('val1'))
            .If(0x03, _ => _.Get('val2'))
            .If(0x04, _ => _.Get('val3').Is(0x06))
            .Is(0x05)
            .Build();
        
        parser.OnComplete(({val3})=>
        {
            expect(val3).toBe(0xAB);
            done(); // no timeout === test pass
        });

        inputStream.forEach(b => parser.Parse(b));
    });

    it('Get2LE', (done)=>
    {
        const inputStream = [0x01, 0x02];

        const parser: FluentParser = parserBuilder
            .Get2LE('val')
            .Build();
        
        parser.OnComplete(({val})=>
        {
            expect(val).toBe(0x0102);
            done(); // no timeout === test pass
        });

        inputStream.forEach(b => parser.Parse(b));
    });
})