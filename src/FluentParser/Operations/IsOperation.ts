import { OperationType } from "../Types/OperationType";
import { byte } from "../Types/byte";
import { Operation } from "./Operation";

export class IsOperation implements Operation
{
    public type = OperationType.Is;

    constructor(public toCompare: byte)
    { }

    public toString(): string
    {
        return "IsOperation " + this.toCompare.toString(16);
    }
}
