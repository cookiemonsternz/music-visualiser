import{c as e,m as a,O as t,e as r,P as s,a as i,U as n,Q as c,R as o,A as d,H as l,l as h,K as m,V as g,d as p,W as u,r as f}from"./index-pBuBQYRc.js";const T=e("music-metadata:id3v2:frame-parser"),v="latin1";function parseGenreCode(e){return"RX"===e?"Remix":"CR"===e?"Cover":e.match(/^\d*$/)?l[Number.parseInt(e)]:void 0}class FrameParser{constructor(e,a){this.major=e,this.warningCollector=a}readData(e,a,l){if(0===e.length)return void this.warningCollector.addWarning(`id3v2.${this.major} header has empty tag type=${a}`);const{encoding:h,bom:m}=t.get(e,0),g=e.length;let p=0,u=[];const f=FrameParser.getNullTerminatorLength(h);let P;switch(T(`Parsing tag type=${a}, encoding=${h}, bom=${m}`),"TXXX"!==a&&"T"===a[0]?"T*":a){case"T*":case"GRP1":case"IPLS":case"MVIN":case"MVNM":case"PCS":case"PCST":{let t;try{t=r(e.slice(1),h).replace(/\x00+$/,"")}catch(I){if(I instanceof Error){this.warningCollector.addWarning(`id3v2.${this.major} type=${a} header has invalid string value: ${I.message}`);break}throw I}switch(a){case"TMCL":case"TIPL":case"IPLS":u=FrameParser.functionList(this.splitValue(a,t));break;case"TRK":case"TRCK":case"TPOS":u=t;break;case"TCOM":case"TEXT":case"TOLY":case"TOPE":case"TPE1":case"TSRC":u=this.splitValue(a,t);break;case"TCO":case"TCON":u=this.splitValue(a,t).map((e=>function parseGenre(e){const a=[];let t,r="";for(const s of e)if("string"==typeof t)if("("===s&&""===t)r+="(",t=void 0;else if(")"===s){""!==r&&(a.push(r),r="");const e=parseGenreCode(t);e&&a.push(e),t=void 0}else t+=s;else"("===s?t="":r+=s;return r&&(0===a.length&&r.match(/^\d*$/)&&(r=parseGenreCode(r)),r&&a.push(r)),a}(e))).reduce(((e,a)=>e.concat(a)),[]);break;case"PCS":case"PCST":u=this.major>=4?this.splitValue(a,t):[t],u=Array.isArray(u)&&""===u[0]?1:0;break;default:u=this.major>=4?this.splitValue(a,t):[t]}break}case"TXXX":{const t=FrameParser.readIdentifierAndData(e,p+1,g,h);u={description:t.id,text:this.splitValue(a,r(t.data,h).replace(/\x00+$/,""))};break}case"PIC":case"APIC":if(l){const a={};switch(p+=1,this.major){case 2:a.format=r(e.slice(p,p+3),"latin1"),p+=3;break;case 3:case 4:P=s(e,p,g,v),a.format=r(e.slice(p,P),v),p=P+1;break;default:throw function makeUnexpectedMajorVersionError$1(e){throw new Id3v2ContentError(`Unexpected majorVer: ${e}`)}(this.major)}a.format=FrameParser.fixPictureMimeType(a.format),a.type=d[e[p]],p+=1,P=s(e,p,g,h),a.description=r(e.slice(p,P),h),p=P+f,a.data=e.slice(p,g),u=a}break;case"CNT":case"PCNT":u=n.get(e,0);break;case"SYLT":{const a=o.get(e,0);p+=o.len;const t={descriptor:"",language:a.language,contentType:a.contentType,timeStampFormat:a.timeStampFormat,syncText:[]};let r=!1;for(;p<g;){const s=FrameParser.readNullTerminatedString(e.subarray(p),a.encoding);if(p+=s.len,r){const a=n.get(e,p);p+=n.len,t.syncText.push({text:s.text,timestamp:a})}else t.descriptor=s.text,r=!0}u=t;break}case"ULT":case"USLT":case"COM":case"COMM":{const a=c.get(e,p);p+=c.len;const t=FrameParser.readNullTerminatedString(e.subarray(p),a.encoding);p+=t.len;const r=FrameParser.readNullTerminatedString(e.subarray(p),a.encoding);u={language:a.language,descriptor:t.text,text:r.text};break}case"UFID":{const a=FrameParser.readIdentifierAndData(e,p,g,v);u={owner_identifier:a.id,identifier:a.data};break}case"PRIV":{const a=FrameParser.readIdentifierAndData(e,p,g,v);u={owner_identifier:a.id,data:a.data};break}case"POPM":{P=s(e,p,g,v);const a=r(e.slice(p,P),v);p=P+1;const t=g-p;u={email:a,rating:i.get(e,p),counter:t>=5?n.get(e,p+1):void 0};break}case"GEOB":{P=s(e,p+1,g,h);const a=r(e.slice(p+1,P),v);p=P+1,P=s(e,p,g,h);const t=r(e.slice(p,P),v);p=P+1,P=s(e,p,g,h);const i=r(e.slice(p,P),v);p=P+1;u={type:a,filename:t,description:i,data:e.slice(p,g)};break}case"WCOM":case"WCOP":case"WOAF":case"WOAR":case"WOAS":case"WORS":case"WPAY":case"WPUB":P=s(e,p+1,g,h),u=r(e.slice(p,P),v);break;case"WXXX":{P=s(e,p+1,g,h);const a=r(e.slice(p+1,P),h);p=P+("utf-16le"===h?2:1),u={description:a,url:r(e.slice(p,g),v)};break}case"WFD":case"WFED":u=r(e.slice(p+1,s(e,p+1,g,h)),h);break;case"MCDI":u=e.slice(0,g);break;default:T(`Warning: unsupported id3v2-tag-type: ${a}`)}return u}static readNullTerminatedString(e,a){let t=a.bom?2:0;const i=s(e,t,e.length,a.encoding),n=e.slice(t,i);return t="utf-16le"===a.encoding?i+2:i+1,{text:r(n,a.encoding),len:t}}static fixPictureMimeType(e){switch(e=e.toLocaleLowerCase()){case"jpg":return"image/jpeg";case"png":return"image/png"}return e}static functionList(e){const a={};for(let t=0;t+1<e.length;t+=2){const r=e[t+1].split(",");a[e[t]]=a[e[t]]?a[e[t]].concat(r):r}return a}splitValue(e,a){let t;return this.major<4?(t=a.split(/\x00/g),t.length>1?this.warningCollector.addWarning(`ID3v2.${this.major} ${e} uses non standard null-separator.`):t=a.split(/\//g)):t=a.split(/\x00/g),FrameParser.trimArray(t)}static trimArray(e){return e.map((e=>e.replace(/\x00+$/,"").trim()))}static readIdentifierAndData(e,a,t,i){const n=s(e,a,t,i),c=r(e.slice(a,n),i);return a=n+FrameParser.getNullTerminatorLength(i),{id:c,data:e.slice(a,t)}}static getNullTerminatorLength(e){return"utf-16le"===e?2:1}}class Id3v2ContentError extends(a("id3v2")){}const P=new TextDecoder("ascii");class ID3v2Parser{constructor(){this.tokenizer=void 0,this.id3Header=void 0,this.metadata=void 0,this.headerType=void 0,this.options=void 0}static removeUnsyncBytes(e){let a=0,t=0;for(;a<e.length-1;)a!==t&&(e[t]=e[a]),a+=255===e[a]&&0===e[a+1]?2:1,t++;return a<e.length&&(e[t++]=e[a]),e.slice(0,t)}static getFrameHeaderLength(e){switch(e){case 2:return 6;case 3:case 4:return 10;default:throw makeUnexpectedMajorVersionError(e)}}static readFrameFlags(e){return{status:{tag_alter_preservation:h(e,0,6),file_alter_preservation:h(e,0,5),read_only:h(e,0,4)},format:{grouping_identity:h(e,1,7),compression:h(e,1,3),encryption:h(e,1,2),unsynchronisation:h(e,1,1),data_length_indicator:h(e,1,0)}}}static readFrameData(e,a,t,r,s){const i=new FrameParser(t,s);switch(t){case 2:return i.readData(e,a.id,r);case 3:case 4:return a.flags?.format.unsynchronisation&&(e=ID3v2Parser.removeUnsyncBytes(e)),a.flags?.format.data_length_indicator&&(e=e.slice(4,e.length)),i.readData(e,a.id,r);default:throw makeUnexpectedMajorVersionError(t)}}static makeDescriptionTagName(e,a){return e+(a?`:${a}`:"")}async parse(e,a,t){this.tokenizer=a,this.metadata=e,this.options=t;const r=await this.tokenizer.readToken(m);if("ID3"!==r.fileIdentifier)throw new Id3v2ContentError("expected ID3-header file-identifier 'ID3' was not found");return this.id3Header=r,this.headerType=`ID3v2.${r.version.major}`,r.flags.isExtendedHeader?this.parseExtendedHeader():this.parseId3Data(r.size)}async parseExtendedHeader(){const e=await this.tokenizer.readToken(g),a=e.size-g.len;return a>0?this.parseExtendedHeaderData(a,e.size):this.parseId3Data(this.id3Header.size-e.size)}async parseExtendedHeaderData(e,a){return await this.tokenizer.ignore(e),this.parseId3Data(this.id3Header.size-a)}async parseId3Data(e){const a=await this.tokenizer.readToken(new p(e));for(const t of this.parseMetadata(a))if("TXXX"===t.id)t.value&&await this.handleTag(t,t.value.text,(()=>t.value.description));else await(Array.isArray(t.value)?Promise.all(t.value.map((e=>this.addTag(t.id,e)))):this.addTag(t.id,t.value))}async handleTag(e,a,t,r=e=>e){await Promise.all(a.map((a=>this.addTag(ID3v2Parser.makeDescriptionTagName(e.id,t(a)),r(a)))))}async addTag(e,a){await this.metadata.addTag(this.headerType,e,a)}parseMetadata(e){let a=0;const t=[];for(;a!==e.length;){const r=ID3v2Parser.getFrameHeaderLength(this.id3Header.version.major);if(a+r>e.length){this.metadata.addWarning("Illegal ID3v2 tag length");break}const s=e.slice(a,a+r);a+=r;const i=this.readFrameHeader(s,this.id3Header.version.major),n=e.slice(a,a+i.length);a+=i.length;const c=ID3v2Parser.readFrameData(n,i,this.id3Header.version.major,!this.options.skipCovers,this.metadata);c&&t.push({id:i.id,value:c})}return t}readFrameHeader(e,a){let t;switch(a){case 2:t={id:P.decode(e.slice(0,3)),length:f.get(e,3)},t.id.match(/[A-Z0-9]{3}/g)||this.metadata.addWarning(`Invalid ID3v2.${this.id3Header.version.major} frame-header-ID: ${t.id}`);break;case 3:case 4:t={id:P.decode(e.slice(0,4)),length:(4===a?u:n).get(e,4),flags:ID3v2Parser.readFrameFlags(e.slice(8,10))},t.id.match(/[A-Z0-9]{4}/g)||this.metadata.addWarning(`Invalid ID3v2.${this.id3Header.version.major} frame-header-ID: ${t.id}`);break;default:throw makeUnexpectedMajorVersionError(a)}return t}}function makeUnexpectedMajorVersionError(e){throw new Id3v2ContentError(`Unexpected majorVer: ${e}`)}export{ID3v2Parser as I};
