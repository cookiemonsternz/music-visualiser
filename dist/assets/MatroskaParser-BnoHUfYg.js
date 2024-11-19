import{c as e,E as a,a as n,t,v as i,S as r,w as s,m as l,B as o,x as m,T as u}from"./index-pBuBQYRc.js";var c;!function(e){e[e.string=0]="string",e[e.uint=1]="uint",e[e.uid=2]="uid",e[e.bool=3]="bool",e[e.binary=4]="binary",e[e.float=5]="float"}(c||(c={}));const d={name:"dtd",container:{440786851:{name:"ebml",container:{17030:{name:"ebmlVersion",value:c.uint},17143:{name:"ebmlReadVersion",value:c.uint},17138:{name:"ebmlMaxIDWidth",value:c.uint},17139:{name:"ebmlMaxSizeWidth",value:c.uint},17026:{name:"docType",value:c.string},17031:{name:"docTypeVersion",value:c.uint},17029:{name:"docTypeReadVersion",value:c.uint}}},408125543:{name:"segment",container:{290298740:{name:"seekHead",container:{19899:{name:"seek",multiple:!0,container:{21419:{name:"id",value:c.binary},21420:{name:"position",value:c.uint}}}}},357149030:{name:"info",container:{29604:{name:"uid",value:c.uid},29572:{name:"filename",value:c.string},3979555:{name:"prevUID",value:c.uid},3965867:{name:"prevFilename",value:c.string},4110627:{name:"nextUID",value:c.uid},4096955:{name:"nextFilename",value:c.string},2807729:{name:"timecodeScale",value:c.uint},17545:{name:"duration",value:c.float},17505:{name:"dateUTC",value:c.uint},31657:{name:"title",value:c.string},19840:{name:"muxingApp",value:c.string},22337:{name:"writingApp",value:c.string}}},524531317:{name:"cluster",multiple:!0,container:{231:{name:"timecode",value:c.uid},22743:{name:"silentTracks ",multiple:!0},167:{name:"position",value:c.uid},171:{name:"prevSize",value:c.uid},160:{name:"blockGroup"},163:{name:"simpleBlock"}}},374648427:{name:"tracks",container:{174:{name:"entries",multiple:!0,container:{215:{name:"trackNumber",value:c.uint},29637:{name:"uid",value:c.uid},131:{name:"trackType",value:c.uint},185:{name:"flagEnabled",value:c.bool},136:{name:"flagDefault",value:c.bool},21930:{name:"flagForced",value:c.bool},156:{name:"flagLacing",value:c.bool},28135:{name:"minCache",value:c.uint},28136:{name:"maxCache",value:c.uint},2352003:{name:"defaultDuration",value:c.uint},2306383:{name:"timecodeScale",value:c.float},21358:{name:"name",value:c.string},2274716:{name:"language",value:c.string},134:{name:"codecID",value:c.string},25506:{name:"codecPrivate",value:c.binary},2459272:{name:"codecName",value:c.string},3839639:{name:"codecSettings",value:c.string},3883072:{name:"codecInfoUrl",value:c.string},2536e3:{name:"codecDownloadUrl",value:c.string},170:{name:"codecDecodeAll",value:c.bool},28587:{name:"trackOverlay",value:c.uint},224:{name:"video",container:{154:{name:"flagInterlaced",value:c.bool},21432:{name:"stereoMode",value:c.uint},176:{name:"pixelWidth",value:c.uint},186:{name:"pixelHeight",value:c.uint},21680:{name:"displayWidth",value:c.uint},21690:{name:"displayHeight",value:c.uint},21683:{name:"aspectRatioType",value:c.uint},3061028:{name:"colourSpace",value:c.uint},3126563:{name:"gammaValue",value:c.float}}},225:{name:"audio",container:{181:{name:"samplingFrequency",value:c.float},30901:{name:"outputSamplingFrequency",value:c.float},159:{name:"channels",value:c.uint},148:{name:"channels",value:c.uint},32123:{name:"channelPositions",value:c.binary},25188:{name:"bitDepth",value:c.uint}}},28032:{name:"contentEncodings",container:{25152:{name:"contentEncoding",container:{20529:{name:"order",value:c.uint},20530:{name:"scope",value:c.bool},20531:{name:"type",value:c.uint},20532:{name:"contentEncoding",container:{16980:{name:"contentCompAlgo",value:c.uint},16981:{name:"contentCompSettings",value:c.binary}}},20533:{name:"contentEncoding",container:{18401:{name:"contentEncAlgo",value:c.uint},18402:{name:"contentEncKeyID",value:c.binary},18403:{name:"contentSignature ",value:c.binary},18404:{name:"ContentSigKeyID  ",value:c.binary},18405:{name:"contentSigAlgo ",value:c.uint},18406:{name:"contentSigHashAlgo ",value:c.uint}}},25188:{name:"bitDepth",value:c.uint}}}}}}}}},475249515:{name:"cues",container:{187:{name:"cuePoint",container:{179:{name:"cueTime",value:c.uid},183:{name:"positions",container:{247:{name:"track",value:c.uint},241:{name:"clusterPosition",value:c.uint},21368:{name:"blockNumber",value:c.uint},234:{name:"codecState",value:c.uint},219:{name:"reference",container:{150:{name:"time",value:c.uint},151:{name:"cluster",value:c.uint},21343:{name:"number",value:c.uint},235:{name:"codecState",value:c.uint}}},240:{name:"relativePosition",value:c.uint}}}}}}},423732329:{name:"attachments",container:{24999:{name:"attachedFiles",multiple:!0,container:{18046:{name:"description",value:c.string},18030:{name:"name",value:c.string},18016:{name:"mimeType",value:c.string},18012:{name:"data",value:c.binary},18094:{name:"uid",value:c.uid}}}}},272869232:{name:"chapters",container:{17849:{name:"editionEntry",container:{182:{name:"chapterAtom",container:{29636:{name:"uid",value:c.uid},145:{name:"timeStart",value:c.uint},146:{name:"timeEnd",value:c.uid},152:{name:"hidden",value:c.bool},17816:{name:"enabled",value:c.uid},143:{name:"track",container:{137:{name:"trackNumber",value:c.uid},128:{name:"display",container:{133:{name:"string",value:c.string},17276:{name:"language ",value:c.string},17278:{name:"country ",value:c.string}}}}}}}}}}},307544935:{name:"tags",container:{29555:{name:"tag",multiple:!0,container:{25536:{name:"target",container:{25541:{name:"tagTrackUID",value:c.uid},25540:{name:"tagChapterUID",value:c.uint},25542:{name:"tagAttachmentUID",value:c.uid},25546:{name:"targetType",value:c.string},26826:{name:"targetTypeValue",value:c.uint},25545:{name:"tagEditionUID",value:c.uid}}},26568:{name:"simpleTags",multiple:!0,container:{17827:{name:"name",value:c.string},17543:{name:"string",value:c.string},17541:{name:"binary",value:c.binary},17530:{name:"language",value:c.string},17531:{name:"languageIETF",value:c.string},17540:{name:"default",value:c.bool}}}}}}}}}}},g=e("music-metadata:parser:ebml");class EbmlContentError extends(l("EBML")){}var p;!function(e){e[e.ReadNext=0]="ReadNext",e[e.IgnoreElement=2]="IgnoreElement",e[e.SkipSiblings=3]="SkipSiblings",e[e.TerminateParsing=4]="TerminateParsing",e[e.SkipElement=5]="SkipElement"}(p||(p={}));class EbmlIterator{constructor(e){this.tokenizer=e,this.padding=0,this.parserMap=new Map,this.ebmlMaxIDLength=4,this.ebmlMaxSizeLength=8,this.parserMap.set(c.uint,(e=>this.readUint(e))),this.parserMap.set(c.string,(e=>this.readString(e))),this.parserMap.set(c.binary,(e=>this.readBuffer(e))),this.parserMap.set(c.uid,(async e=>this.readBuffer(e))),this.parserMap.set(c.bool,(e=>this.readFlag(e))),this.parserMap.set(c.float,(e=>this.readFloat(e)))}async iterate(e,a,n){return this.parseContainer(linkParents(e),a,n)}async parseContainer(e,n,t){const i={};for(;this.tokenizer.position<n;){let s;const l=this.tokenizer.position;try{s=await this.readElement()}catch(r){if(r instanceof a)break;throw r}const o=e.container[s.id];if(o){switch(t.startNext(o)){case p.ReadNext:if(s.id,g(`Read element: name=${getElementPath(o)}{id=0x${s.id.toString(16)}, container=${!!o.container}} at position=${l}`),o.container){const e=await this.parseContainer(o,s.len>=0?this.tokenizer.position+s.len:-1,t);o.multiple?(i[o.name]||(i[o.name]=[]),i[o.name].push(e)):i[o.name]=e,await t.elementValue(o,e,l)}else{const e=this.parserMap.get(o.value);if("function"==typeof e){const a=await e(s);i[o.name]=a,await t.elementValue(o,a,l)}}break;case p.SkipElement:g(`Go to next element: name=${getElementPath(o)}, element.id=0x${s.id}, container=${!!o.container} at position=${l}`);break;case p.IgnoreElement:g(`Ignore element: name=${getElementPath(o)}, element.id=0x${s.id}, container=${!!o.container} at position=${l}`),await this.tokenizer.ignore(s.len);break;case p.SkipSiblings:g(`Ignore remaining container, at: name=${getElementPath(o)}, element.id=0x${s.id}, container=${!!o.container} at position=${l}`),await this.tokenizer.ignore(n-this.tokenizer.position);break;case p.TerminateParsing:return g(`Terminate parsing at element: name=${getElementPath(o)}, element.id=0x${s.id}, container=${!!o.container} at position=${l}`),i}}else if(236===s.id)this.padding+=s.len,await this.tokenizer.ignore(s.len);else g(`parseEbml: parent=${getElementPath(e)}, unknown child: id=${s.id.toString(16)} at position=${l}`),this.padding+=s.len,await this.tokenizer.ignore(s.len)}return i}async readVintData(e){const a=await this.tokenizer.peekNumber(n);let t=128,i=1;for(;!(a&t);){if(i>e)throw new EbmlContentError("VINT value exceeding maximum size");++i,t>>=1}const r=new Uint8Array(i);return await this.tokenizer.readBuffer(r),r}async readElement(){const e=await this.readVintData(this.ebmlMaxIDLength),a=await this.readVintData(this.ebmlMaxSizeLength);return a[0]^=128>>a.length-1,{id:readUIntBE(e,e.length),len:readUIntBE(a,a.length)}}async readFloat(e){switch(e.len){case 0:return 0;case 4:return this.tokenizer.readNumber(i);case 8:case 10:return this.tokenizer.readNumber(t);default:throw new EbmlContentError(`Invalid IEEE-754 float length: ${e.len}`)}}async readFlag(e){return 1===await this.readUint(e)}async readUint(e){return readUIntBE(await this.readBuffer(e),e.len)}async readString(e){return(await this.tokenizer.readToken(new r(e.len,"utf-8"))).replace(/\x00.*$/g,"")}async readBuffer(e){const a=new Uint8Array(e.len);return await this.tokenizer.readBuffer(a),a}}function readUIntBE(e,a){return Number(function readUIntBeAsBigInt(e,a){const n=new Uint8Array(8),t=e.subarray(0,a);try{return n.set(t,8-a),s.get(n,0)}catch(i){return BigInt(-1)}}(e,a))}function linkParents(e){return e.container&&Object.keys(e.container).map((a=>{const n=e.container[a];return n.id=Number.parseInt(a),n})).forEach((a=>{a.parent=e,linkParents(a)})),e}function getElementPath(e){let a="";return e.parent&&"dtd"!==e.parent.name&&(a+=`${getElementPath(e.parent)}/`),a+e.name}const v=e("music-metadata:parser:matroska");class MatroskaParser extends o{constructor(){super(...arguments),this.seekHeadOffset=0,this.flagUseIndexToSkipClusters=this.options.mkvUseIndex??!1}async parse(){const e=this.tokenizer.fileInfo.size??Number.MAX_SAFE_INTEGER,a=new EbmlIterator(this.tokenizer);v("Initializing DTD end MatroskaIterator"),await a.iterate(d,e,{startNext:e=>{switch(e.id){case 475249515:return v(`Skip element: name=${e.name}, id=0x${e.id.toString(16)}`),p.IgnoreElement;case 524531317:if(this.flagUseIndexToSkipClusters&&this.seekHead){const e=this.seekHead.seek.find((e=>e.position+this.seekHeadOffset>this.tokenizer.position));if(e){const a=e.position+this.seekHeadOffset-this.tokenizer.position;return v(`Use index to go to next position, ignoring ${a} bytes`),this.tokenizer.ignore(a),p.SkipElement}}return p.IgnoreElement;default:return p.ReadNext}},elementValue:async(e,a,n)=>{switch(v(`Received: name=${e.name}, value=${a}`),e.id){case 17026:this.metadata.setFormat("container",`EBML/${a}`);break;case 290298740:this.seekHead=a,this.seekHeadOffset=n;break;case 357149030:{const e=a,n=e.timecodeScale?e.timecodeScale:1e6;if("number"==typeof e.duration){const a=e.duration*n/1e9;await this.addTag("segment:title",e.title),this.metadata.setFormat("duration",Number(a))}}break;case 374648427:{const e=a;if(e?.entries){e.entries.forEach((e=>{const a={codecName:e.codecID.replace("A_","").replace("V_",""),codecSettings:e.codecSettings,flagDefault:e.flagDefault,flagLacing:e.flagLacing,flagEnabled:e.flagEnabled,language:e.language,name:e.name,type:e.trackType,audio:e.audio,video:e.video};this.metadata.addStreamInfo(a)}));const a=e.entries.filter((e=>e.trackType===u.audio)).reduce(((e,a)=>e?a.flagDefault&&!e.flagDefault||a.trackNumber<e.trackNumber?a:e:a),null);a&&(this.metadata.setFormat("codec",a.codecID.replace("A_","")),this.metadata.setFormat("sampleRate",a.audio.samplingFrequency),this.metadata.setFormat("numberOfChannels",a.audio.channels))}}break;case 307544935:{const e=a;await Promise.all(e.tag.map((async e=>{const a=e.target,n=a?.targetTypeValue?m[a.targetTypeValue]:a?.targetType?a.targetType:"track";await Promise.all(e.simpleTags.map((async e=>{const a=e.string?e.string:e.binary;await this.addTag(`${n}:${e.name}`,a)})))})))}break;case 423732329:{const e=a;await Promise.all(e.attachedFiles.filter((e=>e.mimeType.startsWith("image/"))).map((e=>this.addTag("picture",{data:e.data,format:e.mimeType,description:e.description,name:e.name}))))}}}})}async addTag(e,a){await this.metadata.addTag("matroska",e,a)}}export{MatroskaParser};
