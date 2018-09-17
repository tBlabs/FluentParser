import { byte } from "./byte";
import { OperationType } from "./OperationType";
import { Operation } from "./Operation";
export class IfOperation implements Operation
{
    public type = OperationType.If;
    constructor(public toCompare: byte, public list: Operation[]) { }
}