import {isEntity,validateFields} from './fields.js';
import {knownKinds} from './catalog.js';
export const PRODUCT={name:'序图',english:'Diagram Studio',version:'0.1.0',organization:'M&J Group',email:'473276@qq.com',schema:1};
export function validateDocument(doc){
  if(!doc||doc.schema!==1||!Array.isArray(doc.graph?.cells)||doc.graph.cells.length>2000)throw new Error('文件格式不正确，或包含超过 2000 个图形');
  if(!['architecture','flow','uml','er','network'].includes(doc.scene)||typeof doc.title!=='string'||doc.title.length>120)throw new Error('不支持的场景或标题');
  const ids=new Set();
  for(const c of doc.graph.cells){
    if(typeof c.id!=='string'||ids.has(c.id))throw new Error('图形 ID 缺失或重复');ids.add(c.id);
    if(!['studio-node','studio-edge'].includes(c.shape))throw new Error('文件包含不支持的图形');
    if(c.shape==='studio-node'&&(!Number.isFinite(c.position?.x)||!Number.isFinite(c.position?.y)||!Number.isFinite(c.size?.width)||!Number.isFinite(c.size?.height)||c.size.width<40||c.size.width>2000||c.size.height<40||c.size.height>2000))throw new Error('图形位置或尺寸无效');
    // Imported SVG markup, images, and arbitrary DOM attrs are never passed to the renderer.
    if(c.markup||c.attrs||c.tools)throw new Error('文件包含不允许的渲染属性');
    if(c.shape==='studio-node'&&(!c.data||typeof c.data.label!=='string'||c.data.label.length>100||typeof c.data.subtitle!=='string'||c.data.subtitle.length>1000||!knownKinds.has(c.data.kind)||!['blue','purple','green','orange'].includes(c.data.color)))throw new Error('节点内容或类型无效');
    if(c.shape==='studio-node'&&isEntity(c.data.kind)&&c.data.fields!==undefined)validateFields(c.data.fields);
    if(c.shape==='studio-edge'&&((c.data?.label!==undefined&&(typeof c.data.label!=='string'||c.data.label.length>100))||(c.vertices!==undefined&&(!Array.isArray(c.vertices)||c.vertices.length>200||c.vertices.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y))))))throw new Error('连线内容或路径无效');
  }
  for(const c of doc.graph.cells.filter(c=>c.shape==='studio-edge'))if(!ids.has(c.source?.cell)||!ids.has(c.target?.cell))throw new Error('连线引用了不存在的节点');
  return doc;
}
