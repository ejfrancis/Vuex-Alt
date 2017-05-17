# Vuex Actions Plugin

> Access Vuex actions on a Vue instance with this.$actions.foo()

## Set Up

```javascript
Vue.use(Vuex);

const store = createStore();   // returns a Vuex.Store

Vue.use(VuexActionsPlugin, { store });
```

## Usage

Vuex actions will be available inside components via `this.$actions`. So if you've registered an action `foo()` you can call it via `this.$actions.foo()`.

```javascript
export default {
  methods: {
    handleFoo () {
      this.$actions.foo();
    }
  }
}
```
### Namespaced Modules

Actions from namespaced Vuex modules are accessible via their namespace nested inside the `this.$actions` object. 

For example, if you have a Vuex module called `counter` with the action `increment` namespaced as `counter/increment`, you can access this via `this.$actions.counter.increment()`.

```javascript
export default {
  methods: {
    handleIncrement () {
      this.$actions.counter.increment();
    }
  }
}
```