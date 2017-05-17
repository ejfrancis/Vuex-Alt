const isActionNamespaced = (actionName) => actionName.indexOf('/') !== -1;

const splitNamespacedAction = (actionName) => { 
  const splitActionName = actionName.split('/');
  const namespaces = splitActionName.slice(0, splitActionName.length -1);
  const name = splitActionName.slice(-1);
  return {
    name,
    namespaces
  }
}

const VuexActionsPlugin ={ 
  install: (Vue, options) => {
    const actions = options.store && options.store._actions;
    const actionsForComponents = {};

    Object.keys(actions).forEach((thisActionName) => {
      const thisActionFunctions = actions[thisActionName];
      
      if (isActionNamespaced(thisActionName)) {
        const { name, namespaces } = splitNamespacedAction(thisActionName);

        // ensure each nested namespace exists as an object nested properly
        let currentParent = actionsForComponents;
        namespaces.forEach((thisNamespace) => {
          currentParent[thisNamespace] = currentParent[thisNamespace] || {};
          currentParent = currentParent[thisNamespace]
        });
        currentParent[name] = function(...args) {
          thisActionFunctions.forEach((fn) => fn.apply(this, args));
        };
      } else {
        actionsForComponents[thisActionName] = function (...args) {
          thisActionFunctions.forEach((fn) => fn.apply(this, args));
        }
      }
    });

    Vue.prototype.$actions = actionsForComponents;
  }
}

export {
  VuexActionsPlugin
}