import { OperationType } from "../Types/OperationType";
import { Operation } from "./Operation";

export class GetOperation<T> implements Operation
{
    public type = OperationType.Get;

    constructor(public varName: keyof T) 
    { }
}