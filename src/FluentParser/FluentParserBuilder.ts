import { byte } from "./Types/byte";
import { Endian } from "./Types/Endian";
import { OperationsList } from "./OperationsList";
import { Operation } from "./Operations/Operation";
import { IsOperation } from "./Operations/IsOperation";
import { AnyOperation } from "./Operations/AnyOperation";
import { GetOperation } from "./Operations/GetOperation";
import { IfOperation } from "./Operations/IfOperation";
import { StartBufferingOperation } from "./Operations/StartBufferingOperation";
import { BufferingOperation } from "./Operations/BufferingOperation";
import { IsXorOperation } from "./Operations/IsXorOperation";
import { FluentParser } from "./FluentParser";

export class FluentParserBuilder
{
    private operations: OperationsList = new OperationsList();
    public get List(): Operation[] { return this.operations.list; }

    public Build()
    {
        return new FluentParser(this.operations);
    }

    public Is(b)
    {
        this.operations.Add(new IsOperation(b));
        
        return this;
    }

    public Any()
    {
        this.operations.Add(new AnyOperation());

        return this;
    }

    public Get(varName: string)
    {
        this.operations.Add(new GetOperation(varName));

        return this;
    }

    public Get2LE(varName: string)
    {
        this.operations.Add(new StartBufferingOperation(varName, 2, Endian.Little));
        this.operations.Add(new BufferingOperation());

        return this;
    }

    public Get2BE(varName: string)
    {
        this.operations.Add(new StartBufferingOperation(varName, 2, Endian.Big));
        this.operations.Add(new BufferingOperation());

        return this;
    }

    public Get4LE(varName: string)
    {
        this.operations.Add(new StartBufferingOperation(varName, 4, Endian.Little));
        this.operations.Add(new BufferingOperation());
        this.operations.Add(new BufferingOperation());
        this.operations.Add(new BufferingOperation());

        return this;
    }

    public Get4BE(varName: string)
    {
        this.operations.Add(new StartBufferingOperation(varName, 4, Endian.Big));
        this.operations.Add(new BufferingOperation());
        this.operations.Add(new BufferingOperation());
        this.operations.Add(new BufferingOperation());

        return this;
    }

    public If(toCompare: byte, builderCallback: (builder: FluentParserBuilder) => FluentParserBuilder)
    {
        const builder = builderCallback(new FluentParserBuilder());
        this.operations.Add(new IfOperation(toCompare, builder.List));

        return this;
    }

    public IsXor(): this
    {
        this.operations.Add(new IsXorOperation());

        return this;
    }
}
