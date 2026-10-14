// Conventional flowchart geometry. Original SVG paths; no copied stencil assets.
export const flowPalette = [
  ['terminal','开始 / 结束','流程入口与出口'],['process','处理步骤','执行一项操作'],
  ['decision','条件判断','根据条件分支'],['io','输入 / 输出','数据输入或输出'],
  ['subprocess','预定义过程','调用已定义的子流程'],['document','文档','产生或读取文档'],
  ['multidocument','多份文档','多个文档集合'],['database','数据库','持久化数据存储'],
  ['stored-data','存储数据','保留的数据'],['manual-input','手动输入','人工录入信息'],
  ['manual-operation','手动操作','人工执行步骤'],['preparation','准备 / 初始化','初始化执行条件'],
  ['delay','延迟 / 等待','等待事件或指定时间'],['display','显示输出','屏幕显示信息'],
  ['connector','页内连接符','同页流程跳转'],['offpage','跨页连接符','连接到另一页'],
  ['annotation','注释','补充说明与解释'],['merge','合并','汇合多条处理路径'],
];
const flowKinds=new Set(flowPalette.map(p=>p[0]));
export const isSymbol = kind => flowKinds.has(kind)||['usecase','note','package','relationship','state','initialstate','finalstate','lifeline','fork','actor'].includes(kind);
export function symbolGeometry(kind,w=190,h=88){
  let body='',detail='';const x=n=>w*n,y=n=>h*n;
  switch(kind){
    case 'terminal':body=`M${h/2} 0H${w-h/2}A${h/2} ${h/2} 0 0 1 ${w-h/2} ${h}H${h/2}A${h/2} ${h/2} 0 0 1 ${h/2} 0Z`;break;
    case 'decision':case 'relationship':body=`M${w/2} 0L${w} ${h/2}L${w/2} ${h}L0 ${h/2}Z`;break;
    case 'io':body=`M${x(.16)} 0H${w}L${x(.84)} ${h}H0Z`;break;
    case 'subprocess':body=`M0 0H${w}V${h}H0Z`;detail=`M${x(.1)} 0V${h}M${x(.9)} 0V${h}`;break;
    case 'document':case 'multidocument':body=`M0 ${y(.08)}H${x(.9)}V${y(.82)}C${x(.62)} ${y(.6)},${x(.35)} ${h},0 ${y(.82)}Z`;if(kind==='multidocument')detail=`M${x(.06)} ${y(.04)}H${x(.95)}V${y(.77)}M${x(.12)} 0H${w}V${y(.7)}`;break;
    case 'manual-input':body=`M0 ${y(.25)}L${w} 0V${h}H0Z`;break;
    case 'manual-operation':body=`M0 0H${w}L${x(.8)} ${h}H${x(.2)}Z`;break;
    case 'preparation':body=`M${x(.15)} 0H${x(.85)}L${w} ${h/2}L${x(.85)} ${h}H${x(.15)}L0 ${h/2}Z`;break;
    case 'delay':body=`M0 0H${x(.65)}C${w} 0,${w} ${h},${x(.65)} ${h}H0Z`;break;
    case 'finalstate':detail=`M${x(.13)} ${h/2}A${x(.37)} ${y(.37)} 0 1 0 ${x(.87)} ${h/2}A${x(.37)} ${y(.37)} 0 1 0 ${x(.13)} ${h/2}Z`;
    case 'connector':case 'usecase':case 'initialstate':body=`M0 ${h/2}A${w/2} ${h/2} 0 1 0 ${w} ${h/2}A${w/2} ${h/2} 0 1 0 0 ${h/2}Z`;break;
    case 'lifeline':body=`M0 0H${w}V${y(.22)}H0Z`;detail=`M${w/2} ${y(.22)}V${h}`;break;
    case 'fork':body=`M0 ${y(.42)}H${w}V${y(.58)}H0Z`;break;
    case 'actor':body=`M${w/2-x(.12)} ${y(.18)}A${x(.12)} ${y(.15)} 0 1 0 ${w/2+x(.12)} ${y(.18)}A${x(.12)} ${y(.15)} 0 1 0 ${w/2-x(.12)} ${y(.18)}Z`;detail=`M${w/2} ${y(.34)}V${y(.7)}M${x(.2)} ${y(.46)}H${x(.8)}M${w/2} ${y(.7)}L${x(.25)} ${y(.78)}M${w/2} ${y(.7)}L${x(.75)} ${y(.78)}`;break;
    case 'offpage':body=`M0 0H${w}V${y(.65)}L${w/2} ${h}L0 ${y(.65)}Z`;break;
    case 'database':body=`M0 ${y(.16)}C0 ${y(-.06)},${w} ${y(-.06)},${w} ${y(.16)}V${y(.84)}C${w} ${y(1.05)},0 ${y(1.05)},0 ${y(.84)}Z`;detail=`M0 ${y(.16)}C0 ${y(.38)},${w} ${y(.38)},${w} ${y(.16)}M0 ${y(.75)}C0 ${y(.97)},${w} ${y(.97)},${w} ${y(.75)}`;break;
    case 'stored-data':body=`M${x(.12)} 0H${w}C${x(.8)} ${y(.2)},${x(.8)} ${y(.8)},${w} ${h}H${x(.12)}C${x(-.04)} ${y(.8)},${x(-.04)} ${y(.2)},${x(.12)} 0Z`;break;
    case 'display':body=`M${x(.17)} 0H${x(.78)}C${w} 0,${w} ${h},${x(.78)} ${h}H${x(.17)}L0 ${h/2}Z`;break;
    case 'annotation':body=`M${x(.22)} 0H0V${h}H${x(.22)}`;break;
    case 'merge':body=`M0 0H${w}L${w/2} ${h}Z`;break;
    case 'note':body=`M0 0H${x(.8)}L${w} ${y(.25)}V${h}H0Z`;detail=`M${x(.8)} 0V${y(.25)}H${w}`;break;
    case 'package':body=`M0 ${y(.2)}V0H${x(.4)}V${y(.2)}H${w}V${h}H0Z`;detail=`M0 ${y(.2)}H${x(.4)}`;break;
    default:body=`M0 0H${w}V${h}H0Z`;
  }return {body,detail};
}
export function symbolPreview(kind){const g=symbolGeometry(kind,100,60);return `<svg class="symbol-preview" viewBox="-3 -3 106 66" aria-hidden="true"><path d="${g.body}" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="${g.detail}" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`;}
