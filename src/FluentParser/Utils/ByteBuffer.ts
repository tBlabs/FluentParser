import { Endian } from "../Types/Endian";
import { byte } from "../Types/byte";

export class ByteBuffer
{
    public valueSize = 0;
    private counter = 0;
    private buffer: byte[] = [];

    constructor(public size = 0, public endian = Endian.Little)
    {
        this.valueSize = size;
        this.counter = size;
    }

    public ToValue(): number
    {
        switch (this.valueSize)
        {
            case 2:
                switch (this.endian)
                {
                    case Endian.Little:
                        return this.buffer[1] << 8 | this.buffer[0];
                    case Endian.Big:
                        return this.buffer[0] << 8 | this.buffer[1];
                }

            case 4:
                switch (this.endian)
                {
                    case Endian.Little: return this.BufferTo32bitLE(this.buffer);
                    case Endian.Big: return this.BufferTo32bitBE(this.buffer);
                }

            default: throw new Error('Unhandled buffer convert method');
        }
    }

    private BufferTo32bitLE(buffer)
    {
        return (buffer[3] << 24 | buffer[2] << 16 | buffer[1] << 8 | buffer[0]) >>> 0;
    }

    private BufferTo32bitBE(buffer)
    {
        return ((buffer[0] << 24) | (buffer[1] << 16) | (buffer[2] << 8) | buffer[3]) >>> 0;
    }

    public Add(b: byte)
    {
        this.buffer.push(b);
        this.counter--;
    }

    public get IsFull()
    {
        return this.counter === 0;
    }
}