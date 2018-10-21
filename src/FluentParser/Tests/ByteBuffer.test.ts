import { ByteBuffer } from "../Utils/ByteBuffer";
import { Endian } from "../Types/Endian";

describe('ByteBuffer', () =>
{
    it('16-bit little endian', () =>
    {
        const buffer = new ByteBuffer(2);
        buffer.endian = Endian.Little;
        buffer.Add(0x01);
        buffer.Add(0x02);
        const value = buffer.ToValue();
        expect(value).toBe(0x0201);
    });

    it('16-bit big endian', () =>
    {
        const buffer = new ByteBuffer(2);
        buffer.endian = Endian.Big;
        buffer.Add(0x01);
        buffer.Add(0x02);
        const value = buffer.ToValue();
        expect(value).toBe(0x0102);
    });

    it('32-bit little endian', () =>
    {
        const buffer = new ByteBuffer(4);
        buffer.endian = Endian.Little;
        buffer.Add(0xA4);
        buffer.Add(0xA3);
        buffer.Add(0xA2);
        buffer.Add(0xA1);
        const value = buffer.ToValue();
        expect(value).toBe(0xA1A2A3A4);
    });
});
