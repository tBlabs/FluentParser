import { byte } from "./Types/byte";
import { ByteBuffer } from "./ByteBuffer";
import { OperationsList } from "./OperationsList";
import { OperationType } from "./Types/OperationType";
import { IsOperation } from "./Operations/IsOperation";
import { GetOperation } from "./Operations/GetOperation";
import { IfOperation } from "./Operations/IfOperation";
import { StartBufferingOperation } from "./Operations/StartBufferingOperation";

export class FluentParser<T>
{
    constructor(private _operations: OperationsList)
    {
        this.operationsCopy = this._operations;
    }
    
    private operationsCopy: OperationsList;
    private onCompleteCallback;
    private onFaultCallback;
    private out = <T>{};
    private bufferVarName = '';
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
                if (b === this.Xor(this.frame.slice(0, this.frame.length-1))) this.Next();
                else this.Reset();
                break;

            case OperationType.Is:
                if (b === (op as IsOperation).toCompare) this.Next();
                else this.Reset();
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
                    if (b === (this._operations.Current as IfOperation).toCompare)
                    {
                        anyIfFulfilled = true;
                        const list = (this._operations.Current as IfOperation).list;
                        const toRemove = this._operations.CountType(OperationType.If);
                        this._operations.Remove(toRemove);
                        this._operations.Insert(list);
                        this.Next();
                        break;
                    }

                    this.Next();

                    if (this._operations.IsLast)
                    {
                        this.onFaultCallback(this.out);
                        this.Reset(true);
                        break;
                    }
                }

                if (anyIfFulfilled == false)
                {
                    this.Reset();
                }

                break;
        }

        if (this._operations.IsLast)
        {
            this.onCompleteCallback(this.out);
            this.Reset(true);
        }

        return this;
    }

    private Next()
    {
        this._operations.Next();
    }

    private Reset(ending = false)
    {
        if (ending === false)
        {
            if (this._operations.IsNonZeroIndex())
            {
                this.onFaultCallback();
            }
        }

        this._operations.Reset();
        this.out = <T>{};
        this.frame = [];
        this._operations = this.operationsCopy;
    }

    public OnComplete(callback)
    {
        this.onCompleteCallback = callback;
    }

    public OnFault(callback)
    {
        this.onFaultCallback = callback;
    }
}
