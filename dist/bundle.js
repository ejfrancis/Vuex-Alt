'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var camelCase = _interopDefault(require('camelcase'));

const mapState = normalizeNamespace((namespace, states) => {
  const res = {};
  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState () {
      let state = this.$store.state;
      let getters = this.$store.getters;
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapState', namespace);
        if (!module) {
          return
        }
        state = module.context.state;
        getters = module.context.getters;
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    };
    // mark vuex getter for devtools
    res[key].vuex = true;
  });
  return res
});

const mapGetters = function(gettersMap) {
  const res = {};
  const keys = Object.keys(gettersMap);
  for(let i = 0; i < keys.length; i++) {
    const thisGetterKey = keys[i];
    const thisGetterMappingFn = gettersMap[thisGetterKey];
    res[thisGetterKey] = function(...args) {
      return thisGetterMappingFn(this._gettersNestedObject)();
    };
  }
  return res;
};

const mapActions = function(actionsMap) {
  const res = {};
  const keys = Object.keys(actionsMap); 
  for (let i = 0; i < keys.length; i++) {
    const thisActionKey = keys[i];
    const thisActionMappingFn = actionsMap[thisActionKey];
    res[thisActionKey] = function (...args) {
      thisActionMappingFn(this._actionsNestedObject)(...args);
    };
  }
  return res;
};

function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }))
}

function normalizeNamespace (fn) {
  return (namespace, map) => {
    if (typeof namespace !== 'string') {
      map = namespace;
      namespace = '';
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/';
    }
    return fn(namespace, map)
  }
}

function getModuleByNamespace (store, helper, namespace) {
  const module = store._modulesNamespaceMap[namespace];
  if (process.env.NODE_ENV !== 'production' && !module) {
    console.error(`[vuex] module namespace not found in ${helper}(): ${namespace}`);
  }
  return module
}

const isNamespaced = (actionName) => actionName.indexOf('/') !== -1;

const splitNamespacedName = (actionName) => { 
  const splitActionName = actionName.split('/');
  const namespaces = splitActionName.slice(0, splitActionName.length -1);
  const name = splitActionName.slice(-1)[0];
  return {
    name,
    namespaces
  }
};

const VuexAltPlugin = { 
  install: (Vue, options) => {
    const actions = options.store && options.store._actions;
    const actionsNestedObject = {};

    Object.keys(actions).forEach((thisActionName) => {
      const thisActionFunctions = actions[thisActionName];

      const actionFn = function(...args) {
        thisActionFunctions.forEach((fn) => fn.apply(this, args));
      };
      
      if (isNamespaced(thisActionName)) {
        const { name, namespaces } = splitNamespacedName(thisActionName);

        // ensure each nested namespace exists as an object nested properly
        let currentParent = actionsNestedObject;
        namespaces.forEach((thisNamespace) => {
          currentParent[thisNamespace] = currentParent[thisNamespace] || {};
          currentParent = currentParent[thisNamespace];
        });
     
        // store this action on proper parent obj, and convert to camelCase as well
        currentParent[name] = actionFn;
        currentParent[camelCase(name)] = actionFn;
      } else {
        // store action on root scope, and convert to camelCase as well
        actionsNestedObject[thisActionName] = actionFn;
        actionsNestedObject[camelCase(thisActionName)] = actionFn;
      }
    });

    const getters = options.store && options.store.getters;
    const gettersNestedObject = {};

    Object.keys(getters).forEach((thisGetterName) => {
      const thisGetter = getters[thisGetterName];

      const thisGetterFn = function() {
        return getters[thisGetterName];
      };
      
      if (isNamespaced(thisGetterName)) {
        const { name, namespaces } = splitNamespacedName(thisGetterName);

        // ensure each nested namespace exists as an object nested properly
        let currentParent = gettersNestedObject;
        namespaces.forEach((thisNamespace) => {
          currentParent[thisNamespace] = currentParent[thisNamespace] || {};
          currentParent = currentParent[thisNamespace];
        });
     
        // store this action on proper parent obj, and convert to camelCase as well
        currentParent[name] = thisGetterFn;
        currentParent[camelCase(name)] = thisGetterFn;
      } else {
        // store action on root scope, and convert to camelCase as well
        gettersNestedObject[thisGetterName] = thisGetterFn;
        gettersNestedObject[camelCase(thisGetterName)] = thisGetterFn;
      }
    });

    Vue.prototype._actionsNestedObject = actionsNestedObject;
    Vue.prototype._gettersNestedObject = gettersNestedObject;
  }
};

exports.mapState = mapState;
exports.mapGetters = mapGetters;
exports.mapActions = mapActions;
exports.VuexAltPlugin = VuexAltPlugin;
