import camelCase from 'camelcase';

const isNamespaced = (actionName) => actionName.indexOf('/') !== -1;

const splitNamespacedName = (actionName) => { 
  const splitActionName = actionName.split('/');
  const namespaces = splitActionName.slice(0, splitActionName.length -1);
  const name = splitActionName.slice(-1)[0];
  return {
    name,
    namespaces
  }
}

const VuexAltPlugin = { 
  install: (Vue, options) => {
    const actions = options.store && options.store._actions;
    const actionsNestedObject = {};

    Object.keys(actions).forEach((thisActionName) => {
      const thisActionFunctions = actions[thisActionName];
      const thisActionFunction = thisActionFunctions[0];

      const actionFn = function(...args) {
        if (!thisActionFunction) {
          return;
        }
        return thisActionFunction.apply(this, args);
      };
      
      if (isNamespaced(thisActionName)) {
        const { name, namespaces } = splitNamespacedName(thisActionName);

        // ensure each nested namespace exists as an object nested properly
        let currentParent = actionsNestedObject;
        namespaces.forEach((thisNamespace) => {
          currentParent[thisNamespace] = currentParent[thisNamespace] || {};
          currentParent = currentParent[thisNamespace]
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
      }
      
      if (isNamespaced(thisGetterName)) {
        const { name, namespaces } = splitNamespacedName(thisGetterName);

        // ensure each nested namespace exists as an object nested properly
        let currentParent = gettersNestedObject;
        namespaces.forEach((thisNamespace) => {
          currentParent[thisNamespace] = currentParent[thisNamespace] || {};
          currentParent = currentParent[thisNamespace]
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
}

export {
  VuexAltPlugin
}

