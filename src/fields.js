export const isEntity = kind => ['entity','view'].includes(kind);
export function legacyFields(text){
  if(!text?.trim())return [{name:'id',type:'UUID',key:'PK',nullable:false},{name:'name',type:'VARCHAR',key:'',nullable:true}];
  return text.split('\n').filter(s=>s.trim()).slice(0,50).map(line=>{
    const words=line.trim().replace(/^\+\s*/,'').split(/\s+/),key=['PK','FK'].includes(words[0])?words.shift():'';
    return {name:words.shift()?.replace(/:$/,'')||'field',type:words.join(' ')||'VARCHAR',key,nullable:key!=='PK'};
  });
}
export function validateFields(fields){
  if(!Array.isArray(fields)||fields.length>50)throw new Error('每张表最多 50 个字段');
  const names=new Set();
  for(const f of fields){
    if(typeof f.name!=='string'||!f.name.trim()||f.name.length>64||names.has(f.name.trim().toLowerCase()))throw new Error('字段名不能为空或重复，最长 64 字符');
    if(typeof f.type!=='string'||!f.type.trim()||f.type.length>48||!['','PK','FK'].includes(f.key)||typeof f.nullable!=='boolean'||(f.key==='PK'&&f.nullable))throw new Error('字段类型或约束无效；主键不能为空');
    names.add(f.name.trim().toLowerCase());
  }return fields;
}
