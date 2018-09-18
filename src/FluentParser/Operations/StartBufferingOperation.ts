import { OperationType } from "../Types/OperationType";
import { Endian } from "../Types/Endian";
import { Operation } from "./Operation";

export class StartBufferingOperation implements Operation
{
    public type = OperationType.StartBuffering;

    constructor(
        public varName: string, 
        public varSize: number, 
        public endian: Endian)
    { }
}