import React, { useEffect, useCallback, useRef, useState, useReducer } from 'react'
import base from './base64'
import { getUnit8Array } from './utils'
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import fb from 'fabric'
import './App.css';
import { reducer, initState } from './reducer'

const Page = (props) => {
  const fabric = fb.fabric
  const { index, scale, setPages, setCanvases, canvases, setCanvasFabric, canvasFabric, page, canvasState } = props;
  const canvasRef = useRef()
  const ctx = useRef()
  const pageRef = useRef()
  const background = useRef()

  const fabricCanvas = useRef()
  const [updatePosition, setUpdatePosition] = useState({ x: 0, y: 0 })
  const [magnify, setMagnify] = useState({ object: null })
  // const magnify = useRef(null)
  useEffect(() => {
    // console.log('# page render component', canvasState);

    const getCanvases = document.querySelectorAll(`#canvas-${index}`)
    // if (getCanvases.length > 0) {
    //   //   console.log(getCanvases);
    // } else {
    if (canvases[index]) {
      // console.log(canvases);
    } else {
      pageRef.current = page;
      const viewPort = page.getViewport({ scale: scale })
      console.log(page);
      const canvas = canvasRef.current;
      canvas.height = viewPort.height;
      canvas.width = viewPort.width;

      ctx.current = canvas.getContext('2d');
      const renderContext = {
        canvasContext: ctx.current,
        viewport: viewPort,
      };
      const renderTask = page.render(renderContext);
      background.current = canvas.toDataURL('image/png');
      setCanvases(prev => [...prev, canvas])
      // }
      console.log(1);

      // const check = canvasFabric.filter(p => p.id === `canvas-${index}`)
      renderTask.promise.then(function () {

        console.log(2, page);
        //   background.current = canvas.toDataURL('image/png');
        //   fabricCanvas.current = new fabric.Canvas(canvas.id, {
        //     freeDrawingBrush: {
        //       width: 1,
        //       color: canvasState.color,
        //     },
        //     id: `canvas-${index}`
        //   });
        //   setCanvasFabric(prev => [...prev, fabricCanvas])
        //   fabricCanvas.current.setBackgroundImage(
        //     background.current,
        //     fabricCanvas.current.renderAll.bind(fabricCanvas.current)
        //   );
      });
    }
    // }, [canvasState.scale])
  }, [scale, page])


  // useEffect(() => {
  //   const handleMove = (event) => {
  //     const pageX =event.pointer.x;
  //     const pageY = event.pointer.y;

  //     const scale = 1.2;
  //     const M_X = pageX;
  //     const M_Y = pageY;

  //     const S_W = canvasRef.current.width;
  //     const S_H = canvasRef.current.height;
  //     const B_W = S_W * scale;
  //     const B_H = S_H * scale;
  //     const B_H_P = (B_H - S_H) / 2;
  //     const B_W_P = (B_W - S_W) / 2;

  //     const S_Ps_X = M_X - (S_W / 2)
  //     const S_Ps_Y = M_Y - (S_H / 2)
  //     var clipPath = new fabric.Circle({
  //       left: M_X * 1.2 - (canvasRef.current.width * 1.2 / 2) - (B_W_P - ((M_X - ((M_X * 1.2) - B_W_P)) - B_W_P)) + 50 + 25,
  //       top: M_Y * 1.2 - (canvasRef.current.height * 1.2 / 2) - (B_H_P - ((M_Y - ((M_Y * 1.2) - B_H_P)) - B_H_P)) + 50 + 50 ,
  //       radius: 50,
  //       stroke: 'black',
  //       startAngle: 0,
  //       angle: Math.PI * 2,
  //       originX: "center",
  //       originY: "center"
  //     });
  //     const findObject = fabricCanvas.current._objects.filter(p => p.class == `magnify-${index}`)
  //     if (findObject.length > 0) {

  //       fabricCanvas.current.remove(findObject[0])
  //     }
  //     fabric.Image.fromURL(background.current, function (img) {
  //       img
  //         .scale(1.2)
  //         .set({
  //           width: canvasRef.current.width * 1.2,
  //           height: canvasRef.current.height * 1.2,
  //           left: (M_X - ((M_X * 1.2) - B_W_P)) - B_W_P,
  //           top: (M_Y - ((M_Y * 1.2) - B_H_P)) - B_H_P ,
  //           angle: 0,
  //           class: `magnify-${index}`,
  //           clipPath: clipPath,
  //           orignX: 'center',
  //           orignY: 'center',
  //         });
  //       console.log(fabricCanvas.current);
  //       fabricCanvas.current.add(img)
  //       img.on('mouse:move', (e) => {
  //         console.log(e);
  //       })
  //     });
  //     console.log('move mouse');
  //   }
  //   if (fabricCanvas.current) {
  //     fabricCanvas.current.on('mouse:move', handleMove)
  //   }

  //   return () => {
  //     fabricCanvas.current.off('mouse:move', handleMove)

  //   }
  // }, [fabricCanvas.current, index])


  useEffect(() => {
    console.log(canvasState.scale);
    if (canvases.length > 0) {
      if (canvasRef.current) {
        const viewPort = pageRef.current.getViewport({ scale: canvasState.scale })
        // console.log(page);
        const canvas = canvasRef.current;
        canvas.height = viewPort.height;
        canvas.width = viewPort.width;

        ctx.current = canvas.getContext('2d');
        const renderContext = {
          canvasContext: ctx.current,
          viewport: viewPort,
        };
        const renderTask = pageRef.current.render(renderContext);
      }
    } else {

    }
  }, [canvasState.scale])

  useEffect(() => {
    if (fabricCanvas.current) {
      var radius = 150;
    }
  }, [fabricCanvas])

  return (
    <canvas
      className='pdf-canvas'
      ref={canvasRef}
      id={`canvas-${index}`}
    ></canvas>
  )
}




