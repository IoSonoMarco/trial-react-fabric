import { useEffect, useRef } from "react"
import { fabric } from 'fabric';

const Canvas = ({setCanvas}) => {
    const canvasRef = useRef(null)

    useEffect(() => {
        setCanvas(
          new fabric.Canvas(canvasRef.current, {
            height: 500,
            width: 500,
            renderOnAddRemove: true,
          })
        );
      }, [setCanvas])
    
    return (
        <canvas ref={canvasRef} className="canvas__box"></canvas>
    )
}

export default Canvas