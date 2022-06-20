export class PriorityQueue{
  constructor(){
    this.array = [];
  }

  enqueue(element, priority){
    let qElement = new QElement(element,priority);
    let contain = false;

    for(let i = 0; i < this.array.length; i++){
      if(this.array[i].priority > qElement.priority){

        this.array.splice(i,0,qElement);
        contain = true;
        break;
      }
    }

    if(!contain) this.array.push(element);
  }

  dequeue(){
    if(this.isEmpty){
      return "Underflow";
    }

    return this.array.shift();
  }

  isEmpty(){
    return this.array.length < 1;
  }

  front(){
    if(this.isEmpty){
      return "No elements in Queue";
    }

    return this.array[0];
  }

  rear(){
    if (this.isEmpty())
        return "No elements in Queue";
    return this.array[this.array.length - 1];
  }
}

export class QElement{
  constructor(element, priority){
    this.element = element;
    this.priority = priority;
  }
}