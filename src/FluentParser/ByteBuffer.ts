import { Endian } from "./Endian";
import { byte } from "./byte";
export class ByteBuffer {
    public valueSize = 0;
    public endian = Endian.Little;
    private counter = 0;
    private buffer: byte[] = [];
    constructor(public size = 0) {
        this.valueSize = size;
        this.counter = size;
    }
    public ToValue() {
        switch (this.valueSize) {
            case 2:
                switch (this.endian) {
                    case Endian.Little:
                        return this.buffer[0] << 8 | this.buffer[1];
                }
        }
    }
    public Add(b: byte) {
        this.buffer.push(b);
        this.counter--;
    }
    public get IsFull() {
        return this.counter == 0;
    }
}