
    loadedPdf.getPage(i).then(function (page) {
        // setPages(prev => [...prev, page])
        var viewport = page.getViewport({ scale: 1.3 });
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        document.getElementById('container-canvas').appendChild(canvas);
        canvas.className = 'pdf-canvas';
        canvas.className = `pdf-canvas${i}`;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        context = canvas.getContext('2d');

        var renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        var renderTask = page.render(renderContext);
        renderTask.promise.then(function () {

          pages_rendered.current++;
          // if (pages_rendered.current = canvasState.number_of_pages) }
          var background = canvas.toDataURL('image/png');
          var fabricObj = new fabric.Canvas(canvas.id, {
            freeDrawingBrush: {
              width: 1,
              color: canvasState.color,
            },
          });
          fabricObj.setBackgroundImage(
            background,
            fabricObj.renderAll.bind(fabricObj)
          );
        })

      })