type byte = number;

enum Endian 
{
    Little,
    Big
}

class ByteBuffer
{
    public valueSize = 0;
    public endian = Endian.Little; 
    private counter = 0;
    private buffer: byte[] = [];

    constructor(public size = 0)
    {
        this.valueSize = size;
        this.counter = size;
    }

    public ToValue()
    {
        switch (this.valueSize)
        {
            case 2:
                switch (this.endian)
                {
                    case Endian.Little:
                        return this.buffer[0] << 8 | this.buffer[1];
                }
        }
    }

    public Add(b: byte)
    {
        this.buffer.push(b);

        this.counter--;
    }

    public get IsFull()
    {
        return this.counter == 0;
    }
}

export class FluentParser
{
    private operationsCopy: OperationsList;
    constructor(private _operationsList: OperationsList)
    { 
        this.operationsCopy = this._operationsList ;
        // console.log(this._operationsList);
    }

    private currentIndex = 0;
    private onCompleteCallback;
    private onFaultCallback;
    private out = {};
    // private buffer = [];
    private bufferVarName = '';
    private buffer: ByteBuffer = new ByteBuffer();

    public Parse(b) 
    {
        let op = this._operationsList.Get(this.currentIndex);
    //   console.log('val',b,', cur:', this.currentIndex,', type', op.type);
        
        switch (op.type) // if switch by object type is possible then .type could be removed
        {
            case OperationType.Is: 
                if (b === (op as IsOperation).toComapre) this.Next();
                else this.Reset();
                break;

            case OperationType.Get: 
                const varName = (op as GetOperation).varName;
                this.out[varName] = b;
                this.Next();
                break;
            
            case OperationType.Any: 
                this.Next();
                break;

            case OperationType.StartBuffering:
                this.bufferVarName = (op as StartBufferingOperation).varName;
                const varSize = (op as StartBufferingOperation).varSize;
                this.buffer = new ByteBuffer(varSize);
                this.buffer.Add(b);
                this.Next();
                break;

            case OperationType.Buffering:
                this.buffer.Add(b);
                if (this.buffer.IsFull)
                {
                    // console.log('END');
                    this.out[this.bufferVarName] = this.buffer.ToValue();
                }
                this.Next();
                break;
            
            case OperationType.If: 
            /*
                Szukaj pasującego ifa
                Jeśli znajdziesz usuń wszystkie następne ify
                Insertnij operacje ifa
                Koniecznie przeładuj listę operacji po resecie
            */
        //    console.log('first If',this._operationsList.list);
             //   let i=this.currentIndex;
                while (this._operationsList.GetType(this.currentIndex) === OperationType.If)
                {
                //    console.log('i=',this.currentIndex,'/', this._operationsList.Size);
                    if (b === (this._operationsList.list[this.currentIndex] as IfOperation).toCompare)
                    {
                        const list = (this._operationsList.list[this.currentIndex] as IfOperation).list;
                        //  console.log('before rem',this._operationsList.list);
                        let n = this.currentIndex;
                        let toRemove = 0;
                        try {
                        while (this._operationsList.GetType(n) === OperationType.If)
                        {
                            n++;
                            if (n >= this._operationsList.list.length) break;
                            toRemove++;
                            // console.log('to remove', toRemove);
                        }
                            this._operationsList.Remove(this.currentIndex, toRemove);
                    } catch (ex) { console.log(ex);}
                            //  console.log('after rem', this._operationsList.list);

                        this._operationsList.Insert(this.currentIndex, list);

                        //  console.log('after insert', this._operationsList);
                        // console.log('cur', this.currentIndex);
                        this.Next();
                        break;
                    }
                    this.Next();

                //    i++;
                }
                break;
        }
// TODO: repeat this in If operation
        if (this.currentIndex === this._operationsList.Size)
        {
            this.onCompleteCallback(this.out);
            this.Reset(true);
        }

        return this;
    }

    private Next() { this.currentIndex++; }
    private Reset(ending = false) { 
       if (ending === false)
        if (this.currentIndex > 0)
        {
            // console.log('fault at', this.currentIndex);
            this.onFaultCallback();
        }
        this.currentIndex = 0; this.out = {}; 
    this._operationsList= this.operationsCopy; }

    public OnComplete(callback)
    {
        this.onCompleteCallback = callback;
    }
    public OnFault(callback)
    {
        this.onFaultCallback = callback;
    }
}

export class FluentParserBuilder
{
    private operationsList: OperationsList = new OperationsList();
    private Add(op: Operation) { this.operationsList.Add(op); }
    public get List(): Operation[] { return this.operationsList.list; }
    
    public Build()
    {
    //    console.log(this.operationsList);
        return new FluentParser(this.operationsList);
    }

    public Is(b)
    {
        this.operationsList.Add(new IsOperation(b));

        return this;
    }

    public Any()
    {
        this.operationsList.Add(new AnyOperation());

        return this;
    }

    public Get(varName: string)
    {
        this.operationsList.Add(new GetOperation(varName));

        return this;
    }

    public Get2LE(varName: string)
    {
        this.operationsList.Add(new StartBufferingOperation(varName, 2, Endian.Little));
        this.operationsList.Add(new BufferingOperation());

        return this;
    }

    public If(toCompare: byte, builderCallback: (builder: FluentParserBuilder)=>FluentParserBuilder)
    {
        const builder = builderCallback(new FluentParserBuilder());
   
        this.operationsList.Add(new IfOperation(toCompare, builder.List));

        return this;
    }
}

class OperationsList
{
    public list: Operation[] = [];

    toString()
    {
        return this.list.map(i=>i.toString());
    }
    public Add(operation: Operation)
    {
        this.list.push(operation);
    }

    public Get(index)
    {
        if (index >= this.list.length)
        {
            throw new Error('Argument out of range');
        }

        return this.list[index];
    } 
    public GetType(index)
    {
        // console.log('GetType', index);
        return this.Get(index).type;
    } 

    public Insert(index, operations: Operation[])
    {
        // console.log('insert at', index+1);
        // console.log('insert start', operations);
        operations.reverse().forEach(op=>{
            // console.log('inserting', op.type);
        this.list.splice(index+1, 0, op);
        });
        // console.log('insert end', operations);
    }

    public Remove(atIndex: number, count: number = 1)
    {
        //  console.log('removing ', atIndex, ', count:',count);

        this.list.splice(atIndex, count);
    }

    public get Size()
    {
        return this.list.length;
    }
}

enum OperationType
{
    Is = "Is", 
    Any = "Any", 
    Get = "Get", 
    If = "If",
    Get2BE = "Get2BE",
    StartBuffering = "StartBuffering",
    Buffering = "Buffering"
}

class Operation
{
    public type;

    toString()
    {
        return this.type;
    }
}


class IsOperation implements Operation
{
    public type = OperationType.Is;

    constructor(public toComapre: byte)
    { }
}

class AnyOperation implements Operation
{
    public type = OperationType.Any;
}

class GetOperation implements Operation
{
    public type = OperationType.Get;

    constructor(public varName: string)
    { }
}

class IfOperation implements Operation
{
    public type = OperationType.If;

    constructor(public toCompare: byte, public list: Operation[])
    { }
}

class StartBufferingOperation implements Operation
{
    public type = OperationType.StartBuffering;

    constructor(public varName: string, public varSize: number, public endian: Endian)
    { }
}

class BufferingOperation implements Operation
{
    public type = OperationType.Buffering;

    constructor()
    { }
}