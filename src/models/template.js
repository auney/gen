import http from '@/common/request';
import _ from 'lodash';
const initState = {
  loading: false,
  data: {
    list: [],
    pagination: {}
  },
  info: {
    id: '',
    scaffold_id: '',
    cate_id: '',
    name: '',
    label: '',
    desc: '',
    template: '',
    extra_field: []
  }
};

export default {
  namespace: 'template',

  state: _.cloneDeep(initState),

  effects: {
    *list({ payload }, { call, put }) {
      const response = yield call(http.templateList, payload);
      yield put({
        type: 'save',
        payload: response.data
      });
    },
    *info({ payload }, { call, put }) {
      yield put({
        type: 'reset',
        payload: {
          type: 'info'
        }
      });
      if (payload.id == 0) {
        return;
      }
      const response = yield call(http.templateInfo, payload);
      yield put({
        type: 'saveInfo',
        payload: response.data
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(http.templateAdd, payload, {
        method: 'post'
      });
      yield put({
        type: 'save',
        payload: response.data
      });
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(http.templateRemove, payload, {
        method: 'post'
      });
      yield put({
        type: 'removeItems',
        payload: payload
      });

      if (callback) callback();
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload
      };
    },
    saveInfo(state, action) {
      return {
        ...state,
        info: action.payload
      };
    },
    changeTempalte(state, action) {
      return {
        ...state,
        info: {
          ...state.info,
          template: action.payload
        }
      };
    },
    addExtraField(state, action) {
      let info = { ...state.info };
      info.extra_field.push(action.payload);

      return {
        ...state,
        info: info
      };
    },
    updateExtraField(state, action) {
      return {
        ...state,
        info: {
          ...state.info,
          extra_field: action.payload
        }
      };
    },
    removeItems(state, action) {
      const data = state.data;
      data.list = data.list.filter(
        item => action.payload.id.indexOf(item.id) == -1
      );
      return {
        ...state,
        data: data
      };
    },
    reset(state, action) {
      const type = action.payload.type;
      if (type == 'list') {
        return {
          ...state,
          data: _.cloneDeep(initState.data)
        };
      } else if (type == 'info') {
        return {
          ...state,
          info: _.cloneDeep(initState.info)
        };
      } else {
        return {
          ...initState
        };
      }
    }
  }
};
