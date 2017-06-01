const VuexAltPlugin = require('./vuex-alt-plugin').VuexAltPlugin;

describe('VuexAltPlugin', () => {
  describe('actions', () => {
    it('adds _actionsNestedObject to Vue', () => {
      class VueMock {};
      const storeMock = {
        _actions: {},
        getters: {}
      }
      VuexAltPlugin.install(VueMock, { store: storeMock });
      const instance = new VueMock();
      expect(typeof instance._actionsNestedObject === 'object').toEqual(true);
    });
    it('creates proper nested actions object', () => {
      class VueMock {};
      const someActionMock = jest.fn();
      const anotherActionMock = jest.fn();
      const storeMock = {
        _actions: {
          'moduleA/someAction': [someActionMock],
          'moduleB/subModuleB/anotherAction': [anotherActionMock]
        },
        getters: {}
      }
      VuexAltPlugin.install(VueMock, { store: storeMock });
      const instance = new VueMock();
      instance._actionsNestedObject.moduleA.someAction();
      instance._actionsNestedObject.moduleB.subModuleB.anotherAction();
      expect(someActionMock.mock.calls.length).toEqual(1);
      expect(anotherActionMock.mock.calls.length).toEqual(1);
    });
  });
  describe('getters', () => {
    it('adds _gettersNestedObject to Vue', () => {
      class VueMock {};
      const storeMock = {
        _actions: {},
        getters: {}
      }
      VuexAltPlugin.install(VueMock, { store: storeMock });
      const instance = new VueMock();
      expect(typeof instance._gettersNestedObject === 'object').toEqual(true);
    });
    it('creates proper nested getters object', () => {
      class VueMock {};
      const storeMock = {
        _actions: {},
        getters: {
          'moduleA/someGetter': 'someGetter',
          'moduleB/subModuleB/anotherGetter': 'anotherGetter'
        }
      }
      VuexAltPlugin.install(VueMock, { store: storeMock });
      const instance = new VueMock();
      expect(instance._gettersNestedObject.moduleA.someGetter()).toEqual('someGetter');
      expect(instance._gettersNestedObject.moduleB.subModuleB.anotherGetter()).toEqual('anotherGetter');
    });
  });
});