function App() {
  const [canvasState, dispatch] = useReducer(reducer, initState)
  const canvasRef = useRef();
  const pages_rendered = useRef(0);
  const [pdf, setPdf] = useState()
  const [pages, setPages] = useState([])
  const [numRenderPage, setNumRenderPage] = useState(1)
  const [arrayUnit, setArrayUnit] = useState()
  const [canvasFabric, setCanvasFabric] = useState([])
  const btnZoomIn = useRef()
  const btnZoomOut = useRef()
  const typeZoom = useRef('')
  // const [clicks, setClicks] = useState(0)
  const clicks = useRef(0)
  const [canvases, setCanvases] = useState([])
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  useEffect(() => {
    setArrayUnit(getUnit8Array(base))
  }, [])

  const renderPage = useCallback(() => {
    console.log(numRenderPage, canvasState.scale, canvasState.num_of_pages);
    pdf && pdf.getPage(numRenderPage).then(function (page) {
      if (numRenderPage < canvasState.num_of_pages) {
        if (typeof canvasState.format === 'undefined' ||
          typeof canvasState.orientation === 'undefined') {
          dispatch({ type: 'update-orination-and-format', payload: { page } })
        }
        console.log(page);
        setPages(prev => {
          const filter = prev.filter((p, i) => i == numRenderPage)
          let temp = [...prev]
          console.log(temp[numRenderPage]);
          if (temp[numRenderPage]) {
            temp[numRenderPage].scale = canvasState.scale
          } else {
            temp = [...prev, { page, scale: canvasState.scale }]
          }
          return [...temp]
        })
        setNumRenderPage(prev => numRenderPage + 1);
      } else {
        console.log(`# callBack - render page - finish`);

      }
    });

  }, [pdf, numRenderPage]);




  useEffect(() => {
    renderPage(pdf);
  }, [pdf, renderPage]);

  useEffect(() => {
    if (arrayUnit !== undefined) {
      const loadingTask = pdfjsLib.getDocument({ data: arrayUnit });
      loadingTask.promise.then(loadedPdf => {
        setPdf(loadedPdf);
        dispatch({ type: 'update_num_pages', payload: loadedPdf.numPages })
      }, function (reason) {
        console.error(reason);
      });
    }
  }, [arrayUnit]);
  const zoomIn = (page, zoom) => {
    console.log(page, zoom);
    // setPages([])
    // setNumRenderPage(1)
  }
  // useEffect(() => {
  //   document.getElementById('container-canvas').innerHTML = ''
  //   setPages(prev => {
  //     const temp =[...prev]
  //     temp.map(p => {
  //       return p.scale = canvasState.scale
  //     })
  //     return [...temp ]
  //   })
  // }, [canvasState.scale])


  useEffect(() => {
    let time;
    const mouseDown = (e) => {
      clicks.current++;
      // setClicks(prev=>prev+1)
      typeZoom.current = 'in'
      if (clicks.current > 0) {

        time = setTimeout(() => {
          console.log('down', clicks.current);
          if (clicks.current > 1) {
            console.log('doubleClick');
            dispatch({ type: 'zoom-in', payload: canvasState.scale + 0.1 })
          } else if (clicks.current > 0) {
            dispatch({ type: 'zoom-in', payload: canvasState.scale })
            console.log('click');
          }
          clicks.current = 0

        }, 100)
      }
    }

    const mouseDownOut = (e) => {
      clicks.current++;
      // setClicks(prev=>prev+1)
      typeZoom.current = 'out'
      if (clicks.current > 0) {

        time = setTimeout(() => {
          console.log('down', clicks.current);
          if (clicks.current > 1) {
            console.log('doubleClick');
            dispatch({ type: 'zoom-out', payload: canvasState.scale -0.1 })
          } else if (clicks.current > 0) {
            dispatch({ type: 'zoom-out', payload: canvasState.scale })
            console.log('click');
          }
          clicks.current = 0

        }, 100)
      }
    }

    btnZoomIn.current.addEventListener('mousedown', mouseDown)
    btnZoomOut.current.addEventListener('mousedown', mouseDownOut)


    return () => {
      btnZoomIn.current.removeEventListener('mousedown', mouseDown)
      btnZoomOut.current.removeEventListener('mousedown', mouseDownOut)
      clearTimeout(time)
    }
  }, [ canvasState.scale ])
  
  useEffect(()=>{
console.log('sadddddddddddddddddddddd ',clicks,typeZoom);

  },[clicks])
  
  return (
    <div className="App">
      <div id='container-canvas'
        style={{ width: 700, backgroundColor: 'grey' }}
      >
        {pages.length > 0 && pages.map((page, index) => {
          // console.log(index);
          return <Page
            setCanvases={setCanvases}
            canvases={canvases}
            key={index}
            page={page.page}
            scale={page.scale}
            index={index}
            canvasState={canvasState}
            canvasFabric={canvasFabric}
            setPages={setPages}
            setCanvasFabric={setCanvasFabric}
          />
        })}
      </div>
      <button
        ref={btnZoomIn}
        // onMouseDown={()}

        onClick={() => {
          zoomIn(canvasState.currentPage, canvasState.zoom)

          // setPages(prev => {
          //   prev.map(p => {
          //     p.scale += 0.1
          //   })
          //   return [...prev]
          // })
        }}>zoom-in</button>
      <button
        ref={btnZoomOut}
        onClick={() => {
          // setPages(prev => {
          //   prev.map(p => {
          //     p.scale -= 0.1
          //   })
          //   return [...prev]
          // })

          // dispatch({ type: 'zoom-out', payload: canvasState.scale })
        }}>zoom-out</button>
    </div>
  );
}

export default App;
