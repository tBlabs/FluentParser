import { byte } from "./byte";
import { ByteBuffer } from "./ByteBuffer";
import { Endian } from "./Endian";
import { OperationsList } from "./OperationsList";
import { OperationType } from "./OperationType";
import { Operation } from "./Operation";
import { IsOperation } from "./IsOperation";
import { AnyOperation } from "./AnyOperation";
import { GetOperation } from "./GetOperation";
import { IfOperation } from "./IfOperation";
import { StartBufferingOperation } from "./StartBufferingOperation";
import { BufferingOperation } from "./BufferingOperation";

export class FluentParser
{
    private operationsCopy: OperationsList;
    constructor(private _operations: OperationsList)
    {
        this.operationsCopy = this._operations;
        // console.log(this._operationsList);
    }

    private onCompleteCallback;
    private onFaultCallback;
    private out = {};
    private bufferVarName = '';
    private buffer: ByteBuffer = new ByteBuffer();

    public Parse(b: byte): this 
    {
        let op = this._operations.Current;
        // console.log(`Parse(${ b }) | ${ this._operations.toString() }`);

        switch (op.type) // if switch by object type is possible then .type could be removed
        {
            case OperationType.Is:
                if (b === (op as IsOperation).toCompare) this.Next();
                else this.Reset();
                break;

            case OperationType.Get:
                const varName = (op as GetOperation).varName;
                this.out[varName] = b;
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
    { //this.currentIndex++;
        this._operations.Next();
    }
    // TODO: move to OperationsList
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
        this.out = {};
        this._operations = this.operationsCopy; // TODO: Reload at OperationList
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

export class FluentParserBuilder
{
    private operationsList: OperationsList = new OperationsList();
    private Add(op: Operation) { this.operationsList.Add(op); }
    public get List(): Operation[] { return this.operationsList.list; }

    public Build()
    {
        //    console.log(this.operationsList);
        return new FluentParser(this.operationsList);
    }

    public Is(b)
    {
        this.operationsList.Add(new IsOperation(b));

        return this;
    }

    public Any()
    {
        this.operationsList.Add(new AnyOperation());

        return this;
    }

    public Get(varName: string)
    {
        this.operationsList.Add(new GetOperation(varName));

        return this;
    }

    public Get2LE(varName: string)
    {
        this.operationsList.Add(new StartBufferingOperation(varName, 2, Endian.Little));
        this.operationsList.Add(new BufferingOperation());

        return this;
    }
    
    public Get2BE(varName: string)
    {
        this.operationsList.Add(new StartBufferingOperation(varName, 2, Endian.Big));
        this.operationsList.Add(new BufferingOperation());

        return this;
    }

    public Get4LE(varName: string)
    {
        this.operationsList.Add(new StartBufferingOperation(varName, 4, Endian.Little));
        this.operationsList.Add(new BufferingOperation());
        this.operationsList.Add(new BufferingOperation());
        this.operationsList.Add(new BufferingOperation());

        return this;
    }

    public Get4BE(varName: string)
    {
        this.operationsList.Add(new StartBufferingOperation(varName, 4, Endian.Big));
        this.operationsList.Add(new BufferingOperation());
        this.operationsList.Add(new BufferingOperation());
        this.operationsList.Add(new BufferingOperation());

        return this;
    }

    public If(toCompare: byte, builderCallback: (builder: FluentParserBuilder) => FluentParserBuilder)
    {
        const builder = builderCallback(new FluentParserBuilder());

        this.operationsList.Add(new IfOperation(toCompare, builder.List));

        return this;
    }
}

