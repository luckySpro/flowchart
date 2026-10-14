import {test} from 'node:test';
import assert from 'node:assert/strict';
import {legacyFields,validateFields} from '../src/fields.js';
import {entityPresentation} from '../src/er-editor.js';
import {scenes,kindIcons,kindPaths} from '../src/catalog.js';
import {isSymbol,symbolGeometry} from '../src/symbols.js';
test('legacy ER text migrates to structured fields without dropping constraints',()=>{
  const fields=legacyFields('PK id UUID\nFK user_id UUID\n name VARCHAR(255)');
  validateFields(fields);assert.equal(fields[0].nullable,false);assert.equal(fields[1].key,'FK');assert.equal(fields[2].type,'VARCHAR(255)');
  assert.deepEqual(JSON.parse(JSON.stringify(fields)),fields);
});
test('field validation rejects duplicate names and nullable primary keys',()=>{
  const fields=legacyFields('PK id UUID\n name VARCHAR');
  assert.throws(()=>validateFields([...fields,{...fields[0],name:'ID'}]));
  assert.throws(()=>validateFields([{...fields[0],nullable:true}]));
  assert.throws(()=>validateFields([{...fields[0],type:''}]));
});
test('ER renderer emits individual table cells and separators',()=>{
  const fields=legacyFields('PK id UUID\n name VARCHAR');const table=entityPresentation(fields,270,'#fff','#555','users','');
  assert.equal(table.attrs.name0.text,'id');assert.equal(table.attrs.type1.text,'VARCHAR ?');assert.equal(table.height,136);
  assert.ok(table.markup.some(m=>m.selector==='row1'));
});
test('every library item has an icon or actual symbol geometry',()=>{
  for(const scene of scenes)for(const [kind] of scene.palette){assert.ok(kindIcons[kind],kind);if(isSymbol(kind))assert.ok(symbolGeometry(kind).body,kind);else assert.ok(kindPaths[kind],kind);}
  assert.equal(scenes.find(s=>s.id==='flow').palette.length,18);
});
