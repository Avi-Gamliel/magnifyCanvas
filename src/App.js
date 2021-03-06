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
  const { index, scale, setPages, setCanvases, dispatch, canvases, setCanvasFabric, canvasFabric, page, canvasState } = props;
  const canvasRef = useRef()
  const ctx = useRef()
  const pageRef = useRef()
  const pos = useRef({ x1: 0, y1: 0, y2: 0, x2: 0, formula: 0 })
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
      // console.log(1);

      // const check = canvasFabric.filter(p => p.id === `canvas-${index}`)
      renderTask.promise.then(function () {

        // console.log(2, page);
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

  useEffect(() => {


    const mouseDown = e => {
      console.log('down', e);


      pos.current.x1 = e.clientX;
      pos.current.y1 = e.clientY;
      pos.current.offsetTop = e.offsetY;
      pos.current.offsetLeft = e.offsetX;
      pos.current.containerHeight = document.querySelector('#container-canvas').scrollHeight;
      pos.current.page = Number(e.target.id.split('-')[1])
      pos.current.height = e.target.height;
      pos.current.width = e.target.width;




      // console.log('clientX', e.clientX); // 
      // console.log('clientY', e.clientY);
      // console.log('offsetX', e.offsetX);// 
      // console.log('offsetY', e.offsetY); // offset Only page
      // console.log('heightScroll', document.querySelector('#container-canvas').scrollHeight);
      // console.log('page height', e.target.height);
      // console.log('pageNum', Number(e.target.id.split('-')[1]));
      // console.log('scroll to ', Number(e.target.id.split('-')[1]) * e.target.height + ((10 * Number(e.target.id.split('-')[1])) * 2));
      // console.log('pageY', e.pageY);
      // console.log('pageY', e.pageY);
      // const x = e.clinetX
      // const y = e.clientY
      // const offsetY = e.offsetY
      // const offsetX = e.offsetX
      // pos.current.x1 = x;
      // pos.current.offsetTop = offsetY;
      // pos.current.offsetLeft = offsetX;
      // pos.current.y1 = y;
    }

    const mouseUp = e => {
      console.log('up', e);



      const x = e.clientX
      const y = e.clientY

      pos.current.x2 = x;
      pos.current.y2 = y;
      pos.current.offsetLeftEnd = e.offsetX;

      const width = pos.current.x2 - pos.current.x1;
      // const formula = pos.current.width / width;
      const formula = canvasRef.current.width / width;
      pos.current.formula = formula  



      console.log(pos);


      // console.log('width:', width);
      // console.log('formula:', Number(formula.toFixed(2)));
      // const newScale = Number(formula.toFixed(2));
      //  document.querySelector('#container-canvas').scrollTop =  e.offsetY - (pos.current.y1*Number(formula.toFixed(2) ))
      dispatch({ type: 'set-zoom', payload: Number(formula.toFixed(2)) })
      // console.log(document.querySelector('#container-canvas').scrollHeight);
      // console.log('offsetY:', pos.current.offsetTop);

      // console.log('id:', Number(e.target.id.split('-')[1]));
      // dispatch({ type: 'set-zoom', payload: newScale })
      // const pageNum = Number(e.target.id.split('-')[1]);
      // console.log(e.target.height);
      // const pageHeight = e.target.height * newScale;
      // console.log(pageHeight);
      // const scrollPage = (pageNum * pageHeight);
      // console.log('scroll', scrollPage);
      console.log((pos.current.page * pos.current.height) + ((20 * pos.current.page) + 10));


      //  ((pos.current.width) + (20 * pos.current.page)) +
      //   (pos.current.offsetLeft * Number(formula.toFixed(2)))
      // document.querySelector('#container-canvas').scrollLeft = e.target.scrollLeft + (pos.current.x1 * Number(formula.toFixed(2)))
      // canvasRef.current.scrollTop = (e.target.offsetTop *Number(formula.toFixed(2))) +(e.pageY *Number(formula.toFixed(2) ))

    }
    if (canvasRef.current) {
      canvasRef.current.addEventListener('mousedown', mouseDown)
      // canvasRef.current.addEventListener('mousemove', mouseDown)
      canvasRef.current.addEventListener('mouseup', mouseUp)

    }

    return () => {
      canvasRef.current.removeEventListener('mousedown', mouseDown)
      canvasRef.current.removeEventListener('mouseup', mouseUp)

    }
  }, [canvasRef])

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
    // console.log(canvasState.scale);
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
        if (pos.current.formula) {
          console.log(pos);
          console.log('height ==>', pos.current.height);
          console.log('offsetTop ==>', pos.current.offsetTop);
          console.log('page ==>', pos.current.page);
          console.log('formula ==>', pos.current.formula);
          const container = document.querySelector('#container-canvas');
          console.log(viewPort.height);
          console.log((pos.current.page * (pos.current.height * Number(pos.current.formula.toFixed(2)))));
          // const formula =viewPort.width/ (pos.current.x2-pos.current.x1 );
          // pos.current.formula = formula  -pos.current.formula
          console.log( pos.current.formula);
          container.scrollTop = (viewPort.height * pos.current.page) + (20 * pos.current.page)+ (pos.current.offsetTop 
          * Number(pos.current.formula.toFixed(2)))
          // container.scrollTop = (pos.current.page * (pos.current.height * Number(pos.current.formula.toFixed(2))))
          //   + (20 * pos.current.page * Number(pos.current.formula.toFixed(2)))

          // + (pos.current.offsetTop * Number(pos.current.formula.toFixed(2)))
          // container.scrollLeft = (pos.current.offsetLeft * Number(pos.current.formula.toFixed(2))) - 20
        }

      }
    } else {

    }
  }, [canvasState.scale])

  // useEffect(() => {
  //   if (fabricCanvas.current) {
  //     var radius = 150;
  //   }
  // }, [fabricCanvas])

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
  const containerMainCanvases = useRef()
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
            dispatch({ type: 'zoom-out', payload: canvasState.scale - 0.1 })
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
  }, [canvasState.scale])








  // useEffect(() => {

  //   const mouseDown = (e) => {
  //     console.log(e, 'mouse move');

  //   }

  //   const mouseUp = (e) => {
  //     console.log(e, 'mouse up');
  //   }

  //   containerMainCanvases.current.addEventListener('mousedown', mouseDown)
  //   containerMainCanvases.current.addEventListener('mouseup', mouseUp)

  //   return () => {
  //     containerMainCanvases.current.removeEventListener('mousedown', mouseDown)
  //     containerMainCanvases.current.removeEventListener('mouseup', mouseUp)
  //   }


  // }, [containerMainCanvases])
  return (
    <div className="App">
      <div id='container-canvas'
        ref={containerMainCanvases}
        style={{
          width: 700, display: 'grid',
          //  justifyContent: 'center',
          zIndex: 2000000000000, backgroundColor: 'grey'
        }}
      >
        <div>

          {pages.length > 0 && pages.map((page, index) => {
            return <Page
              setCanvases={setCanvases}
              canvases={canvases}
              key={index}
              page={page.page}
              scale={page.scale}
              index={index}
              dispatch={dispatch}
              canvasState={canvasState}
              canvasFabric={canvasFabric}
              setPages={setPages}
              setCanvasFabric={setCanvasFabric}
            />
          })}
        </div>
      </div>
      <button ref={btnZoomIn} >zoom-in</button>
      <button ref={btnZoomOut} >zoom-out</button>
      <button onClick={() => dispatch({ type: 'change-tool', payload: 'zoom-drag' })} >zoom-out</button>
    </div>
  );
}

export default App;
