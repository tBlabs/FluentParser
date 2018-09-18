import { OperationType } from "../Types/OperationType";
import { Operation } from "./Operation";

export class BufferingOperation implements Operation
{
    public type = OperationType.Buffering;
}