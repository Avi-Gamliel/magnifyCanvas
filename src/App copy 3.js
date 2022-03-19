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
  const { index, page, canvasState } = props;
  const canvasRef = useRef()
const [position, setPosition] = useState({x:0, y:0})
let fabricObj = useRef();

  useEffect(() => {
    console.log(index, page);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const renderContext = {
      canvasContext: canvas.getContext('2d'),
      viewport: viewport
    };
    console.log(page);
    console.log(canvas.getContext('2d').canvas.id);
    // page.cleanup()
    console.log(canvas.getContext('2d'));
    // canvas.getContext('2d').restore()
    console.log();
    canvas.getContext('2d').clearRect(0, 0,canvas.getContext('2d').width,canvas.getContext('2d').height)

    const renderTask = page.render(renderContext);
    renderTask.promise.then(function () {
      var background = canvas.toDataURL('image/png');
      console.log(fabricObj);
if(fabricObj.current == undefined){
console.log('asdasdasdasdasdasdasd');
   fabricObj.current = new fabric.Canvas(`canvas-${index}`, {
    freeDrawingBrush: {
      width: 1,
      color: canvasState.color,
    },
  });
  fabricObj.current.setBackgroundImage(
    background,
    fabricObj.current.renderAll.bind(fabricObj)
  );
}

      var radius = 150;
      var clipPath = new fabric.Circle({
        left: position.x,
        top: position.y,
        radius: radius,
        stroke: 'black',
        startAngle: 0,
        angle: Math.PI * 2,
        originX: "top"
      });

      fabric.Image.fromURL(background, function (img) {
        img.scale(1.2).set({
          left: -(viewport.width * 1.2 - viewport.width) / 2,
          top: -(viewport.height * 1.2 - viewport.height) / 2,
          angle: 0,
          clipPath: clipPath,
          // originX: "center",
          // originY: "center"
        });
        const moveHandler = (e) => {
          console.log(e.e.pageX);
          console.log(e.e.pageY);
          setPosition(prev=> {
            prev.x = e.e.pageX;
            prev.y = e.e.pageY;
            return {...prev}
          })
          
        }
        fabricObj.current.add(img).setActiveObject(img);
        // fabricObj.current.on('mouse:move', moveHandler);

      });
      // fabricObj.add(new fabric.Image(background))

    });

    // fabricObj.current.on('mouse:move', moveHandler);
    return () => {
      // fabricObj.current.off('mouse:move', moveHandler);
    }
  }, [page])
  useEffect(() => {
    console.log('asdasd');


  }, [canvasRef.current])
  return (
    <canvas ref={canvasRef} id={`canvas-${index}`}></canvas>
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
  // console.log(pdfjsLib);
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  useEffect(() => {
    setArrayUnit(getUnit8Array(base))
  }, [])

  const renderPage = useCallback(() => {
    console.log(numRenderPage);
    pdf && pdf.getPage(numRenderPage).then(function (page) {
      if (numRenderPage < canvasState.num_of_pages) {
        setPages(prev => [...prev, page])
        setNumRenderPage(prev => numRenderPage + 1)
        // renderPage(pageNum + 1, pdf)
      } else {
        console.log('finisg');
      }
    });

  }, [pdf, numRenderPage]);

  useEffect(() => {
    
    renderPage(pdf);
  }, [pdf, renderPage]);
  const addPage = (page, pageNum) => {
    console.log(pages_rendered.current, canvasState.num_of_pages);
    if (pages_rendered.current <= canvasState.num_of_pages) {
      setPages(prev => [...prev, page])
      dispatch({ type: 'update_render_pages' })
      renderPage(pages_rendered.current + 1)
      pages_rendered.current++;
    } else {
      return console.log('finished to render !!')
    }

  }
  useEffect(() => {
    if (arrayUnit !== undefined) {
      console.log(arrayUnit);
      const loadingTask = pdfjsLib.getDocument({ data: arrayUnit });
      loadingTask.promise.then(loadedPdf => {
        setPdf(loadedPdf);
        dispatch({ type: 'update_num_pages', payload: loadedPdf.numPages })
      }, function (reason) {
        console.error(reason);
      });
    }
  }, [arrayUnit]);


  return (
    <div className="App">
      {/* <canvas id='container-canvas' ref={canvasRef}></canvas>; */}
      <div id='container-canvas'>
        {pages.length > 0 && pages.map((page, index) => {
          return <Page
            page={page}
            index={index}
            canvasState={canvasState}
          />
        })}
      </div>
    </div>
  );
}

export default App;
