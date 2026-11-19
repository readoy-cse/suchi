import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';

const root='C:/Users/readoy/Desktop/my_Learning/suchi';
const skill='C:/Users/readoy/.codex/plugins/cache/openai-primary-runtime/presentations/26.1116.12020/skills/presentations';
const runtime='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1116-1220-0_26.1116.1220.0_x64__3k8sg7r9htsxt/dependencies';
process.env.RUNTIME_NODE_MODULES=`${runtime}/node/node_modules`;
const build=path.join(root,'.suchi-presentation-build');
const source=path.join(root,'Docs/Suchi_Proposal_V2_Updated.pptx');
const output=path.join(root,'Docs/Suchi_Proposal_V14.pptx');
const draft=path.join(build,'text-layout-team-draft.pptx');
const imageDir=path.join(root,'Docs/team members');
const deck=await PresentationFile.importPptx(await FileBlob.load(source));
if(deck.slides.items.length!==6)throw new Error(`Expected 6 slides, found ${deck.slides.items.length}`);
const slide=deck.slides.getItem(4);
for(const item of [...slide.shapes.items])item.delete();
for(const item of [...slide.images.items])item.delete();
slide.background.fill='#F7F5EF';

const C={ink:'#12352E',green:'#245C4B',rust:'#B75A3B',muted:'#566A63',line:'#D7DFD8',white:'#FFFFFF'};
function shape(g,x,y,w,h,fill='none',stroke='none',sw=0,radius){const o={geometry:g,position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width:sw}};if(radius!==undefined)o.borderRadius=radius;return slide.shapes.add(o);}
function text(value,x,y,w,h,o={}){const s=shape('textbox',x,y,w,h);s.text=value;s.text.style={fontFamily:o.font??'Calibri',fontSize:o.size??'16pt',bold:o.bold??false,color:o.color??C.ink,alignment:o.align??'left',verticalAlignment:'middle',wrap:true};return s;}

text('The People Behind Suchi',72,42,1136,58,{font:'Cambria',size:'34pt',bold:true,color:C.ink});
text('FIVE CONTRIBUTORS  /  ONE SHARED PRODUCT',74,103,820,22,{size:'10pt',bold:true,color:C.rust});
shape('rect',72,132,1136,2,C.line);

