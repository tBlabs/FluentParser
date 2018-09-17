import { OperationType } from "./OperationType";
import { Operation } from "./Operation";
export class BufferingOperation implements Operation
{
    public type = OperationType.Buffering;
    constructor() { }
}