import React, { useState} from 'react';
import './App.css';

// get each filed value
const getCell = (field: number[],x:number,y:number, size:number): any => {
    return field[y*size+x]
}
// setting value for each filed
const setFieldCell = (field: number[],x:number,y:number, size:number, value:number, type?:string):void=> {
  if(type==='inc') {
     field[y*size+x] += value
  } else {
     field[y*size+x] = value
  }
};

// update single neighbor
const updateNeighbor = (field: number[], x:number, y:number, size:number, mineValue:number)=> {
  if(x>=0 && x<size && y>=0 && y<size) {
    if(field[y*size+x] === mineValue) return;
    setFieldCell(field, x,y,size,1, 'inc')
  }
};

// update all necessary neighbors
const updateNeighbors = (field: number[], x:number, y:number, size:number, mineValue:number)=> {
  updateNeighbor(field, x+1, y, size, mineValue)
  updateNeighbor(field, x-1, y, size, mineValue)
  updateNeighbor(field, x, y+1, size, mineValue)
  updateNeighbor(field, x, y-1, size, mineValue)
  updateNeighbor(field, x+1, y-1, size, mineValue)
  updateNeighbor(field, x-1, y-1, size, mineValue)
  updateNeighbor(field, x+1, y+1, size, mineValue)
  updateNeighbor(field, x-1, y+1, size,mineValue)
}
const createFiled = (size:number, mineValue:number, mineCount: number): number[]=> {
  const field: number[] = new Array(size*size).fill(0)

  // adding mines
  for(let i =0; i < mineCount;) {
      // fill the filed with random values, depending from the size
      const x= Math.floor(Math.random()*size)
      const y= Math.floor(Math.random()*size)
      if(getCell(field, x,y, size) === mineValue) continue;
      setFieldCell(field,x,y,size, mineValue);
      i+=1
      updateNeighbors(field, x, y, size, mineValue)
    }

  return field
}
enum Mask {
    Transparent,
    Fill
}

// get each Mask filed value
const getCellMask = (field: number[],x:number,y:number, size:number): Mask => {
    return field[y*size+x]
}

// set each mask cell
const setCellMask = (field: Mask[],x:number,y:number, size:number, value:Mask  ): Mask[] => {
    field[y*size+x] = value
    return [...field]
}

// Map Mask to  jsx elem, to show the icons.
const MapMaskToView : Record<Mask, React.ReactNode> = {
    [Mask.Transparent]: null,
    [Mask.Fill]: <i className="fa fa-frown-o" aria-hidden="true"></i>
}
//open Neighbors fields depending from their value
const neighborsClear = (x:number,y:number, size:number, mask:Mask[], field: number[])=> {
    const clearStack :[number, number][] = []
    const clear = (x:number, y: number)=> {
        if(x>=0 && x<size && y>=0 && y<size) {
            if(getCellMask(mask,x,y, size) === Mask.Transparent) return
            clearStack.push([x,y])
        }
    }
    clear(x,y);
    while(clearStack.length) {
        const [x, y] = clearStack.pop()!!
        // set mask cell to transparent
        setCellMask( mask, x, y, size, Mask.Transparent)

        if(getCell(field, x,y, size) !==0) continue
        clear(x+1, y)
        clear(x-1, y)
        clear(x, y+1)
        clear(x, y-1)
    }
    return mask

}

// open all fields with bombs
const bombClear = (x:number,y:number, size:number, mask:Mask[], field: number[], mineValue:number)=> {
    const bombStack :[number, number][] = []
        for (let x=0; x<size; x++) {
            for (let y=0; y<size; y++) {
                if(getCell(field, x,y,size)===mineValue) {
                    bombStack.push([x,y])
                }
            }
        }

    while(bombStack.length) {
        const [x, y] = bombStack.pop()!!
        // set mask cell to transparent
        setCellMask( mask, x, y, size, Mask.Transparent)
    }
    return mask
}

function App() {
  // adjust size of filed, depending from u needs.
  const size = 5;
  const mineValue = -1;
  // set mine amount, analog K in description
  const mineCount = 6;
  const minerField = new Array(size).fill(null);
  const [field, setField] = useState<number [] >(()=>createFiled(size, mineValue, mineCount))
  const [mask, setMask] = useState<Mask[]>(new Array(size*size).fill(Mask.Fill));

  const onCellClick = (x:number, y:number )=> {
    if(getCellMask(mask, x,y, size) === Mask.Transparent) return
        // check does field has bomb
      if(getCell(field, x, y, size ) === mineValue) {
        bombClear(x,y,size,mask, field, mineValue)
      } else {
        // case for checking all neighbors, if its not a bomb
        neighborsClear(x,y,size,mask, field)
      }
      // update state
      setMask((prev)=>[...prev])
 }

  return (
    <div className="miner">
      {minerField.map((cur: number, y:number) => {
        return (<div key={y} className={'miner-row'}>
          {minerField.map((cur, x)=>(
              <div
                  key={x}
                  className='miner-cell'
                  onClick={onCellClick.bind(null, x,y)}
              >{
                getCell(mask, x,y,size) !== Mask.Transparent ?
                    MapMaskToView[getCellMask(mask, x,y,size)] :
                        getCell(field, x,y,size) === mineValue ?
                            <i className="fa fa-bomb" aria-hidden="true"></i> :
                                getCell(field, x,y,size)
          }</div>))}
        </div>)
      })}
    </div>
  );
}

export default App;
