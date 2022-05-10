import { useState, useEffect, useCallback } from "react"
import { fabric } from 'fabric';

import Canvas from "./components/Canvas";

const distance = 15

const App = props => {  
    // console.log("APP COMPONENT")
    const [canvas, setCanvas] = useState(null)
    const [image, setImage] = useState("")
    const [isMouseDown, setIsMouseDown] = useState(false)
    const [mode, setMode] = useState("")
    const [drawingColor, setDrawingColor] = useState("red")
    const [rectColor, setRectColor] = useState("")
    const [polygonColor, setPolygonColor] = useState("")
    const [polygonPoints, setPolygonPoints] = useState([])
    const [polygonCompleted, setPolygonCompleted] = useState(false)


    const shapeClosed = useCallback(coords => {
        if (polygonPoints.length > 2) {
            const targetX = polygonPoints[0].x
            const targetY = polygonPoints[0].y
            const lastX = coords.x
            const lastY = coords.y
            if (Math.sqrt((targetX-lastX)**2 + (targetY-lastY)**2) <= distance) {
                return true
            }
        }
        return false
    }, [polygonPoints])

    /* CANVAS EVENT LISTENERS */
    const mouseMoveEvent = useCallback(e => {
        if (isMouseDown && mode === "drag") {
            const mEvent = e.e;
            const delta = new fabric.Point(mEvent.movementX, mEvent.movementY)
            canvas.relativePan(delta)
        }
    }, [isMouseDown, canvas, mode])

    const mouseDownEvent = useCallback(e => {
        setIsMouseDown(true)
        if (mode === "polygon") {
            const isShapeClosed = shapeClosed(e.pointer)
            console.log(isShapeClosed)
            if (!isShapeClosed) {
                setPolygonPoints(state => [...state, e.pointer])
            } else {
                setPolygonCompleted(true)
            }
        }
        return
    }, [setIsMouseDown, mode, shapeClosed])

    const mouseUpEvent = useCallback(() => setIsMouseDown(false), [setIsMouseDown])

    const keyPressedEvent = useCallback(e => {
        if (canvas && e.key === "Delete") {
            const activeObjs = canvas.getActiveObjects()
            activeObjs.forEach(o => canvas.remove(o))
        }        
    }, [canvas])
    /*      */
    
    useEffect(() => {
        // console.log("USE EFFECT")
        if (!canvas) return
        /* if (!image) return */

        canvas.isDrawingMode = false

        switch (mode) {
            case "drag":
                canvas.setCursor("grab")
                break
            case "draw":
                canvas.isDrawingMode = true
                canvas.freeDrawingBrush.width = 10
                canvas.freeDrawingBrush.color = drawingColor
                canvas.renderAll()
                break
            case "spawn":
                if (rectColor) {
                    const rect = new fabric.Rect({
                        width: 100,
                        height: 100,
                        stroke: rectColor,
                        strokeWidth: 1,
                        fill: "transparent"
                    })
                    canvas.add(rect)
                    canvas.renderAll()
                }
                setRectColor("")
                break
            default:
                break
        }

        fabric.Image.fromURL("https://media.forgecdn.net/avatars/107/154/636364134932167010.jpeg", (img) => {  
        canvas.backgroundImage = img
            canvas.renderAll()
        })

        canvas.on({
            "mouse:move": mouseMoveEvent,
            "mouse:down": mouseDownEvent,
            "mouse:up": mouseUpEvent
        })

        document.addEventListener("keydown", keyPressedEvent, false)

        return () => {
            canvas.off({
                "mouse:move": mouseMoveEvent,
                "mouse:down": mouseDownEvent,
                "mouse:up": mouseUpEvent
            })
            document.removeEventListener("keyPressed", keyPressedEvent)
        }
        
    }, [
        canvas, 
        isMouseDown, 
        drawingColor, 
        mode, 
        rectColor,
        image,
        setIsMouseDown, 
        mouseMoveEvent, 
        mouseDownEvent, 
        mouseUpEvent,
        keyPressedEvent,
        setRectColor
    ])

    

    useEffect(() => {
        if (!canvas) return

        console.log("POLYGON EFFECT")

        /* canvas.getObjects().forEach(o => canvas.remove(o)) */

        if (mode === "polygon" && polygonPoints.length > 0) {

            polygonPoints.forEach(points => {
                const point = new fabric.Circle({
                    radius: 4,
                    top: points.y-2,
                    left: points.x-2,
                    fill: polygonColor,
                    stroke: polygonColor,
                    selectable: false
                })
                canvas.add(point)
                canvas.renderAll()
            })

            if (polygonCompleted) {

                const polygon = new fabric.Polygon(polygonPoints, {
                    fill: "transparent",
                    stroke: polygonColor,
                    strokeWidth: 1.5
                })
                canvas.add(polygon)
                canvas.renderAll()
            }

        }

    }, [
        polygonPoints,
        polygonColor,
        polygonCompleted,
        mode
    ])

    const onDragBButtonHandler = () => {
        setMode(state => {
            if (state === "drag") return ""
            return "drag"
        })
    }

    const onDrawButtonHandler = () => {
        setMode(state => {
            if (state === "draw") return ""
            return "draw"
        })
    }

    const onSpawnShapeButtonHandler = () => {
        setMode(state => {
            if (state === "spawn") return ""
            return "spawn"
        })
    }
    
    const onPolygonButtonHandler = () => {
        setMode(state => {
            if (state === "polygon") return ""
            return "polygon"
        })
    }

    const onSaveButtonHandler = () => {
        const dataURL = canvas.toDataURL({
            format: 'jpeg',
            quality: 0.8
        })     
        console.log(dataURL)
    }

    const onClearButtonHandler = () => {
        canvas.getObjects().forEach(o => canvas.remove(o))
    }

    const onImageUploaded = e => {
        const img = e.target.files[0]
        setImage(URL.createObjectURL(img))
    }

    return (
        <div className="container">

            <div className="sidebar">

                <button 
                    className={`${mode==="drag" && "toggled"}`} 
                    onClick={onDragBButtonHandler}> Drag Image </button>

                <div className="draw__button">
                    <button 
                        className={`${mode==="draw" && "toggled"}`}
                        onClick={onDrawButtonHandler}> Draw </button>
                    {
                        mode === "draw"
                        &&
                        <div className="color__picker">
                            <div 
                                className={`${drawingColor==="red" && "color__toggled"} ${"color__option color__red"}`} 
                                onClick={() => setDrawingColor("red")}></div>
                            <div 
                                className={`${drawingColor==="green" && "color__toggled"} ${"color__option color__green" }`}
                                onClick={() => setDrawingColor("green")}></div>
                        </div>
                    }
                </div>

                <div className="spawn__button">
                    <button 
                            className={`${mode==="spawn" && "toggled"}`}
                            onClick={onSpawnShapeButtonHandler}> Rectangle </button>
                    {
                        mode === "spawn"
                        &&
                        <div className="color__picker">
                            <div 
                                className="color__option color__red" 
                                onClick={() => setRectColor("red")}></div>
                            <div 
                                className="color__option color__green"
                                onClick={() => setRectColor("green")}></div>
                        </div>
                    }
                </div>

                <div className="polygon__button">
                    <button 
                            className={`${mode==="polygon" && "toggled"}`}
                            onClick={onPolygonButtonHandler}> Polygon </button>
                    {
                        mode === "polygon"
                        &&
                        <div className="color__picker">
                            <div 
                                className="color__option color__red" 
                                onClick={() => setPolygonColor("red")}></div>
                            <div 
                                className="color__option color__green"
                                onClick={() => setPolygonColor("green")}></div>
                        </div>
                    }
                </div>

                <div style={{flexGrow:1}}></div>

                <button className="save" onClick={onSaveButtonHandler}> Save </button>

                <button onClick={onClearButtonHandler}> Clear </button>

                <form>
                    <label htmlFor="img"> Upload Img</label>
                    <input type="file" name="img" id="img" onChange={onImageUploaded} />
                </form>
    
            </div>

            <div className="canvas__container">
                <Canvas setCanvas={setCanvas} />
            </div>

        </div>
    )
}

export default App