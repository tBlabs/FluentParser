import { Operation } from "./Operations/Operation";
import { OperationType } from "./Types/OperationType";

export class OperationsList
{
    public list: Operation[] = [];
    private currentIndex: number = 0;

    constructor()
    {
        this.currentIndex = 0;
    }

    toString()
    {
        return this.currentIndex+'/'+this.Size;
    }

    public Add(operation: Operation)
    {
        this.list.push(operation);
    }

    public Next()
    {
        this.currentIndex++;
    }

    public Reset()
    {
        this.currentIndex = 0;
    }

    public get CurrentIndex()
    {
        return this.currentIndex;
    }

    public get Current(): Operation
    {
        return this.Get(this.currentIndex);
    }

    public get CurrentType()
    {
        return this.Current.type;
    }

    public Is(type: OperationType): boolean
    {
        return this.CurrentType === type;
    }

    public get IsLast()
    {
        return (this.currentIndex === this.Size);
    }

    public Get(index)
    {
        if (index >= this.list.length)
        {
            throw new Error('Argument out of range');
        }
        return this.list[index];
    }

    public GetType(index: number): OperationType
    {
        return this.Get(index).type;
    }

    public CountType(type: OperationType): number
    {
        let n = this.currentIndex;
        let count = 0;

        while (this.GetType(n) === type)
        {
            n++;
            if (n >= this.Size) break;
            count++;
        }

        return count;
    }

    public Insert(operations: Operation[])
    {
        operations.reverse().forEach(op =>
        {
            this.list.splice(this.currentIndex + 1, 0, op);
        });
    }

    public Remove(count: number)
    {
        this.list.splice(this.currentIndex, count);
    }

    public get Size()
    {
        return this.list.length;
    }

    public IsNonZeroIndex()
    {
        return this.currentIndex > 0;
    }
}