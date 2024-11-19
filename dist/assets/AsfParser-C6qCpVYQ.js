import{u as e,h as t,s as a,e as r,f as n,j as i,k as s,m as o,l as c,S as d,A as D,c as b,B as I,T as u}from"./index-pBuBQYRc.js";class GUID{static fromBin(e,t=0){return new GUID(GUID.decode(e,t))}static decode(t,a=0){const r=new DataView(t.buffer,a);return`${r.getUint32(0,!0).toString(16)}-${r.getUint16(4,!0).toString(16)}-${r.getUint16(6,!0).toString(16)}-${r.getUint16(8).toString(16)}-${e(t.slice(a+10,a+16))}`.toUpperCase()}static decodeMediaType(e){switch(e.str){case GUID.AudioMedia.str:return"audio";case GUID.VideoMedia.str:return"video";case GUID.CommandMedia.str:return"command";case GUID.Degradable_JPEG_Media.str:return"degradable-jpeg";case GUID.FileTransferMedia.str:return"file-transfer";case GUID.BinaryMedia.str:return"binary"}}static encode(e){const a=new Uint8Array(16),r=new DataView(a.buffer);return r.setUint32(0,Number.parseInt(e.slice(0,8),16),!0),r.setUint16(4,Number.parseInt(e.slice(9,13),16),!0),r.setUint16(6,Number.parseInt(e.slice(14,18),16),!0),a.set(t(e.slice(19,23)),8),a.set(t(e.slice(24)),10),a}constructor(e){this.str=e}equals(e){return this.str===e.str}toBin(){return GUID.encode(this.str)}}function parseUnicodeAttr(e){return a(r(e,"utf-16le"))}GUID.HeaderObject=new GUID("75B22630-668E-11CF-A6D9-00AA0062CE6C"),GUID.DataObject=new GUID("75B22636-668E-11CF-A6D9-00AA0062CE6C"),GUID.SimpleIndexObject=new GUID("33000890-E5B1-11CF-89F4-00A0C90349CB"),GUID.IndexObject=new GUID("D6E229D3-35DA-11D1-9034-00A0C90349BE"),GUID.MediaObjectIndexObject=new GUID("FEB103F8-12AD-4C64-840F-2A1D2F7AD48C"),GUID.TimecodeIndexObject=new GUID("3CB73FD0-0C4A-4803-953D-EDF7B6228F0C"),GUID.FilePropertiesObject=new GUID("8CABDCA1-A947-11CF-8EE4-00C00C205365"),GUID.StreamPropertiesObject=new GUID("B7DC0791-A9B7-11CF-8EE6-00C00C205365"),GUID.HeaderExtensionObject=new GUID("5FBF03B5-A92E-11CF-8EE3-00C00C205365"),GUID.CodecListObject=new GUID("86D15240-311D-11D0-A3A4-00A0C90348F6"),GUID.ScriptCommandObject=new GUID("1EFB1A30-0B62-11D0-A39B-00A0C90348F6"),GUID.MarkerObject=new GUID("F487CD01-A951-11CF-8EE6-00C00C205365"),GUID.BitrateMutualExclusionObject=new GUID("D6E229DC-35DA-11D1-9034-00A0C90349BE"),GUID.ErrorCorrectionObject=new GUID("75B22635-668E-11CF-A6D9-00AA0062CE6C"),GUID.ContentDescriptionObject=new GUID("75B22633-668E-11CF-A6D9-00AA0062CE6C"),GUID.ExtendedContentDescriptionObject=new GUID("D2D0A440-E307-11D2-97F0-00A0C95EA850"),GUID.ContentBrandingObject=new GUID("2211B3FA-BD23-11D2-B4B7-00A0C955FC6E"),GUID.StreamBitratePropertiesObject=new GUID("7BF875CE-468D-11D1-8D82-006097C9A2B2"),GUID.ContentEncryptionObject=new GUID("2211B3FB-BD23-11D2-B4B7-00A0C955FC6E"),GUID.ExtendedContentEncryptionObject=new GUID("298AE614-2622-4C17-B935-DAE07EE9289C"),GUID.DigitalSignatureObject=new GUID("2211B3FC-BD23-11D2-B4B7-00A0C955FC6E"),GUID.PaddingObject=new GUID("1806D474-CADF-4509-A4BA-9AABCB96AAE8"),GUID.ExtendedStreamPropertiesObject=new GUID("14E6A5CB-C672-4332-8399-A96952065B5A"),GUID.AdvancedMutualExclusionObject=new GUID("A08649CF-4775-4670-8A16-6E35357566CD"),GUID.GroupMutualExclusionObject=new GUID("D1465A40-5A79-4338-B71B-E36B8FD6C249"),GUID.StreamPrioritizationObject=new GUID("D4FED15B-88D3-454F-81F0-ED5C45999E24"),GUID.BandwidthSharingObject=new GUID("A69609E6-517B-11D2-B6AF-00C04FD908E9"),GUID.LanguageListObject=new GUID("7C4346A9-EFE0-4BFC-B229-393EDE415C85"),GUID.MetadataObject=new GUID("C5F8CBEA-5BAF-4877-8467-AA8C44FA4CCA"),GUID.MetadataLibraryObject=new GUID("44231C94-9498-49D1-A141-1D134E457054"),GUID.IndexParametersObject=new GUID("D6E229DF-35DA-11D1-9034-00A0C90349BE"),GUID.MediaObjectIndexParametersObject=new GUID("6B203BAD-3F11-48E4-ACA8-D7613DE2CFA7"),GUID.TimecodeIndexParametersObject=new GUID("F55E496D-9797-4B5D-8C8B-604DFE9BFB24"),GUID.CompatibilityObject=new GUID("26F18B5D-4584-47EC-9F5F-0E651F0452C9"),GUID.AdvancedContentEncryptionObject=new GUID("43058533-6981-49E6-9B74-AD12CB86D58C"),GUID.AudioMedia=new GUID("F8699E40-5B4D-11CF-A8FD-00805F5C442B"),GUID.VideoMedia=new GUID("BC19EFC0-5B4D-11CF-A8FD-00805F5C442B"),GUID.CommandMedia=new GUID("59DACFC0-59E6-11D0-A3AC-00A0C90348F6"),GUID.JFIF_Media=new GUID("B61BE100-5B4E-11CF-A8FD-00805F5C442B"),GUID.Degradable_JPEG_Media=new GUID("35907DE0-E415-11CF-A917-00805F5C442B"),GUID.FileTransferMedia=new GUID("91BD222C-F21C-497A-8B6D-5AA86BFC0185"),GUID.BinaryMedia=new GUID("3AFB65E2-47EF-40F2-AC2C-70A90D71D343"),GUID.ASF_Index_Placeholder_Object=new GUID("D9AADE20-7C17-4F9C-BC28-8555DD98E2A2");const U=[parseUnicodeAttr,parseByteArrayAttr,function parseBoolAttr(e,t=0){return 1===parseWordAttr(e,t)},function parseDWordAttr(e,t=0){return n.get(e,t)},function parseQWordAttr(e,t=0){return i.get(e,t)},parseWordAttr,parseByteArrayAttr];function parseByteArrayAttr(e){return new Uint8Array(e)}function parseWordAttr(e,t=0){return s.get(e,t)}class AsfContentParseError extends(o("ASF")){}var C;!function(e){e[e.UnicodeString=0]="UnicodeString",e[e.ByteArray=1]="ByteArray",e[e.Bool=2]="Bool",e[e.DWord=3]="DWord",e[e.QWord=4]="QWord",e[e.Word=5]="Word"}(C||(C={}));const g={len:30,get:(e,t)=>({objectId:GUID.fromBin(e,t),objectSize:Number(i.get(e,t+16)),numberOfHeaderObjects:n.get(e,t+24)})},A={len:24,get:(e,t)=>({objectId:GUID.fromBin(e,t),objectSize:Number(i.get(e,t+16))})};class State{constructor(e){this.len=Number(e.objectSize)-A.len}postProcessTag(e,t,a,r){if("WM/Picture"===t)e.push({id:t,value:WmPictureToken.fromBuffer(r)});else{const n=function getParserForAttr(e){return U[e]}(a);if(!n)throw new AsfContentParseError(`unexpected value headerType: ${a}`);e.push({id:t,value:n(r)})}}}class IgnoreObjectState extends State{get(e,t){return null}}class FilePropertiesObject extends State{get(e,t){return{fileId:GUID.fromBin(e,t),fileSize:i.get(e,t+16),creationDate:i.get(e,t+24),dataPacketsCount:i.get(e,t+32),playDuration:i.get(e,t+40),sendDuration:i.get(e,t+48),preroll:i.get(e,t+56),flags:{broadcast:c(e,t+64,24),seekable:c(e,t+64,25)},minimumDataPacketSize:n.get(e,t+68),maximumDataPacketSize:n.get(e,t+72),maximumBitrate:n.get(e,t+76)}}}FilePropertiesObject.guid=GUID.FilePropertiesObject;class StreamPropertiesObject extends State{get(e,t){return{streamType:GUID.decodeMediaType(GUID.fromBin(e,t)),errorCorrectionType:GUID.fromBin(e,t+8)}}}StreamPropertiesObject.guid=GUID.StreamPropertiesObject;class HeaderExtensionObject{constructor(){this.len=22}get(e,t){const a=new DataView(e.buffer,t);return{reserved1:GUID.fromBin(e,t),reserved2:a.getUint16(16,!0),extensionDataSize:a.getUint16(18,!0)}}}HeaderExtensionObject.guid=GUID.HeaderExtensionObject;const l={len:20,get:(e,t)=>({entryCount:new DataView(e.buffer,t).getUint16(16,!0)})};async function readString(e){const t=await e.readNumber(s);return(await e.readToken(new d(2*t,"utf-16le"))).replace("\0","")}async function readCodecEntries(e){const t=await e.readToken(l),a=[];for(let r=0;r<t.entryCount;++r)a.push(await readCodecEntry(e));return a}async function readInformation(e){const t=await e.readNumber(s),a=new Uint8Array(t);return await e.readBuffer(a),a}async function readCodecEntry(e){const t=await e.readNumber(s);return{type:{videoCodec:!(1&~t),audioCodec:!(2&~t)},codecName:await readString(e),description:await readString(e),information:await readInformation(e)}}class ContentDescriptionObjectState extends State{get(e,t){const a=[],r=new DataView(e.buffer,t);let n=10;for(let i=0;i<ContentDescriptionObjectState.contentDescTags.length;++i){const s=r.getUint16(2*i,!0);if(s>0){const r=ContentDescriptionObjectState.contentDescTags[i],o=n+s;a.push({id:r,value:parseUnicodeAttr(e.slice(t+n,t+o))}),n=o}}return a}}ContentDescriptionObjectState.guid=GUID.ContentDescriptionObject,ContentDescriptionObjectState.contentDescTags=["Title","Author","Copyright","Description","Rating"];class ExtendedContentDescriptionObjectState extends State{get(e,t){const a=[],r=new DataView(e.buffer,t),n=r.getUint16(0,!0);let i=2;for(let s=0;s<n;s+=1){const n=r.getUint16(i,!0);i+=2;const s=parseUnicodeAttr(e.slice(t+i,t+i+n));i+=n;const o=r.getUint16(i,!0);i+=2;const c=r.getUint16(i,!0);i+=2;const d=e.slice(t+i,t+i+c);i+=c,this.postProcessTag(a,s,o,d)}return a}}ExtendedContentDescriptionObjectState.guid=GUID.ExtendedContentDescriptionObject;class ExtendedStreamPropertiesObjectState extends State{get(e,t){const a=new DataView(e.buffer,t);return{startTime:i.get(e,t),endTime:i.get(e,t+8),dataBitrate:a.getInt32(12,!0),bufferSize:a.getInt32(16,!0),initialBufferFullness:a.getInt32(20,!0),alternateDataBitrate:a.getInt32(24,!0),alternateBufferSize:a.getInt32(28,!0),alternateInitialBufferFullness:a.getInt32(32,!0),maximumObjectSize:a.getInt32(36,!0),flags:{reliableFlag:c(e,t+40,0),seekableFlag:c(e,t+40,1),resendLiveCleanpointsFlag:c(e,t+40,2)},streamNumber:a.getInt16(42,!0),streamLanguageId:a.getInt16(44,!0),averageTimePerFrame:a.getInt32(52,!0),streamNameCount:a.getInt32(54,!0),payloadExtensionSystems:a.getInt32(56,!0),streamNames:[],streamPropertiesObject:null}}}ExtendedStreamPropertiesObjectState.guid=GUID.ExtendedStreamPropertiesObject;class MetadataObjectState extends State{get(e,t){const a=[],r=new DataView(e.buffer,t),n=r.getUint16(0,!0);let i=2;for(let s=0;s<n;s+=1){i+=4;const n=r.getUint16(i,!0);i+=2;const s=r.getUint16(i,!0);i+=2;const o=r.getUint32(i,!0);i+=4;const c=parseUnicodeAttr(e.slice(t+i,t+i+n));i+=n;const d=e.slice(t+i,t+i+o);i+=o,this.postProcessTag(a,c,s,d)}return a}}MetadataObjectState.guid=GUID.MetadataObject;class MetadataLibraryObjectState extends MetadataObjectState{}MetadataLibraryObjectState.guid=GUID.MetadataLibraryObject;class WmPictureToken{static fromBuffer(e){return new WmPictureToken(e.length).get(e,0)}constructor(e){this.len=e}get(e,t){const a=new DataView(e.buffer,t),r=a.getUint8(0),n=a.getInt32(1,!0);let i=5;for(;0!==a.getUint16(i);)i+=2;const s=new d(i-5,"utf-16le").get(e,5);for(;0!==a.getUint16(i);)i+=2;const o=new d(i-5,"utf-16le").get(e,5);return{type:D[r],format:s,description:o,size:n,data:e.slice(i+4)}}}const w=b("music-metadata:parser:ASF");class AsfParser extends I{async parse(){const e=await this.tokenizer.readToken(g);if(!e.objectId.equals(GUID.HeaderObject))throw new AsfContentParseError(`expected asf header; but was not found; got: ${e.objectId.str}`);try{await this.parseObjectHeader(e.numberOfHeaderObjects)}catch(t){w("Error while parsing ASF: %s",t)}}async parseObjectHeader(e){let t;do{const e=await this.tokenizer.readToken(A);switch(w("header GUID=%s",e.objectId.str),e.objectId.str){case FilePropertiesObject.guid.str:{const t=await this.tokenizer.readToken(new FilePropertiesObject(e));this.metadata.setFormat("duration",Number(t.playDuration/BigInt(1e3))/1e4-Number(t.preroll)/1e3),this.metadata.setFormat("bitrate",t.maximumBitrate);break}case StreamPropertiesObject.guid.str:{const t=await this.tokenizer.readToken(new StreamPropertiesObject(e));this.metadata.setFormat("container",`ASF/${t.streamType}`);break}case HeaderExtensionObject.guid.str:{const e=await this.tokenizer.readToken(new HeaderExtensionObject);await this.parseExtensionObject(e.extensionDataSize);break}case ContentDescriptionObjectState.guid.str:t=await this.tokenizer.readToken(new ContentDescriptionObjectState(e)),await this.addTags(t);break;case ExtendedContentDescriptionObjectState.guid.str:t=await this.tokenizer.readToken(new ExtendedContentDescriptionObjectState(e)),await this.addTags(t);break;case GUID.CodecListObject.str:{const e=await readCodecEntries(this.tokenizer);e.forEach((e=>{this.metadata.addStreamInfo({type:e.type.videoCodec?u.video:u.audio,codecName:e.codecName})}));const t=e.filter((e=>e.type.audioCodec)).map((e=>e.codecName)).join("/");this.metadata.setFormat("codec",t);break}case GUID.StreamBitratePropertiesObject.str:await this.tokenizer.ignore(e.objectSize-A.len);break;case GUID.PaddingObject.str:w("Padding: %s bytes",e.objectSize-A.len),await this.tokenizer.ignore(e.objectSize-A.len);break;default:this.metadata.addWarning(`Ignore ASF-Object-GUID: ${e.objectId.str}`),w("Ignore ASF-Object-GUID: %s",e.objectId.str),await this.tokenizer.readToken(new IgnoreObjectState(e))}}while(--e)}async addTags(e){await Promise.all(e.map((({id:e,value:t})=>this.metadata.addTag("asf",e,t))))}async parseExtensionObject(e){do{const t=await this.tokenizer.readToken(A),a=t.objectSize-A.len;switch(t.objectId.str){case ExtendedStreamPropertiesObjectState.guid.str:await this.tokenizer.readToken(new ExtendedStreamPropertiesObjectState(t));break;case MetadataObjectState.guid.str:{const e=await this.tokenizer.readToken(new MetadataObjectState(t));await this.addTags(e);break}case MetadataLibraryObjectState.guid.str:{const e=await this.tokenizer.readToken(new MetadataLibraryObjectState(t));await this.addTags(e);break}case GUID.PaddingObject.str:await this.tokenizer.ignore(a);break;case GUID.CompatibilityObject.str:this.tokenizer.ignore(a);break;case GUID.ASF_Index_Placeholder_Object.str:await this.tokenizer.ignore(a);break;default:this.metadata.addWarning(`Ignore ASF-Object-GUID: ${t.objectId.str}`),await this.tokenizer.readToken(new IgnoreObjectState(t))}e-=t.objectSize}while(e>0)}}export{AsfParser};
