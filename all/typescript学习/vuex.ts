

class Vuex<S, A>{
  state: S
  action: Action<S, A>
  constructor({ state, action }: { state: S, action: Action<S, A> }) {
    this.state = state
    this.action = action
  }
  dispatch(action: any) {

  }
  createDispatch<A>() {
    return this.dispatch.bind(this) as Dispatch<A>;
  }
}


type Action<S, A> = {
  [K in keyof A]: (state: S, payload: any) => Promise<any>
}


const store = new Vuex({
  state: {
    count: 0,
    message: '',
  },
  action: {
    async ADD(state, payload: PickPayload<ActionTypes, AddType>) {
      state.count += payload;
    },
    async CHAT(state, message: PickPayload<ActionTypes, ChatType>) {
      state.message = message;
    },
  },
});


const ADD = 'ADD';
const CHAT = 'CHAT';

type AddType = typeof ADD;
type ChatType = typeof CHAT;

type ActionTypes =
  | {
    type: AddType;
    payload: number;
  }
  | {
    type: ChatType;
    payload: string;
  };

export interface Dispatch<A> {
  (action: A): any;
}

const dispatch = store.createDispatch<ActionTypes>();


export type PickPayload<Types, Type> = Types extends {
  type: Type,
  payload: infer P
} ? P : never

// store.dispatch()

dispatch({
  type: ADD,
  payload: 1
})
dispatch({
  type: CHAT,
  payload: '1'
})

