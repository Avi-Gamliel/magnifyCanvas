const initState = {
  currentPage: 1,
  scale: 1,
  num_of_pages: 0,
  tool: 'hand',
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
      return { ...state };

    case 'update-orination-and-format':
      const currentPage = action.payload.page;
      const orginalViewPort = currentPage.getViewport({ scale: 1 })
      state.format = [orginalViewPort.width, orginalViewPort.height]
      state.orientation = orginalViewPort.width > orginalViewPort.height ? 'landscape' : 'potrait'

      return { ...state }

    case 'zoom-out':
      state.scale = Number(action.payload.toFixed(1)) - 0.1
      return { ...state };
    case 'zoom-in':

      console.log(action.payload, Number(action.payload.toFixed(1)) + 0.1);
      state.scale = Number(action.payload.toFixed(1)) + 0.1
      return { ...state };
    case 'change-tool':
      state.tool = action.payload;
      console.log(state);
      return { ...state };

      case 'set-zoom':
        state.scale = action.payload
        return {...state}
    default:
      break;
  }
}

export { reducer, initState };