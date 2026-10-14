// This module builds structured SVG table markup independent of the GUI state.
export function entityPresentation(fields,width,tint,color,label,iconPath){
  const markup=[{tagName:'rect',selector:'body'},{tagName:'rect',selector:'iconBg'},{tagName:'path',selector:'icon'},{tagName:'text',selector:'title'},{tagName:'path',selector:'tableLines'}];
  const text=(value,x,y,fill='#5d6c81',size=11)=>({text:value,x,y,refX:0,refY:0,textAnchor:'start',textVerticalAnchor:'middle',fontSize:size,fontFamily:'ui-monospace, SFMono-Regular, monospace',fill});
  const typeX=Math.round(width*.61);
  const attrs={body:{rx:10,ry:10,fill:'#fff',stroke:'#dfe5ef',strokeWidth:1},iconBg:{fill:tint},icon:{d:iconPath,stroke:color},title:{text:label},tableLines:{d:`M0 48H${width}M0 74H${width}M36 48V${84+fields.length*26}M${typeX-8} 48V${84+fields.length*26}`,stroke:'#e9edf4',fill:'none'}};
  for(const [selector,value,x] of [['headKey','键',8],['headName','字段名',44],['headType','类型',typeX]]){markup.push({tagName:'text',selector});attrs[selector]=text(value,x,61,'#96a1b1',10);}
  fields.forEach((field,i)=>{const y=88+i*26;for(const [selector,value,x,fill,wrapWidth] of [[`key${i}`,field.key,8,field.key==='PK'?'#b08a36':color,26],[`name${i}`,field.name,44,'#4d5c71',typeX-57],[`type${i}`,field.type+(field.nullable?' ?':''),typeX,'#8c99ac',width-typeX-10]]){markup.push({tagName:'text',selector});attrs[selector]={...text(value,x,y,fill),textWrap:{text:value,width:wrapWidth,height:24,ellipsis:true}};}
    markup.push({tagName:'path',selector:`row${i}`});attrs[`row${i}`]={d:`M0 ${101+i*26}H${width}`,stroke:'#edf0f5',fill:'none'};
  });return {markup,attrs,height:84+fields.length*26};
}
