import { FluentBuilder } from "../FluentBuilder";

describe('FluentBuilder', () =>
{
    it('should build simple frame', () =>
    {
        const builder = new FluentBuilder();
        const frame = builder
            .Byte(0x01).Byte(0x02)
            .Build();
        expect(frame).toEqual([0x01, 0x02]);
    });

    it('Word2LE', () =>
    {
        const builder = new FluentBuilder();
        const frame = builder
            .Word2LE(0x0102)
            .Build();
        expect(frame).toEqual([0x02, 0x01]);
    });

    it('Word4LE', () =>
    {
        const builder = new FluentBuilder();
        const frame = builder
            .Word4LE(0x01020304)
            .Build();
        expect(frame).toEqual([0x04, 0x03, 0x02, 0x01]);
    });

    it('Xor', () =>
    {
        const builder = new FluentBuilder();
        const frame = builder
            .Byte(0xAB).Byte(0xBA).Xor()
            .Build();
        expect(frame).toEqual([0xAB, 0xBA, 0x11]);
    });
});
