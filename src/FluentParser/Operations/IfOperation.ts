import { OperationType } from "../Types/OperationType";
import { byte } from "../Types/byte";
import { Operation } from "./Operation";

export class IfOperation implements Operation
{
    public type = OperationType.If;

    constructor(
        public toCompare: byte, 
        public list: Operation[]) 
    { }
}