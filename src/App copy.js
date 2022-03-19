import React, { useEffect, useCallback, useRef, useState, useReducer } from 'react'
import base from './base64'
import { getUnit8Array } from './utils'
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import fabric from 'fabric'
import './App.css';


const Page = (props) => {
  const { index, page } = props;
  useEffect(() => {
    console.log(index, page);
  }, [])

  return (
    <canvas></canvas>
  )
}


const initState = {
  currentPage: 1,
  scale: 1,
  num_of_pages: 0,
  pages_rendered: 0,
  active_tool: 1,
  fabricObjects: [],
  fabricObjectsData: [],
  color: '#212121',
  borderColor: '#000000',
  borderSize: 1,
  font_size: 16,
  active_canvas: 0,
  container_id: null,
  url: null,
  textBoxText: '',
  format: undefined,
  orientation: undefined,
}

const reducer = (state = initState, action) => {

  switch (action.type) {
    case 'update_num_pages':
      state.num_of_pages = action.payload
      console.log(state);
      return { ...state };
    case 'update_render_pages':
      state.pages_rendered++;
      state.currentPage = state.currentPage + 1;
      console.log(state);
      return { ...state }
    default:
      break;
  }
}

function App() {
  const [canvasState, dispatch] = useReducer(reducer, initState)
  const canvasRef = useRef();
  const pages_rendered = useRef(1);
  const [pdf, setPdf] = useState()
  const [pages, setPages] = useState([])
  const [arrayUnit, setArrayUnit] = useState()
  // console.log(pdfjsLib);
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  useEffect(() => {
    setArrayUnit(getUnit8Array(base))
  }, [])
  useEffect(() => {
    console.log(pages);
  }, [pages])
  // useEffect(() => {
  //   console.log(pdf);
  //   if (pdf) {
  //     for (var i = 1; i <= pdf.numPages; i++) {
  //       pdf.getPage(i).then(function (page) {
  //         console.log(page);
  //         addPage(page)
  //       })
  //     }
  //   }
  // }, [pdf])

  // const handlePage = () => {
  //   const viewport = page.getViewport({ scale: 1.5 });
  //   const canvas = canvasRef.current;
  //   canvas.height = viewport.height;
  //   canvas.width = viewport.width;
  //   const renderContext = {
  //     canvasContext: canvas.getContext('2d'),
  //     viewport: viewport
  //   };
  //   page.render(renderContext);
  // }

  const renderPage = useCallback((pageNum, pdf) => {
    console.log(pageNum);
    pdf && pdf.getPage(pageNum).then(function (page) {
      // if (page) {
        console.log(page);
      addPage(page, pageNum)
      // }
    });
  }, [pdf]);

  useEffect(() => {
    console.log(pages_rendered.current)
    renderPage(pages_rendered.current, pdf);
  }, [pdf, pages_rendered.current, renderPage]);
  const addPage = (page, pageNum) => {
    console.log(pages_rendered.current, canvasState.num_of_pages);
    if (pages_rendered.current <= canvasState.num_of_pages  ) {
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
          />
        })}
      </div>
    </div>
  );
}

export default App;
