export const mapState = normalizeNamespace((namespace, states) => {
  const res = {}
  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState() {
      let state = this.$store.state
      let getters = this.$store.getters
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapState', namespace)
        if (!module) {
          return
        }
        state = module.context.state
        getters = module.context.getters
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    }
    // mark vuex getter for devtools
    res[key].vuex = true
  })
  return res
})

export const mapGetters = function (gettersMap) {
  const res = {};
  const keys = Object.keys(gettersMap);
  for (let i = 0; i < keys.length; i++) {
    const thisGetterKey = keys[i];
    const thisGetterMappingFn = gettersMap[thisGetterKey];
    res[thisGetterKey] = function (...args) {
      return thisGetterMappingFn(this._gettersNestedObject)();
    }
  }
  return res;
}

export const mapActions = function (actionsMap) {
  const res = {};
  const keys = Object.keys(actionsMap);
  for (let i = 0; i < keys.length; i++) {
    const thisActionKey = keys[i];
    const thisActionMappingFn = actionsMap[thisActionKey];
    res[thisActionKey] = function (...args) {
      return thisActionMappingFn(this._actionsNestedObject)(...args);
    }
  }
  return res;
}

function normalizeMap(map) {
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }))
}

function normalizeNamespace(fn) {
  return (namespace, map) => {
    if (typeof namespace !== 'string') {
      map = namespace
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/'
    }
    return fn(namespace, map)
  }
}

function getModuleByNamespace(store, helper, namespace) {
  const module = store._modulesNamespaceMap[namespace]
  if (process.env.NODE_ENV !== 'production' && !module) {
    console.error(`[vuex] module namespace not found in ${helper}(): ${namespace}`)
  }
  return module
}