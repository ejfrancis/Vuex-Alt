'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var mapState = normalizeNamespace(function (namespace, states) {
  var res = {};
  normalizeMap(states).forEach(function (_ref) {
    var key = _ref.key,
        val = _ref.val;

    res[key] = function mappedState() {
      var state = this.$store.state;
      var getters = this.$store.getters;

      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapState', namespace);

        if (!module) {
          return;
        }

        state = module.context.state;
        getters = module.context.getters;
      }

      return typeof val === 'function' ? val.call(this, state, getters) : state[val];
    }; // mark vuex getter for devtools


    res[key].vuex = true;
  });
  return res;
});

var mapGetters = function mapGetters(gettersMap) {
  var res = {};
  var keys = Object.keys(gettersMap);

  var _loop = function _loop(i) {
    var thisGetterKey = keys[i];
    var thisGetterMappingFn = gettersMap[thisGetterKey];

    res[thisGetterKey] = function () {
      return thisGetterMappingFn(this._gettersNestedObject)();
    };
  };

  for (var i = 0; i < keys.length; i++) {
    _loop(i);
  }

  return res;
};

var mapActions = function mapActions(actionsMap) {
  var res = {};
  var keys = Object.keys(actionsMap);

  var _loop2 = function _loop2(i) {
    var thisActionKey = keys[i];
    var thisActionMappingFn = actionsMap[thisActionKey];

    res[thisActionKey] = function () {
      return thisActionMappingFn(this._actionsNestedObject).apply(void 0, arguments);
    };
  };

  for (var i = 0; i < keys.length; i++) {
    _loop2(i);
  }

  return res;
};

function normalizeMap(map) {
  return Array.isArray(map) ? map.map(function (key) {
    return {
      key: key,
      val: key
    };
  }) : Object.keys(map).map(function (key) {
    return {
      key: key,
      val: map[key]
    };
  });
}

function normalizeNamespace(fn) {
  return function (namespace, map) {
    if (typeof namespace !== 'string') {
      map = namespace;
      namespace = '';
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/';
    }

    return fn(namespace, map);
  };
}

function getModuleByNamespace(store, helper, namespace) {
  var module = store._modulesNamespaceMap[namespace];

  if (process.env.NODE_ENV !== 'production' && !module) {
    console.error("[vuex] module namespace not found in ".concat(helper, "(): ").concat(namespace));
  }

  return module;
}

function preserveCamelCase(str) {
  var isLastCharLower = false;
  var isLastCharUpper = false;
  var isLastLastCharUpper = false;

  for (var i = 0; i < str.length; i++) {
    var c = str[i];

    if (isLastCharLower && /[a-zA-Z]/.test(c) && c.toUpperCase() === c) {
      str = str.substr(0, i) + '-' + str.substr(i);
      isLastCharLower = false;
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper = true;
      i++;
    } else if (isLastCharUpper && isLastLastCharUpper && /[a-zA-Z]/.test(c) && c.toLowerCase() === c) {
      str = str.substr(0, i - 1) + '-' + str.substr(i - 1);
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper = false;
      isLastCharLower = true;
    } else {
      isLastCharLower = c.toLowerCase() === c;
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper = c.toUpperCase() === c;
    }
  }

  return str;
}

var camelcase = function camelcase(str) {
  if (arguments.length > 1) {
    str = Array.from(arguments).map(function (x) {
      return x.trim();
    }).filter(function (x) {
      return x.length;
    }).join('-');
  } else {
    str = str.trim();
  }

  if (str.length === 0) {
    return '';
  }

  if (str.length === 1) {
    return str.toLowerCase();
  }

  if (/^[a-z0-9]+$/.test(str)) {
    return str;
  }

  var hasUpperCase = str !== str.toLowerCase();

  if (hasUpperCase) {
    str = preserveCamelCase(str);
  }

  return str.replace(/^[_.\- ]+/, '').toLowerCase().replace(/[_.\- ]+(\w|$)/g, function (m, p1) {
    return p1.toUpperCase();
  });
};

var isNamespaced = function isNamespaced(actionName) {
  return actionName.indexOf('/') !== -1;
};

var splitNamespacedName = function splitNamespacedName(actionName) {
  var splitActionName = actionName.split('/');
  var namespaces = splitActionName.slice(0, splitActionName.length - 1);
  var name = splitActionName.slice(-1)[0];
  return {
    name: name,
    namespaces: namespaces
  };
};

var VuexAltPlugin = {
  install: function install(Vue, options) {
    var actions = options.store && options.store._actions;
    var actionsNestedObject = {};
    Object.keys(actions).forEach(function (thisActionName) {
      var thisActionFunctions = actions[thisActionName];
      var thisActionFunction = thisActionFunctions[0];

      var actionFn = function actionFn() {
        if (!thisActionFunction) {
          return;
        }

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return thisActionFunction.apply(this, args);
      };

      if (isNamespaced(thisActionName)) {
        var _splitNamespacedName = splitNamespacedName(thisActionName),
            name = _splitNamespacedName.name,
            namespaces = _splitNamespacedName.namespaces; // ensure each nested namespace exists as an object nested properly


        var currentParent = actionsNestedObject;
        namespaces.forEach(function (thisNamespace) {
          currentParent[thisNamespace] = currentParent[thisNamespace] || {};
          currentParent = currentParent[thisNamespace];
        }); // store this action on proper parent obj, and convert to camelCase as well

        currentParent[name] = actionFn;
        currentParent[camelcase(name)] = actionFn;
      } else {
        // store action on root scope, and convert to camelCase as well
        actionsNestedObject[thisActionName] = actionFn;
        actionsNestedObject[camelcase(thisActionName)] = actionFn;
      }
    });
    var getters = options.store && options.store.getters;
    var gettersNestedObject = {};
    Object.keys(getters).forEach(function (thisGetterName) {
      var thisGetter = getters[thisGetterName];

      var thisGetterFn = function thisGetterFn() {
        return getters[thisGetterName];
      };

      if (isNamespaced(thisGetterName)) {
        var _splitNamespacedName2 = splitNamespacedName(thisGetterName),
            name = _splitNamespacedName2.name,
            namespaces = _splitNamespacedName2.namespaces; // ensure each nested namespace exists as an object nested properly


        var currentParent = gettersNestedObject;
        namespaces.forEach(function (thisNamespace) {
          currentParent[thisNamespace] = currentParent[thisNamespace] || {};
          currentParent = currentParent[thisNamespace];
        }); // store this action on proper parent obj, and convert to camelCase as well

        currentParent[name] = thisGetterFn;
        currentParent[camelcase(name)] = thisGetterFn;
      } else {
        // store action on root scope, and convert to camelCase as well
        gettersNestedObject[thisGetterName] = thisGetterFn;
        gettersNestedObject[camelcase(thisGetterName)] = thisGetterFn;
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
