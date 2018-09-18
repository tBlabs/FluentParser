# FluentParser

Bytes stream parser with fluent API.

## Example of usage

```
    // Build parser
    const parser = parserBuilder
        .Is(0x01).Get('cmd').IsXor()
        .Build();

    // Hook up on parse complete 
    parser.OnComplete(({cmd}) =>
    {
        console.log(cmd);
    });

    // Pump data into parser
    serialPort.on('data', (data) =>
    {
        data.forEach(b => parser.Parse(b));
    }
```

# Important classes
- FluentParserBuilder - definition of parser with fluent API
- FluentParser - result of Build() at FluentParserBuilder

# Options
- Is(8-bit value) - check value
- Any() - omit value
- Get(8-bit value) - get single value
- Get2LE(16-bit value little-endian)
- Get2BE(16-bit value big-endian)
- Get4LE(32-bit value little-endian)
- Get4BE(32-bit value big-endian)
- IsXor() - compares xor of previous bytes in frame
- If(toCompare, operationsList) - attach new stream if param is fulfilled

# Parser events
- OnComplete(extractedParams)
- OnFault