# Fluent bytes frame Parser & Builder

Bytes stream parser and builder with fluent API.

## Frame build

```
    // Arrange
    const frameBuilder = new FluentBuilder();
    const cmd: byte = 0x04;
    const value: number = 1042;

    // Prepare frame
    const frame = frameBuilder
        .Byte(0x01).Byte(cmd).Word4LE(value).Xor()
        .Build();

    // And send
    serialPort.send(frame);
```

## Frame parse

```
    // Define parser output structure
    interface FrameData
    {
        cmd: number;
        value: number;
    }

    // Build parser
    const parserBuilder = new FluentParserBuilder<FrameData>();

    const parser: FluentParser = parserBuilder
        .Is(0x01).Get('cmd').Get4LE('value').IsXor()
        .Build();

    // Hook up on parse complete 
    parser.OnComplete(({cmd, value}) =>
    {
        console.log(cmd, value);
    });

    // Pump data into parser
    serialPort.on('data', (data) =>
    {
        data.forEach(b => parser.Parse(b));
    }
```

## Important classes
- FluentBuilder - builds binary frames with fluent API
- FluentParserBuilder<T> - definition of parser with fluent API
- FluentParser<T> - result of Build() on FluentParserBuilder

## API

### Frame Builder

- Byte(8-bit value) - adds one byte to output frame
- Word2LE(16-bit value) - adds two bytes as little-endian
- Word4LE(16-bit value) - adds four bytes as little-endian
- Xor() - calculates XOR of all previous bytes in frame

### Parser Builder

- Is(8-bit value) - check value
- Any() - omit value
- Get(varName: string) - stores single byte under varName
- Get2LE(varName: string) - builds 16-bit little-endian value from 2 bytes
- Get2BE(varName: string) - builds 16-bit big-endian value from 2 bytes
- Get4LE(varName: string) - builds 32-bit little-endian value from 4 bytes
- Get4BE(varName: string) - builds 32-bit big-endian value from 4 bytes
- If(toCompare: byte, varName: string, operationsList) - attach new stream if param is fulfilled
- IsXor() - calculates xor of previous bytes and compares it with current byte
- Build() - returns FluentParser object

### Parser 
- Parse(single byte) - parser input
- OnComplete(callback: (extractedParams: T) => void): void
- OnFault(callback: (reason: string, frame: byte[]) => void): void