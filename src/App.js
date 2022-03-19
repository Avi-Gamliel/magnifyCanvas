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
  const ctx = useRef()
  const background = useRef()
  const fabricCanvas = useRef()
  const [updatePosition, setUpdatePosition] = useState({ x: 0, y: 0 })
  const [magnify, setMagnify] = useState({ object: null })
  // const magnify = useRef(null)
  useEffect(() => {
    console.log('# page render component');
    const viewPort = page.getViewport({ scale: canvasState.scale })
    const canvas = canvasRef.current;
    canvas.height = viewPort.height;
    canvas.width = viewPort.width;

    ctx.current = canvas.getContext('2d');
    const renderContext = {
      canvasContext: ctx.current,
      viewport: viewPort,
    };
    const renderTask = page.render(renderContext);
    renderTask.promise.then(function () {
      // inst.pages_rendered++;
      background.current = canvas.toDataURL('image/png');
      fabricCanvas.current = new fabric.Canvas(canvas.id, {
        freeDrawingBrush: {
          width: 1,
          color: canvasState.color,
        },
      });
      fabricCanvas.current.setBackgroundImage(
        background.current,
        fabricCanvas.current.renderAll.bind(fabricCanvas.current)
      );
    });
  }, [])


  useEffect(() => {
    const handleMove = (event) => {
      console.log(fabricCanvas.current);
      console.log('event.pointer.x -', event.pointer.x * 1.2);
      console.log('canvasRef.current.width * 1.2', canvasRef.current.width * 1.2 / 2);
      console.log('left: ', (event.pointer.x * 1.2 - 25) - (canvasRef.current.width * 1.2 / 2));
      console.log('pageY: ', event.e.pageY);
      const pageX =event.pointer.x;
      const pageY = event.pointer.y;

      const scale = 1.2;
      const M_X = pageX;
      const M_Y = pageY;


      const S_W = canvasRef.current.width;
      const S_H = canvasRef.current.height;
      const B_W = S_W * scale;
      const B_H = S_H * scale;
      const B_H_P = (B_H - S_H) / 2;
      const B_W_P = (B_W - S_W) / 2;

      const S_Ps_X = M_X - (S_W / 2)
      const S_Ps_Y = M_Y - (S_H / 2)

      console.log('M_X', M_X);
      console.log('M_Y', M_Y);
      console.log('S_W', S_W);
      console.log('S_H', S_H);
      console.log('B_W', B_W);
      console.log('B_H', B_H);
      console.log('B_H_P', B_H_P);
      console.log('B_W_P', B_W_P);
      console.log('S_Ps_X', S_Ps_X);
      console.log('S_Ps_Y', S_Ps_Y);
      console.log(M_X - ((M_X * scale) - B_W_P));
      console.log('##### ', M_X * 1.2 - (B_W / 2) + (B_W_P * 2) + 25,);
      console.log(pageX);
      var clipPath = new fabric.Circle({
        // left: (event.pointer.x *1.2)- (canvasRef.current.width * 1.2 / 2),
        // left: S_Ps_X * 1.2,
        // top: S_Ps_Y*1.2,
        // left: (M_X - (canvasRef.current.width/2) )*1.2,
        // top: (M_Y - (canvasRef.current.height/2) )*1.2 ,
        left: M_X * 1.2 - (canvasRef.current.width * 1.2 / 2) - (B_W_P - ((M_X - ((M_X * 1.2) - B_W_P)) - B_W_P)) + 50 + 25,
        top: M_Y * 1.2 - (canvasRef.current.height * 1.2 / 2) - (B_H_P - ((M_Y - ((M_Y * 1.2) - B_H_P)) - B_H_P)) + 50 + 50 ,

        // top: (event.pointer.y*1.2) - (canvasRef.current.height * 1.2 / 2),
        radius: 50,
        stroke: 'black',
        startAngle: 0,
        angle: Math.PI * 2,
        originX: "center",
        originY: "center"
      });
      const findObject = fabricCanvas.current._objects.filter(p => p.class == `magnify-${index}`)
      if (findObject.length > 0) {
        fabricCanvas.current._objects.map(p => {
          fabricCanvas.current.remove(p)
        })
        // fabricCanvas.current.remove(findObject[0])
      }
      fabric.Image.fromURL(background.current, function (img) {
        console.log('###############', updatePosition);
        img
          .scale(1.2)
          .set({
            width: canvasRef.current.width * 1.2,
            height: canvasRef.current.height * 1.2,
            // left: -(canvasRef.current.width * 1.2 - canvasRef.current.width) / 2,
            // top: -(canvasRef.current.height * 1.2 - canvasRef.current.height) / 2,
            // left: event.pointer.x - (canvasRef.current.width / 2),
            // top: event.pointer.y - (canvasRef.current.height / 2),
            // left: M_X - ((M_X * scale) - B_W_P)-  B_W_P,

            // left: S_Ps_X - (S_Ps_X*1.2) -(B_W_P/2),
            // top: S_Ps_Y - (S_Ps_Y*1.2) - (B_H_P/2),

            left: (M_X - ((M_X * 1.2) - B_W_P)) - B_W_P,
            top: (M_Y - ((M_Y * 1.2) - B_H_P)) - B_H_P ,

            // left:  B_W_P + M_X -(M_X*1.2) ,
            //         top:B_H_P + M_Y - (M_Y*1.2),

            // top:-B_H_P,
            // left:-B_W_P,
            // top: M_Y - ((M_Y * scale) - B_H_P)-  B_H_P,
            angle: 0,
            class: `magnify-${index}`,
            clipPath: clipPath,
            orignX: 'center',
            orignY: 'center',
          });
        console.log(fabricCanvas.current);
        fabricCanvas.current.add(img)
        img.on('mouse:move', (e) => {
          console.log(e);
        })
        // magnify.animate({
        //   left: 200,
        // })
        // .setActiveObject(img);
      });
      console.log('move mouse');
    }
    if (fabricCanvas.current) {
      console.log(fabricCanvas.current);

      fabricCanvas.current.on('mouse:move', handleMove)
    }

    return () => {
      fabricCanvas.current.off('mouse:move', handleMove)

    }
  }, [fabricCanvas.current, index])

  useEffect(() => {
    if (fabricCanvas.current) {
      var radius = 150;
      console.log('XXXXXXXXXXXXXX');
      // setMagnify(prev => {
      //  prev.object =  new fabric.Circle({
      //     left: 0,
      //     top: 0,
      //     radius: radius,
      //     stroke: 'black',
      //     startAngle: 0,
      //     angle: Math.PI * 2,
      //     originX: "top"
      //   })
      //   return { ...prev }
      // }
      // )



    }
  }, [fabricCanvas])

  // useEffect(() => {
  //   console.log('XXXXXXXXXXXXXXXX', fabricCanvas.current);
  //   if (fabricCanvas.current) {
  //     console.log('YYYYYYYYYYYYYYYY', magnify);
  //     if (magnify) {

  //       fabric.Image.fromURL(background.current, function (img) {
  //         console.log(updatePosition);
  //         img.scale(1.2).set({
  //           left: -(canvasRef.current.width * 1.2 - canvasRef.current.width) / 2,
  //           top: -(canvasRef.current.height * 1.2 - canvasRef.current.height) / 2,
  //           angle: 0,
  //           class: `magnify-${index}`,
  //           clipPath: magnify,
  //         });
  //         fabricCanvas.current.add(img)
  //         // magnify.animate({
  //         //   left: 200,
  //         // })
  //         // .setActiveObject(img);
  //       });
  //     }
  //   }
  // }, [magnify, updatePosition, background, canvasRef, fabricCanvas.current])


  // const [position, setPosition] = useState({ x: 0, y: 0 })
  // let fabricObj = useRef();

  // useEffect(() => {
  //   console.log(index, page);
  //   const viewport = page.getViewport({ scale: 1.5 });
  //   const canvas = canvasRef.current;
  //   canvas.height = viewport.height;
  //   canvas.width = viewport.width;
  //   const renderContext = {
  //     canvasContext: canvas.getContext('2d'),
  //     viewport: viewport
  //   };

  //   const renderTask = page.render(renderContext);
  //   renderTask.promise.then(function () {
  //     var background = canvas.toDataURL('image/png');

  //   });

  // }, [page])
  // useEffect(() => {
  //   console.log('asdasd');


  // }, [canvasRef.current])
  return (
    <canvas
      // key={index}
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
  // console.log(pdfjsLib);
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  useEffect(() => {
    console.log(`# useEffect - get unit8Array from bsae64`);

    setArrayUnit(getUnit8Array(base))
  }, [])

  const renderPage = useCallback(() => {
    console.log('# callBack - render pdf');

    pdf && pdf.getPage(numRenderPage).then(function (page) {
      if (numRenderPage < canvasState.num_of_pages) {
        console.log(`# callBack - render page - ${numRenderPage} - > continue`);
        if (typeof canvasState.format === 'undefined' ||
          typeof canvasState.orientation === 'undefined') {
          dispatch({ type: 'update-orination-and-format', payload: { page } })
        }
        setPages(prev => [...prev, page])
        setNumRenderPage(prev => numRenderPage + 1)
        // renderPage(pageNum + 1, pdf)
      } else {
        console.log(`# callBack - render page - finish`);

      }
    });

  }, [pdf, numRenderPage]);




  useEffect(() => {
    console.log('# useEffect - render pdf');

    renderPage(pdf);
  }, [pdf, renderPage]);

  useEffect(() => {
    if (arrayUnit !== undefined) {
      console.log('# useEffect - create arrayUnit');
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
            key={index}
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
