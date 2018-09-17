import { byte } from "./byte";
import { OperationType } from "./OperationType";
import { Operation } from "./Operation";
export class IsOperation implements Operation
{
    public type = OperationType.Is;
    constructor(public toCompare: byte) { }
}