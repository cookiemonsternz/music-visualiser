import{c as e,S as t,a,f as s,g as r,i,m as n,B as o,F as d,J as h,k as c}from"./index-pBuBQYRc.js";import{A as m}from"./AbstractID3Parser-_lbqLDuk.js";import"./ID3v2Parser-DFchjb5K.js";const u=e("music-metadata:parser:musepack:sv8"),l=new t(2,"latin1"),p={len:5,get:(e,t)=>({crc:s.get(e,t),streamVersion:a.get(e,t+4)})},k={len:2,get:(e,t)=>({sampleFrequency:[44100,48e3,37800,32e3][r(e,t,0,3)],maxUsedBands:r(e,t,3,5),channelCount:r(e,t+1,0,4)+1,msUsed:i(e,t+1,4),audioBlockFrames:r(e,t+1,5,3)})};class StreamReader{constructor(e){this.tokenizer=e}async readPacketHeader(){const e=await this.tokenizer.readToken(l),t=await this.readVariableSizeField();return{key:e,payloadLength:t.value-2-t.len}}async readStreamHeader(e){const t={};u(`Reading SH at offset=${this.tokenizer.position}`);const a=await this.tokenizer.readToken(p);e-=p.len,Object.assign(t,a),u(`SH.streamVersion = ${a.streamVersion}`);const s=await this.readVariableSizeField();e-=s.len,t.sampleCount=s.value;const r=await this.readVariableSizeField();e-=r.len,t.beginningOfSilence=r.value;const i=await this.tokenizer.readToken(k);return e-=k.len,Object.assign(t,i),await this.tokenizer.ignore(e),t}async readVariableSizeField(e=1,t=0){let s=await this.tokenizer.readNumber(a);return 128&s?(s&=127,s+=t,this.readVariableSizeField(e+1,s<<7)):{len:e,value:t+s}}}class MusepackContentError extends(n("Musepack")){}const g=e("music-metadata:parser:musepack");class MpcSv8Parser extends o{constructor(){super(...arguments),this.audioLength=0}async parse(){if("MPCK"!==await this.tokenizer.readToken(d))throw new MusepackContentError("Invalid Magic number");return this.metadata.setFormat("container","Musepack, SV8"),this.parsePacket()}async parsePacket(){const e=new StreamReader(this.tokenizer);for(;;){const t=await e.readPacketHeader();switch(g(`packet-header key=${t.key}, payloadLength=${t.payloadLength}`),t.key){case"SH":{const a=await e.readStreamHeader(t.payloadLength);this.metadata.setFormat("numberOfSamples",a.sampleCount),this.metadata.setFormat("sampleRate",a.sampleFrequency),this.metadata.setFormat("duration",a.sampleCount/a.sampleFrequency),this.metadata.setFormat("numberOfChannels",a.channelCount);break}case"AP":this.audioLength+=t.payloadLength,await this.tokenizer.ignore(t.payloadLength);break;case"RG":case"EI":case"SO":case"ST":case"CT":await this.tokenizer.ignore(t.payloadLength);break;case"SE":return this.metadata.format.duration&&this.metadata.setFormat("bitrate",8*this.audioLength/this.metadata.format.duration),h.tryParseApeHeader(this.metadata,this.tokenizer,this.options);default:throw new MusepackContentError(`Unexpected header: ${t.key}`)}}}}class BitReader{constructor(e){this.tokenizer=e,this.pos=0,this.dword=null}async read(e){for(;null===this.dword;)this.dword=await this.tokenizer.readToken(s);let t=this.dword;return this.pos+=e,this.pos<32?(t>>>=32-this.pos,t&(1<<e)-1):(this.pos-=32,0===this.pos?(this.dword=null,t&(1<<e)-1):(this.dword=await this.tokenizer.readToken(s),this.pos&&(t<<=this.pos,t|=this.dword>>>32-this.pos),t&(1<<e)-1))}async ignore(e){if(this.pos>0){const t=32-this.pos;this.dword=null,e-=t,this.pos=0}const t=e%32,a=(e-t)/32;return await this.tokenizer.ignore(4*a),this.read(t)}}const w={len:24,get:(e,t)=>{const a={signature:new TextDecoder("latin1").decode(e.subarray(t,t+3)),streamMinorVersion:r(e,t+3,0,4),streamMajorVersion:r(e,t+3,4,4),frameCount:s.get(e,t+4),maxLevel:c.get(e,t+8),sampleFrequency:[44100,48e3,37800,32e3][r(e,t+10,0,2)],link:r(e,t+10,2,2),profile:r(e,t+10,4,4),maxBand:r(e,t+11,0,6),intensityStereo:i(e,t+11,6),midSideStereo:i(e,t+11,7),titlePeak:c.get(e,t+12),titleGain:c.get(e,t+14),albumPeak:c.get(e,t+16),albumGain:c.get(e,t+18),lastFrameLength:s.get(e,t+20)>>>20&2047,trueGapless:i(e,t+23,0)};return a.lastFrameLength=a.trueGapless?s.get(e,20)>>>20&2047:0,a}},y=e("music-metadata:parser:musepack");class MpcSv7Parser extends o{constructor(){super(...arguments),this.bitreader=null,this.audioLength=0,this.duration=null}async parse(){const e=await this.tokenizer.readToken(w);if("MP+"!==e.signature)throw new MusepackContentError("Unexpected magic number");y(`stream-version=${e.streamMajorVersion}.${e.streamMinorVersion}`),this.metadata.setFormat("container","Musepack, SV7"),this.metadata.setFormat("sampleRate",e.sampleFrequency);const t=1152*(e.frameCount-1)+e.lastFrameLength;this.metadata.setFormat("numberOfSamples",t),this.duration=t/e.sampleFrequency,this.metadata.setFormat("duration",this.duration),this.bitreader=new BitReader(this.tokenizer),this.metadata.setFormat("numberOfChannels",e.midSideStereo||e.intensityStereo?2:1);const a=await this.bitreader.read(8);return this.metadata.setFormat("codec",(a/100).toFixed(2)),await this.skipAudioData(e.frameCount),y(`End of audio stream, switching to APEv2, offset=${this.tokenizer.position}`),h.tryParseApeHeader(this.metadata,this.tokenizer,this.options)}async skipAudioData(e){for(;e-- >0;){const e=await this.bitreader.read(20);this.audioLength+=20+e,await this.bitreader.ignore(e)}const t=await this.bitreader.read(11);this.audioLength+=t,null!==this.duration&&this.metadata.setFormat("bitrate",this.audioLength/this.duration)}}const S=e("music-metadata:parser:musepack");class MusepackParser extends m{async postId3v2Parse(){let e;switch(await this.tokenizer.peekToken(new t(3,"latin1"))){case"MP+":S("Stream-version 7"),e=new MpcSv7Parser(this.metadata,this.tokenizer,this.options);break;case"MPC":S("Stream-version 8"),e=new MpcSv8Parser(this.metadata,this.tokenizer,this.options);break;default:throw new MusepackContentError("Invalid signature prefix")}return e.parse()}}export{MusepackParser};
