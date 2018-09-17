import { OperationType } from "./OperationType";
import { Operation } from "./Operation";

export class IsXorOperation implements Operation
{
    public type = OperationType.IsXor;
}