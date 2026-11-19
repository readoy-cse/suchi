import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';
const input='C:/Users/readoy/Desktop/my_Learning/suchi/Docs/Suchi_Proposal_Presentation.pptx';
const deck=await PresentationFile.importPptx(await FileBlob.load(input));
const out=await deck.inspect({kind:'slide,textbox,shape,image,notes',maxChars:50000});
console.log(out.ndjson);
const png=await deck.export({slide:deck.slides.getItem(4),format:'png',scale:1});
await fs.writeFile('C:/Users/readoy/Desktop/my_Learning/suchi/.suchi-team-edit-build/slide5-before.png',new Uint8Array(await png.arrayBuffer()));
