const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS ForEach Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  describe('Simple and nested ForEach without orderBy', () => {
    it('can generate a simple ForEach event without orderBy', function () {
      const serializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::ForEach',
          object: 'MyObject',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: ['Counter', '+', 'MyObject.Variable(MyVariable)'],
            },
          ],
          events: [],
        },
      ]);

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        serializerElement,
        {
          parameterTypes: { MyObject: 'object' },
          logCode: false,
        }
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const objectLists = new gdjs.Hashtable();
      const myObjects = [];
      objectLists.put('MyObject', myObjects);
      for (let index = 1; index <= 4; index++) {
        const myObject = runtimeScene.createObject('MyObject');
        myObject.getVariables().get('MyVariable').setNumber(index);
        myObjects.push(myObject);
      }

      runCompiledEvents(gdjs, runtimeScene, [objectLists]);

      expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(
        1 + 2 + 3 + 4
      );
    });

    it('can generate nested ForEach events without orderBy', function () {
      const serializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::ForEach',
          object: 'MyObjectA',
          conditions: [],
          actions: [],
          events: [
            {
              type: 'BuiltinCommonInstructions::ForEach',
              object: 'MyObjectB',
              conditions: [],
              actions: [
                {
                  type: { value: 'ModVarScene' },
                  parameters: [
                    'Counter',
                    '+',
                    'MyObjectA.Variable(MyVariable) * MyObjectB.Variable(MyVariable)',
                  ],
                },
              ],
              events: [],
            },
          ],
        },
      ]);

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        serializerElement,
        {
          parameterTypes: {
            MyObjectA: 'object',
            MyObjectB: 'object',
          },
          logCode: false,
        }
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();

      const objectALists = new gdjs.Hashtable();
      const myObjectsA = [];
      objectALists.put('MyObjectA', myObjectsA);
      for (let index = 1; index <= 3; index++) {
        const obj = runtimeScene.createObject('MyObjectA');
        obj.getVariables().get('MyVariable').setNumber(index);
        myObjectsA.push(obj);
      }

      const objectBLists = new gdjs.Hashtable();
      const myObjectsB = [];
      objectBLists.put('MyObjectB', myObjectsB);
      for (let index = 1; index <= 2; index++) {
        const obj = runtimeScene.createObject('MyObjectB');
        obj.getVariables().get('MyVariable').setNumber(10 * index);
        myObjectsB.push(obj);
      }

      runCompiledEvents(gdjs, runtimeScene, [objectALists, objectBLists]);

      expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(
        (1 + 2 + 3) * (10 + 20)
      );
    });

    it('order and limit have no impact when orderBy is not set', function () {
      const serializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::ForEach',
          object: 'MyObject',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: ['Counter', '+', 'MyObject.Variable(MyVariable)'],
            },
          ],
          events: [],
        },
      ]);

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        serializerElement,
        {
          parameterTypes: { MyObject: 'object' },
          logCode: false,
        }
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const objectLists = new gdjs.Hashtable();
      const myObjects = [];
      objectLists.put('MyObject', myObjects);
      for (let index = 1; index <= 5; index++) {
        const myObject = runtimeScene.createObject('MyObject');
        myObject.getVariables().get('MyVariable').setNumber(index);
        myObjects.push(myObject);
      }

      runCompiledEvents(gdjs, runtimeScene, [objectLists]);

      expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(
        1 + 2 + 3 + 4 + 5
      );
    });
  });

  describe('ForEach with orderBy and limit', () => {
    it('can generate ForEach with orderBy ascending, no limit', function () {
      const serializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::ForEach',
          object: 'MyObject',
          orderBy: 'MyObject.Variable(Score)',
          order: 'asc',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarSceneTxt' },
              parameters: [
                'Result',
                '+',
                'ToString(MyObject.Variable(Score)) + ","',
              ],
            },
          ],
          events: [],
        },
      ]);

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        serializerElement,
        {
          parameterTypes: { MyObject: 'object' },
          logCode: false,
        }
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const objectLists = new gdjs.Hashtable();
      const myObjects = [];
      objectLists.put('MyObject', myObjects);

      // Create objects with scores in non-sorted order
      [30, 10, 50, 20, 40].forEach(score => {
        const obj = runtimeScene.createObject('MyObject');
        obj.getVariables().get('Score').setNumber(score);
        myObjects.push(obj);
      });

      runtimeScene.getVariables().get('Result').setString('');
      runCompiledEvents(gdjs, runtimeScene, [objectLists]);

      expect(runtimeScene.getVariables().get('Result').getAsString()).toBe(
        '10,20,30,40,50,'
      );
    });

    it('can generate ForEach with orderBy descending, no limit', function () {
      const serializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::ForEach',
          object: 'MyObject',
          orderBy: 'MyObject.Variable(Score)',
          order: 'desc',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarSceneTxt' },
              parameters: [
                'Result',
                '+',
                'ToString(MyObject.Variable(Score)) + ","',
              ],
            },
          ],
          events: [],
        },
      ]);

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        serializerElement,
        {
          parameterTypes: { MyObject: 'object' },
          logCode: false,
        }
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const objectLists = new gdjs.Hashtable();
      const myObjects = [];
      objectLists.put('MyObject', myObjects);

      [30, 10, 50, 20, 40].forEach(score => {
        const obj = runtimeScene.createObject('MyObject');
        obj.getVariables().get('Score').setNumber(score);
        myObjects.push(obj);
      });

      runtimeScene.getVariables().get('Result').setString('');
      runCompiledEvents(gdjs, runtimeScene, [objectLists]);

      expect(runtimeScene.getVariables().get('Result').getAsString()).toBe(
        '50,40,30,20,10,'
      );
    });

    it('can generate ForEach with orderBy ascending and limit of 1', function () {
      const serializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::ForEach',
          object: 'MyObject',
          orderBy: 'MyObject.Variable(Score)',
          order: 'asc',
          limit: '1',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: ['PickedScore', '=', 'MyObject.Variable(Score)'],
            },
          ],
          events: [],
        },
      ]);

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        serializerElement,
        {
          parameterTypes: { MyObject: 'object' },
          logCode: false,
        }
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const objectLists = new gdjs.Hashtable();
      const myObjects = [];
      objectLists.put('MyObject', myObjects);

      [30, 10, 50, 20, 40].forEach(score => {
        const obj = runtimeScene.createObject('MyObject');
        obj.getVariables().get('Score').setNumber(score);
        myObjects.push(obj);
      });

      runCompiledEvents(gdjs, runtimeScene, [objectLists]);

      // Ascending with limit 1: picks the object with the lowest score (10)
      expect(runtimeScene.getVariables().get('PickedScore').getAsNumber()).toBe(10);
    });

    it('can generate ForEach with orderBy descending and limit of 1', function () {
      const serializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::ForEach',
          object: 'MyObject',
          orderBy: 'MyObject.Variable(Score)',
          order: 'desc',
          limit: '1',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: ['PickedScore', '=', 'MyObject.Variable(Score)'],
            },
          ],
          events: [],
        },
      ]);

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        serializerElement,
        {
          parameterTypes: { MyObject: 'object' },
          logCode: false,
        }
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const objectLists = new gdjs.Hashtable();
      const myObjects = [];
      objectLists.put('MyObject', myObjects);

      [30, 10, 50, 20, 40].forEach(score => {
        const obj = runtimeScene.createObject('MyObject');
        obj.getVariables().get('Score').setNumber(score);
        myObjects.push(obj);
      });

      runCompiledEvents(gdjs, runtimeScene, [objectLists]);

      // Descending with limit 1: picks the object with the highest score (50)
      expect(runtimeScene.getVariables().get('PickedScore').getAsNumber()).toBe(50);
    });

    it('can generate ForEach with orderBy ascending and limit of 2', function () {
      const serializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::ForEach',
          object: 'MyObject',
          orderBy: 'MyObject.Variable(Score)',
          order: 'asc',
          limit: '2',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: ['Sum', '+', 'MyObject.Variable(Score)'],
            },
          ],
          events: [],
        },
      ]);

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        serializerElement,
        {
          parameterTypes: { MyObject: 'object' },
          logCode: false,
        }
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const objectLists = new gdjs.Hashtable();
      const myObjects = [];
      objectLists.put('MyObject', myObjects);

      [30, 10, 50, 20, 40].forEach(score => {
        const obj = runtimeScene.createObject('MyObject');
        obj.getVariables().get('Score').setNumber(score);
        myObjects.push(obj);
      });

      runCompiledEvents(gdjs, runtimeScene, [objectLists]);

      // Ascending with limit 2: picks objects with scores 10 and 20
      expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(10 + 20);
    });

    it('can generate ForEach with orderBy descending and limit of 2', function () {
      const serializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::ForEach',
          object: 'MyObject',
          orderBy: 'MyObject.Variable(Score)',
          order: 'desc',
          limit: '2',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: ['Sum', '+', 'MyObject.Variable(Score)'],
            },
          ],
          events: [],
        },
      ]);

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        serializerElement,
        {
          parameterTypes: { MyObject: 'object' },
          logCode: false,
        }
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const objectLists = new gdjs.Hashtable();
      const myObjects = [];
      objectLists.put('MyObject', myObjects);

      [30, 10, 50, 20, 40].forEach(score => {
        const obj = runtimeScene.createObject('MyObject');
        obj.getVariables().get('Score').setNumber(score);
        myObjects.push(obj);
      });

      runCompiledEvents(gdjs, runtimeScene, [objectLists]);

      // Descending with limit 2: picks objects with scores 50 and 40
      expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(50 + 40);
    });
  });

  describe('ForEach with orderBy, local variables and loop index', () => {
    it('can generate ForEach with orderBy and local variables', function () {
      const serializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::ForEach',
          object: 'MyObject',
          orderBy: 'MyObject.Variable(Score)',
          order: 'asc',
          variables: [{ name: 'Multiplier', type: 'number', value: 10 }],
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: [
                'Sum',
                '+',
                'MyObject.Variable(Score) * Multiplier',
              ],
            },
          ],
          events: [],
        },
      ]);

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        serializerElement,
        {
          parameterTypes: { MyObject: 'object' },
          logCode: false,
        }
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const objectLists = new gdjs.Hashtable();
      const myObjects = [];
      objectLists.put('MyObject', myObjects);

      [30, 10, 20].forEach(score => {
        const obj = runtimeScene.createObject('MyObject');
        obj.getVariables().get('Score').setNumber(score);
        myObjects.push(obj);
      });

      runCompiledEvents(gdjs, runtimeScene, [objectLists]);

      expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(
        (10 + 20 + 30) * 10
      );
      expect(runtimeScene.getVariables().has('Multiplier')).toBe(false);
    });

    it('can generate ForEach with orderBy and loop index variable', function () {
      const serializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::ForEach',
          object: 'MyObject',
          orderBy: 'MyObject.Variable(Score)',
          order: 'asc',
          variables: [{ name: 'LoopIdx', type: 'number', value: 0 }],
          loopIndexVariable: 'LoopIdx',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: ['IndexSum', '+', 'LoopIdx'],
            },
            {
              type: { value: 'ModVarSceneTxt' },
              parameters: [
                'Result',
                '+',
                'ToString(LoopIdx) + ":" + ToString(MyObject.Variable(Score)) + ","',
              ],
            },
          ],
          events: [],
        },
      ]);

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        serializerElement,
        {
          parameterTypes: { MyObject: 'object' },
          logCode: false,
        }
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const objectLists = new gdjs.Hashtable();
      const myObjects = [];
      objectLists.put('MyObject', myObjects);

      [30, 10, 20].forEach(score => {
        const obj = runtimeScene.createObject('MyObject');
        obj.getVariables().get('Score').setNumber(score);
        myObjects.push(obj);
      });

      runtimeScene.getVariables().get('Result').setString('');
      runCompiledEvents(gdjs, runtimeScene, [objectLists]);

      // Ascending order: 10, 20, 30. Loop indices: 0, 1, 2
      expect(runtimeScene.getVariables().get('IndexSum').getAsNumber()).toBe(
        0 + 1 + 2
      );
      expect(runtimeScene.getVariables().get('Result').getAsString()).toBe(
        '0:10,1:20,2:30,'
      );
      expect(runtimeScene.getVariables().has('LoopIdx')).toBe(false);
    });
  });

  describe('3 nested ForEach with orderBy', () => {
    it('can generate 3 nested ForEach with orderBy using multiple objects and conditions', function () {
      const serializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::ForEach',
          object: 'ObjectA',
          orderBy: 'ObjectA.Variable(Priority)',
          order: 'asc',
          conditions: [],
          actions: [],
          events: [
            {
              type: 'BuiltinCommonInstructions::ForEach',
              object: 'ObjectB',
              orderBy: 'ObjectB.Variable(Priority)',
              order: 'desc',
              conditions: [],
              actions: [],
              events: [
                {
                  type: 'BuiltinCommonInstructions::ForEach',
                  object: 'ObjectC',
                  orderBy: 'ObjectC.Variable(Priority)',
                  order: 'asc',
                  limit: '1',
                  conditions: [],
                  actions: [
                    {
                      type: { value: 'ModVarSceneTxt' },
                      parameters: [
                        'Result',
                        '+',
                        'ToString(ObjectA.Variable(Priority)) + "-" + ToString(ObjectB.Variable(Priority)) + "-" + ToString(ObjectC.Variable(Priority)) + ","',
                      ],
                    },
                  ],
                  events: [],
                },
              ],
            },
          ],
        },
      ]);

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        serializerElement,
        {
          parameterTypes: {
            ObjectA: 'object',
            ObjectB: 'object',
            ObjectC: 'object',
          },
          logCode: false,
        }
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();

      const objectALists = new gdjs.Hashtable();
      const myObjectsA = [];
      objectALists.put('ObjectA', myObjectsA);
      [2, 1].forEach(p => {
        const obj = runtimeScene.createObject('ObjectA');
        obj.getVariables().get('Priority').setNumber(p);
        myObjectsA.push(obj);
      });

      const objectBLists = new gdjs.Hashtable();
      const myObjectsB = [];
      objectBLists.put('ObjectB', myObjectsB);
      [10, 30, 20].forEach(p => {
        const obj = runtimeScene.createObject('ObjectB');
        obj.getVariables().get('Priority').setNumber(p);
        myObjectsB.push(obj);
      });

      const objectCLists = new gdjs.Hashtable();
      const myObjectsC = [];
      objectCLists.put('ObjectC', myObjectsC);
      [300, 100, 200].forEach(p => {
        const obj = runtimeScene.createObject('ObjectC');
        obj.getVariables().get('Priority').setNumber(p);
        myObjectsC.push(obj);
      });

      runtimeScene.getVariables().get('Result').setString('');
      runCompiledEvents(gdjs, runtimeScene, [
        objectALists,
        objectBLists,
        objectCLists,
      ]);

      // ObjectA asc: 1, 2
      // ObjectB desc: 30, 20, 10
      // ObjectC asc limit 1: 100 (lowest)
      // Result: 1-30-100, 1-20-100, 1-10-100, 2-30-100, 2-20-100, 2-10-100
      expect(runtimeScene.getVariables().get('Result').getAsString()).toBe(
        '1-30-100,1-20-100,1-10-100,2-30-100,2-20-100,2-10-100,'
      );
    });
  });

  describe('3 nested ForEach with orderBy on a group', () => {
    it('can generate 3 nested ForEach with orderBy on a group then on objects of the group', function () {
      const serializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::ForEach',
          object: 'AllObjects',
          orderBy: 'AllObjects.Variable(Val)',
          order: 'asc',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: ['GroupSum', '+', 'AllObjects.Variable(Val)'],
            },
          ],
          events: [
            {
              type: 'BuiltinCommonInstructions::ForEach',
              object: 'TypeA',
              orderBy: 'TypeA.Variable(Val)',
              order: 'desc',
              conditions: [],
              actions: [
                {
                  type: { value: 'ModVarScene' },
                  parameters: [
                    'TypeASum',
                    '+',
                    'TypeA.Variable(Val)',
                  ],
                },
              ],
              events: [
                {
                  type: 'BuiltinCommonInstructions::ForEach',
                  object: 'TypeB',
                  orderBy: 'TypeB.Variable(Val)',
                  order: 'asc',
                  limit: '1',
                  conditions: [],
                  actions: [
                    {
                      type: { value: 'ModVarScene' },
                      parameters: [
                        'TypeBSum',
                        '+',
                        'TypeB.Variable(Val)',
                      ],
                    },
                  ],
                  events: [],
                },
              ],
            },
          ],
        },
      ]);

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        serializerElement,
        {
          parameterTypes: {
            TypeA: 'object',
            TypeB: 'object',
          },
          groups: {
            AllObjects: ['TypeA', 'TypeB'],
          },
          logCode: false,
        }
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();

      const typeALists = new gdjs.Hashtable();
      const typeAObjects = [];
      typeALists.put('TypeA', typeAObjects);
      [30, 10].forEach(v => {
        const obj = runtimeScene.createObject('TypeA');
        obj.getVariables().get('Val').setNumber(v);
        typeAObjects.push(obj);
      });

      const typeBLists = new gdjs.Hashtable();
      const typeBObjects = [];
      typeBLists.put('TypeB', typeBObjects);
      [20, 5].forEach(v => {
        const obj = runtimeScene.createObject('TypeB');
        obj.getVariables().get('Val').setNumber(v);
        typeBObjects.push(obj);
      });

      runCompiledEvents(gdjs, runtimeScene, [typeALists, typeBLists]);

      // AllObjects group (TypeA + TypeB) sorted asc by Val:
      // 5 (TypeB), 10 (TypeA), 20 (TypeB), 30 (TypeA) -> sum = 5+10+20+30 = 65
      expect(runtimeScene.getVariables().get('GroupSum').getAsNumber()).toBe(65);

      // For each iteration of the outer loop, the inner ForEach on TypeA (desc)
      // iterates over all TypeA instances (30, 10) -> that's 2 per outer iteration.
      // 4 outer iterations * 2 = 8 inner iterations, each adds a TypeA Val.
      // TypeA desc: 30, 10 each time. Sum per outer iteration = 30+10 = 40.
      // 4 * 40 = 160.
      expect(runtimeScene.getVariables().get('TypeASum').getAsNumber()).toBe(160);

      // For each inner TypeA iteration, the innermost ForEach on TypeB (asc, limit 1)
      // picks the TypeB with the lowest Val = 5.
      // 4 outer * 2 TypeA = 8 innermost iterations, each adds 5.
      // 8 * 5 = 40.
      expect(runtimeScene.getVariables().get('TypeBSum').getAsNumber()).toBe(40);
    });
  });
});
