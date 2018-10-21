import { OperationsList } from "../Utils/OperationsList";
import { IsOperation } from "../Operations/IsOperation";
import { IfOperation } from "../Operations/IfOperation";
import { AnyOperation } from "../Operations/AnyOperation";
import { OperationType } from "../Types/OperationType";
import { IsXorOperation } from "../Operations/IsXorOperation";

describe('OperationsList', () =>
{
    it('should build list', () =>
    {
        const list = new OperationsList();

        list.Add(new IsOperation(0x01));
        list.Add(new IsOperation(0x01));
        list.Add(new IsOperation(0x01));

        expect(list.Size).toBe(3);
    });

    it('should detect last', () =>
    {
        const list = new OperationsList();

        list.Add(new IsOperation(0x01));
        list.Add(new IsOperation(0x01));
        list.Add(new IsOperation(0x01));

        list.Next();
        list.Next();
        list.Next();

        expect(list.IsLast).toBeTruthy();
    });

    it('CurrentType should return current item', () =>
    {
        const list = new OperationsList();

        list.Add(new IsOperation(0x01));
        list.Add(new IfOperation(0x01, 'if', []));
        list.Add(new AnyOperation());

        expect(list.CurrentType).toBe(OperationType.Is);
        list.Next();
        expect(list.CurrentType).toBe(OperationType.If);
        list.Next();
        expect(list.CurrentType).toBe(OperationType.Any);
        list.Next();
    });

    it('Insert should insert', () =>
    {
        const list = new OperationsList();

        list.Add(new IsOperation(0x01));
        list.Add(new IfOperation(0x01, 'if', []));
        list.Add(new AnyOperation());
        list.Next();
        list.Next();
        list.Next();
        list.InsertAfterCurrent([new IsXorOperation(), new IsOperation(0x05)]);

        expect(list.List.map(i => i.type))
            .toEqual([
                OperationType.Is,
                OperationType.If,
                OperationType.Any,
                OperationType.IsXor,
                OperationType.Is,
            ]);
    });

    it('Insert should insert', () =>
    {
        const list = new OperationsList();

        list.Add(new IfOperation(0x01, 'if', []));
        list.Next();
        list.InsertAfterCurrent([new IsOperation(0x02)]);

        expect(list.List.map(i => i.type))
            .toEqual([
                OperationType.If,
                OperationType.Is,
            ]);
    });
});