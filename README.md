# Vuex-Alt
An alternative, opinionated approach to Vuex helpers for accessing state, getters and actions that doesn't rely on string constants.

## Installation

First install the npm package with 

```npm install --save vuex-alt```

Then use the plugin, passing in the Vuex Store.

```javascript
import Vuex from 'vuex';
import { VuexAltPlugin } from 'vuex-alt';

// use Vuex as usual
Vue.use(Vuex);

// create your store
const store = new Vuex.Store({ ... });

// use the VuexAltPlugin, and pass it
// the new Vuex Store
Vue.use(VuexAltPlugin, { store });
```

## Prerequisites
Vuex-Alt makes two intentional, opinionated assumptions about your Vuex code:

1. Mutations are only commited from within actions. Components never directly commit mutations. Every mutation has an accompanying action.
2. All Vuex state, getters and actions are organized into [Vuex modules](https://vuex.vuejs.org/en/modules.html).

These two rules lead to more scalable state management code, and more predictable state changes.

## API Usage 
Vuex-Alt provides an alternative approach to the Vuex helpers for `mapState`, `mapActions`, and `mapGetters`. 

The main difference between the Vuex-Alt helpers and the original Vuex helpers is that instead of accepting strings to specify the namespace and action/getter you want, access is done via functions and nested objects.

### mapState()
Provide an object that maps local Vuex instance properties to Vuex module properties.

For example, if you have a state property called `count` on a Vuex store module called `counter` you would access it like this:

```javascript
computed: {
  ...mapState({
    count: (state) => state.counter.count
  })
}
```

### mapActions()
Provide an object that maps local Vuex instance methods to Vuex module methods.

For example, if you have an action called `increment()` on a Vuex store module called `counter` you would access it like this:

```javascript
methods: {
  ...mapActions({
    increment: (actions) => actions.counter.increment
  })
}
```

Now you can access it in your component via `this.increment(10)`.

### mapGetters()
Provide an object that maps local Vuex instance properties to Vuex module getters.

For example, if you have a getter called `countPlusTen()` on a Vuex store module called `counter` you would access it like this:

```javascript
computed: {
  ...mapGetters({
    countPlusTen: (getters) => getters.counter.countPlusTen
  })
}
```