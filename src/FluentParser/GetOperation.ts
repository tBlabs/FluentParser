import { OperationType } from "./OperationType";
import { Operation } from "./Operation";
export class GetOperation implements Operation
{
    public type = OperationType.Get;
    constructor(public varName: string) { }
}