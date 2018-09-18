# Fluent Parser & Builder

Bytes stream parser and builder with fluent API.

## Example of usage

### Frame build

```
    // Arrange
    const frameBuilder = new FrameBuilder();
    const cmd = 0x04;
    const value = 1042;

    // Prepare frame
    const frame = frameBuilder
        .Byte(0x01).Byte(cmd).Word4LE(value).Xor()
        .Build();

    // And send
    serialPort.send(frame);
```

### Frame parse

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

# Important classes
- FluentBuilder - builds binary frames with fluent API
- FluentParserBuilder<T> - definition of parser with fluent API
- FluentParser<T> - result of Build() on FluentParserBuilder

# Options
Parser:
- Is(8-bit value) - check value
- Any() - omit value
- Get(8-bit value) - get single value
- Get2LE(16-bit value little-endian)
- Get2BE(16-bit value big-endian)
- Get4LE(32-bit value little-endian)
- Get4BE(32-bit value big-endian)
- IsXor() - compares xor of previous bytes in frame
- If(toCompare, operationsList) - attach new stream if param is fulfilled

Builder:
- Byte(8-bit value) - adds one byte to output frame
- Word2LE(16-bit value) - adds two bytes as little-endian
- Word4LE(16-bit value) - adds four bytes as little-endian
- Xor() - calculates XOR of all bytes in frame

# Parser events
- OnComplete(extractedParams)
- OnFault