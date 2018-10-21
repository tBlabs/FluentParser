import { byte } from "./Types/byte";
import { ByteBuffer } from "./Utils/ByteBuffer";
import { OperationsList } from "./Utils/OperationsList";
import { OperationType } from "./Types/OperationType";
import { IsOperation } from "./Operations/IsOperation";
import { GetOperation } from "./Operations/GetOperation";
import { IfOperation } from "./Operations/IfOperation";
import { StartBufferingOperation } from "./Operations/StartBufferingOperation";

export class FluentParser<T>
{
    constructor(private _operations: OperationsList)
    {
        this.operationsCopy = new OperationsList(this._operations);
    }

    private operationsCopy: OperationsList;
    private onCompleteCallback?: (out: T, rawFrame: byte[]) => void;
    private onFaultCallback: (reason: string, rawFrame: byte[]) => void = (reason, frame?) => console.log('FRAME PARSE FAULT', reason);
    private out: T = {} as T;
    private bufferVarName: string = '';
    private buffer: ByteBuffer = new ByteBuffer();
    private frame: byte[] = [];

    private Xor(frame: byte[]): byte
    {
        return frame.reduce((xor, next) =>
        {
            return xor ^ next;
        });
    }

    public Parse(b: byte): this 
    {
        this.frame.push(b);

        const op = this._operations.Current;
        switch (op.type) // if switch by object type is possible then .type could be removed
        {
            case OperationType.IsXor:
                const dataForXor = this.frame.slice(0, this.frame.length - 1);
                const xor = this.Xor(dataForXor);
                if (b === xor) 
                {
                    this.Next();
                }
                else
                {
                    this.Reset('checksum');
                }
                break;

            case OperationType.Is:
                const toCompare = (op as IsOperation).toCompare;
                if (b === toCompare)
                {
                    this.Next();
                }
                else this.Reset(b.toString() + ' is not ' + toCompare);
                break;

            case OperationType.Get:
                const varName: keyof T = (op as GetOperation<T>).varName;
                this.out[varName.toString()] = b;
                this.Next();
                break;

            case OperationType.Any:
                this.Next();
                break;

            case OperationType.StartBuffering:
                this.bufferVarName = (op as StartBufferingOperation).varName;
                const varSize = (op as StartBufferingOperation).varSize;
                const endian = (op as StartBufferingOperation).endian;
                this.buffer = new ByteBuffer(varSize, endian);
                this.buffer.Add(b);
                this.Next();
                break;

            case OperationType.Buffering:
                this.buffer.Add(b);
                if (this.buffer.IsFull)
                {
                    this.out[this.bufferVarName] = this.buffer.ToValue();
                }
                this.Next();
                break;

            case OperationType.If:
                let anyIfFulfilled = false;
                while (this._operations.Is(OperationType.If))
                {
                    const toCompare = (this._operations.Current as IfOperation).toCompare;
                    if (b === toCompare)
                    {
                        anyIfFulfilled = true;
                        const list = (this._operations.Current as IfOperation).list;
                        const varName = (this._operations.Current as IfOperation).varName;
                        this.out[varName] = b;
                        let toRemove = this._operations.CountType(OperationType.If);
                        if (toRemove === 0) toRemove = 1;
                        this._operations.Remove(toRemove);
                        this._operations.InsertAfterCurrent(list);
                        break;
                    }

                    this.Next();

                    if (this._operations.IsLast)
                    {
                        if (anyIfFulfilled === false)
                        {
                            this.Reset('any if is fulfilled (at the end)');
                        }
                        else
                            this.EndingReset();
                        break;
                    }
                }

                if (anyIfFulfilled === false)
                {
                    this.Reset('any if is fulfilled');
                }

                break;
        }

        if (this._operations.IsLast)
        {
            if (this.onCompleteCallback)
                this.onCompleteCallback(this.out, this.frame);

            this.EndingReset();
        }

        return this;
    }

    private Next()
    {
        this._operations.Next();
    }

    private CleanUp()
    {
        this._operations.Reset();
        this._operations = new OperationsList(this.operationsCopy);
        this.out = <T>{};
        this.frame = [];
    }

    private EndingReset()
    {
        this.CleanUp();
    }

    private Reset(reason: string)
    {
        if (this._operations.IsNonZeroIndex())
        {
            this.onFaultCallback(reason, this.frame);
        }

        this.CleanUp();
    }

    public OnComplete(callback: (out: T, rawFrame: byte[]) => void): void
    {
        this.onCompleteCallback = callback;
    }

    public OnFault(callback: (reason: string, rawFrame: byte[]) => void): void
    {
        this.onFaultCallback = callback;
    }
}