const people=[
 {name:'Sakib',id:'2252091102',role:'System Architect',file:'Sakib-2252091102.jpg',crop:{left:319,top:420,width:1000,height:1000}},
 {name:'Nahian',id:'2252091086',role:'Frontend Development',file:'nahian-2252091086.jpeg',crop:{left:338,top:120,width:1000,height:1000}},
 {name:'Taki',id:'2252091103',role:'Backend Integration',file:'Taki-2252091103.jpeg',crop:{left:127,top:0,width:1000,height:1000}},
 {name:'Salman',id:'2252091115',role:'Deployment & Security',file:'Salman-2252091115.jpeg',crop:{left:57,top:0,width:1000,height:1000}},
 {name:'Munayeem',id:'2252091116',role:'Software Quality Assurance',file:'munayeem-2252091116.PNG',crop:{left:177,top:0,width:900,height:900}},
];
// Preserve the approved featured-left + 2x2-right layout. Only the profile orientation changes.
shape('roundRect',72,150,1136,470,'none',C.line,1.2,18);
const hero=people[0];
const heroOriginal=await fs.readFile(path.join(imageDir,hero.file));
const heroCrop=await sharp(heroOriginal).extract(hero.crop).jpeg({quality:94}).toBuffer();
const heroBytes=heroCrop.buffer.slice(heroCrop.byteOffset,heroCrop.byteOffset+heroCrop.byteLength);
shape('roundRect',91,169,242,432,'#E8EEE9',C.line,1,15);
shape('roundRect',91,169,5,432,C.green,'none',0,2);
shape('roundRect',279,190,37,22,C.rust,'none',0,7);
text('01',279,191,37,20,{size:'9pt',bold:true,color:C.white,align:'center'});
text('FEATURED PROFILE',108,191,150,20,{size:'9pt',bold:true,color:C.green});
// Sakib's name, role, and ID sit below the centered portrait.
shape('roundRect',131,229,162,162,C.white,C.line,1,12);
slide.images.add({blob:heroBytes,contentType:'image/jpeg',alt:`${hero.name}, student ID ${hero.id}`,fit:'cover',geometry:'roundRect',borderRadius:9,position:{left:137,top:235,width:150,height:150}});
text(hero.name,111,401,204,36,{font:'Cambria',size:'22pt',bold:true,color:C.ink});
shape('rect',111,443,34,3,C.rust);
text(hero.role,111,455,204,28,{size:'14pt',bold:true,color:C.green});
text(`ID  ${hero.id}`,111,496,204,20,{size:'10pt',color:C.muted});
const sideMembers=people.slice(1);
const cards=[{x:351,y:162},{x:780,y:162},{x:351,y:392},{x:780,y:392}];
for(let i=0;i<sideMembers.length;i++){
 const m=sideMembers[i],card=cards[i],cw=409,ch=212;
 const original=await fs.readFile(path.join(imageDir,m.file));
 const crop=await sharp(original).extract(m.crop).jpeg({quality:94}).toBuffer();
 const bytes=crop.buffer.slice(crop.byteOffset,crop.byteOffset+crop.byteLength);
 // Same card palette and finish; portraits stay left while all member details read in a clear left-aligned column.
 shape('roundRect',card.x,card.y,cw,ch,'#E8EEE9',C.line,1,14);
 shape('roundRect',card.x,card.y,5,ch,C.green,'none',0,2);
 shape('roundRect',card.x+cw-54,card.y+10,38,22,C.rust,'none',0,7);
 text(String(i+2).padStart(2,'0'),card.x+cw-54,card.y+11,38,20,{size:'9pt',bold:true,color:C.white,align:'center'});
 shape('roundRect',card.x+15,card.y+45,122,122,C.white,C.line,1,11);
 slide.images.add({blob:bytes,contentType:'image/jpeg',alt:`${m.name}, student ID ${m.id}`,fit:'cover',geometry:'roundRect',borderRadius:8,position:{left:card.x+21,top:card.y+51,width:110,height:110}});
 const tx=card.x+155,tw=cw-174;
 text(m.name,tx,card.y+39,tw,31,{font:'Cambria',size:'19pt',bold:true,color:C.ink});
 shape('rect',tx,card.y+77,32,3,C.rust);
 const role=m.role==='Software Quality Assurance'?'Software Quality\nAssurance':m.role;
 text(role,tx,card.y+89,tw,49,{size:'12pt',bold:true,color:C.green});
 text(`ID  ${m.id}`,tx,card.y+163,tw,20,{size:'10pt',color:C.muted});
}
slide.speakerNotes.text='Team members in order: Sakib, Nahian, Taki, Salman, and Munayeem. Square portraits use lightly rounded corners. Each memberâ€™s role and student ID are listed beneath the photo.';

await fs.mkdir(build,{recursive:true});
const preview=await deck.export({slide,format:'png',scale:1});
await fs.writeFile(path.join(build,'text-layout-team-preview.png'),new Uint8Array(await preview.arrayBuffer()));
await (await PresentationFile.exportPptx(deck)).save(draft);
const {finalizePresentation}=await import(new URL(`file:///${path.join(skill,'container_tools/artifact_tool_utils.mjs').replaceAll('\\','/')}`).href);
const result=await finalizePresentation({explicitTotalSlideCount:6,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],workspaceDir:root,candidatePath:draft,finalPath:output,
 pythonExecutable:`${runtime}/python/python.exe`,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Arial','Calibri','Cambria']},verifyArtifactToolImport:true,receiptPath:path.join(build,'validation-text-layout-v14.json')});
console.log(JSON.stringify({output,result},null,2));

