import { byte } from "./Types/byte";
import { Endian } from "./Types/Endian";
import { OperationsList } from "./Utils/OperationsList";
import { Operation } from "./Operations/Operation";
import { IsOperation } from "./Operations/IsOperation";
import { AnyOperation } from "./Operations/AnyOperation";
import { GetOperation } from "./Operations/GetOperation";
import { IfOperation } from "./Operations/IfOperation";
import { StartBufferingOperation } from "./Operations/StartBufferingOperation";
import { BufferingOperation } from "./Operations/BufferingOperation";
import { IsXorOperation } from "./Operations/IsXorOperation";
import { FluentParser } from "./FluentParser";

export class FluentParserBuilder<T>
{
    private operations: OperationsList = new OperationsList();
    public get List(): Operation[] { return this.operations.List; }

    public Build()
    {
        return new FluentParser<T>(this.operations);
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

    public Get(varName: keyof T)
    {
        this.operations.Add(new GetOperation<T>(varName));

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

    public If(toCompare: byte, varName: string, builderCallback: (builder: FluentParserBuilder<T>) => FluentParserBuilder<T>)
    {
        const builder = builderCallback(new FluentParserBuilder());
        this.operations.Add(new IfOperation(toCompare, varName, builder.List));

        return this;
    }

    public IsXor(): this
    {
        this.operations.Add(new IsXorOperation());

        return this;
    }
}
