import { ByteBuffer } from "../ByteBuffer";
import { Endian } from "../Types/Endian";

describe('ByteBuffer', () =>
{
    it('little endian', () =>
    {
        const buffer = new ByteBuffer(2);
        buffer.endian = Endian.Little;
        buffer.Add(0x01);
        buffer.Add(0x02);
        const value = buffer.ToValue();
        expect(value).toBe(0x0102);
    });

    it('big endian', () =>
    {
        const buffer = new ByteBuffer(2);
        buffer.endian = Endian.Big;
        buffer.Add(0x01);
        buffer.Add(0x02);
        const value = buffer.ToValue();
        expect(value).toBe(0x0201);
    })
})