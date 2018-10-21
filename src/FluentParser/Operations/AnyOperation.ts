import { OperationType } from "../Types/OperationType";
import { Operation } from "./Operation";

export class AnyOperation implements Operation
{
    public type = OperationType.Any;
}
