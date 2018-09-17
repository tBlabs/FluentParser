import { byte } from "./byte";
import { Endian } from "./Endian";
import { OperationsList } from "./OperationsList";
import { Operation } from "./Operation";
import { IsOperation } from "./IsOperation";
import { AnyOperation } from "./AnyOperation";
import { GetOperation } from "./GetOperation";
import { IfOperation } from "./IfOperation";
import { StartBufferingOperation } from "./StartBufferingOperation";
import { BufferingOperation } from "./BufferingOperation";
import { IsXorOperation } from "./IsXorOperation";
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
