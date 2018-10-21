import { Operation } from "../Operations/Operation";
import { OperationType } from "../Types/OperationType";
import { IsOperation } from "../Operations/IsOperation";
import { IfOperation } from "../Operations/IfOperation";
import { GetOperation } from "../Operations/GetOperation";

interface Dummy { }

export class OperationsList
{
    private list: Operation[] = [];
    private currentIndex: number = 0;

    public get List()
    {
        return this.list;
    }

    constructor(operationsList?: OperationsList)
    {
        if (operationsList)
        {
            this.list = [];
            operationsList.List.forEach(i => this.list.push(i));
        }
        this.currentIndex = 0;
    }
    public toString()
    {
        return this.currentIndex + '/' + this.Size + ' ' + this.CurrentType + ' '
            + (this.CurrentType === OperationType.Is ? '0x' + (this.Current as IsOperation).toCompare.toString(16) : '')
            + (this.CurrentType === OperationType.If ? '0x' + (this.Current as IfOperation).toCompare.toString(16) : '')
            + (this.CurrentType === OperationType.Get ? (this.Current as GetOperation<Dummy>).varName : '');
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

    public InsertAfterCurrent(operations: Operation[])
    {
        let i = this.currentIndex;
        operations.forEach(op =>
        {
            this.list.splice(i, 0, op);
            i++;
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
