import { Endian } from "./Types/Endian";
import { byte } from "./Types/byte";

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
                        return this.buffer[0] << 8 | this.buffer[1];
                    case Endian.Big:
                        return this.buffer[1] << 8 | this.buffer[0];
                }

            case 4:
                switch (this.endian)
                {
                    case Endian.Little:
                        return this.buffer[0] << 24 | this.buffer[1] << 16 | this.buffer[2] << 8 | this.buffer[3];
                    case Endian.Big:
                        return this.buffer[3] << 24 | this.buffer[2] << 16 | this.buffer[1] << 8 | this.buffer[0];
                }

            default: throw new Error('Unhandled buffer convert method');
        }
    }

    public Add(b: byte)
    {
        this.buffer.push(b);
        this.counter--;
    }

    public get IsFull()
    {
        return this.counter == 0;
    }
}