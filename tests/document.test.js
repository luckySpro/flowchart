import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateDocument} from '../src/document.js';
import {preset,scenes} from '../src/catalog.js';
test('all five presets have valid references and survive JSON roundtrip',()=>{
  for(const s of scenes){const p=preset(s.id);const doc={schema:1,title:s.title,scene:s.id,graph:{cells:[...p.nodes.map(n=>({id:n.key,shape:'studio-node',position:{x:n.x,y:n.y},size:{width:n.width||190,height:n.height||88},data:{kind:n.kind,label:n.label,subtitle:n.subtitle,color:n.color}})),...p.edges.map((e,i)=>({id:'edge'+i,shape:'studio-edge',source:{cell:e.from},target:{cell:e.to},data:{label:e.label,dash:!!e.dash}}))]}};assert.equal(validateDocument(JSON.parse(JSON.stringify(doc))).scene,s.id);}
});
test('rejects renderer injection, duplicate ids, invalid dimensions and broken edges',()=>{
  const node={id:'a',shape:'studio-node',position:{x:0,y:0},size:{width:190,height:88},data:{kind:'service',label:'服务',subtitle:'说明',color:'blue'}};
  const wrap=cells=>({schema:1,title:'test',scene:'architecture',graph:{cells}});
  for(const cells of [[{...node,markup:[]}],[node,node],[{...node,size:{width:-1,height:80}}],[node,{id:'e',shape:'studio-edge',source:{cell:'a'},target:{cell:'missing'}}]])assert.throws(()=>validateDocument(wrap(cells)));
  assert.throws(()=>validateDocument({...wrap([]),schema:2}));
});
