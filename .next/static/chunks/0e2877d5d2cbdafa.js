(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,33525,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"warnOnce",{enumerable:!0,get:function(){return s}});let s=e=>{}},11110,e=>{"use strict";var t=e.i(43476),r=e.i(71645),s=e.i(77624);let i=(0,r.createContext)();e.s(["LanguageProvider",0,({children:e})=>{let{activeProfile:a}=(0,s.useProfile)(),[o,n]=(0,r.useState)("fr"),[l,c]=(0,r.useState)("en");return(0,r.useEffect)(()=>{let e=localStorage.getItem("learning_lang");e&&n(e);let t=localStorage.getItem("known_lang");t&&c(t)},[]),(0,r.useEffect)(()=>{a&&a.language&&n(a.language.toLowerCase().substring(0,2))},[a]),(0,r.useEffect)(()=>{localStorage.setItem("learning_lang",o),localStorage.setItem("known_lang",l)},[o,l]),(0,t.jsx)(i.Provider,{value:{learningLang:o,setLearningLang:n,knownLang:l,setKnownLang:c},children:e})},"useLanguage",0,()=>{let e=(0,r.useContext)(i);if(!e)throw Error("useLanguage must be used within a LanguageProvider");return e}])},5766,e=>{"use strict";let t,r;var s,i=e.i(71645);let a={data:""},o=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,n=/\/\*[^]*?\*\/|  +/g,l=/\n+/g,c=(e,t)=>{let r="",s="",i="";for(let a in e){let o=e[a];"@"==a[0]?"i"==a[1]?r=a+" "+o+";":s+="f"==a[1]?c(o,a):a+"{"+c(o,"k"==a[1]?"":t)+"}":"object"==typeof o?s+=c(o,t?t.replace(/([^,])+/g,e=>a.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):a):null!=o&&(a=/^--/.test(a)?a:a.replace(/[A-Z]/g,"-$&").toLowerCase(),i+=c.p?c.p(a,o):a+":"+o+";")}return r+(t&&i?t+"{"+i+"}":i)+s},u={},d=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+d(e[r]);return t}return e};function p(e){let t,r,s=this||{},i=e.call?e(s.p):e;return((e,t,r,s,i)=>{var a;let p=d(e),f=u[p]||(u[p]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(p));if(!u[f]){let t=p!==e?e:(e=>{let t,r,s=[{}];for(;t=o.exec(e.replace(n,""));)t[4]?s.shift():t[3]?(r=t[3].replace(l," ").trim(),s.unshift(s[0][r]=s[0][r]||{})):s[0][t[1]]=t[2].replace(l," ").trim();return s[0]})(e);u[f]=c(i?{["@keyframes "+f]:t}:t,r?"":"."+f)}let h=r&&u.g?u.g:null;return r&&(u.g=u[f]),a=u[f],h?t.data=t.data.replace(h,a):-1===t.data.indexOf(a)&&(t.data=s?a+t.data:t.data+a),f})(i.unshift?i.raw?(t=[].slice.call(arguments,1),r=s.p,i.reduce((e,s,i)=>{let a=t[i];if(a&&a.call){let e=a(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;a=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+s+(null==a?"":a)},"")):i.reduce((e,t)=>Object.assign(e,t&&t.call?t(s.p):t),{}):i,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||a})(s.target),s.g,s.o,s.k)}p.bind({g:1});let f,h,m,v=p.bind({k:1});function y(e,t){let r=this||{};return function(){let s=arguments;function i(a,o){let n=Object.assign({},a),l=n.className||i.className;r.p=Object.assign({theme:h&&h()},n),r.o=/ *go\d+/.test(l),n.className=p.apply(r,s)+(l?" "+l:""),t&&(n.ref=o);let c=e;return e[0]&&(c=n.as||e,delete n.as),m&&c[0]&&m(n),f(c,n)}return t?t(i):i}}var g=(e,t)=>"function"==typeof e?e(t):e,b=(t=0,()=>(++t).toString()),E=()=>{if(void 0===r&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");r=!e||e.matches}return r},_="default",C=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:s}=t;return C(e,{type:+!!e.toasts.find(e=>e.id===s.id),toast:s});case 3:let{toastId:i}=t;return{...e,toasts:e.toasts.map(e=>e.id===i||void 0===i?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let a=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+a}))}}},x=[],w={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},L={},P=(e,t=_)=>{L[t]=C(L[t]||w,e),x.forEach(([e,r])=>{e===t&&r(L[t])})},k=e=>Object.keys(L).forEach(t=>P(e,t)),S=(e=_)=>t=>{P(t,e)},R={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},I=e=>(t,r)=>{let s,i=((e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||b()}))(t,e,r);return S(i.toasterId||(s=i.id,Object.keys(L).find(e=>L[e].toasts.some(e=>e.id===s))))({type:2,toast:i}),i.id},T=(e,t)=>I("blank")(e,t);T.error=I("error"),T.success=I("success"),T.loading=I("loading"),T.custom=I("custom"),T.dismiss=(e,t)=>{let r={type:3,toastId:e};t?S(t)(r):k(r)},T.dismissAll=e=>T.dismiss(void 0,e),T.remove=(e,t)=>{let r={type:4,toastId:e};t?S(t)(r):k(r)},T.removeAll=e=>T.remove(void 0,e),T.promise=(e,t,r)=>{let s=T.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let i=t.success?g(t.success,e):void 0;return i?T.success(i,{id:s,...r,...null==r?void 0:r.success}):T.dismiss(s),e}).catch(e=>{let i=t.error?g(t.error,e):void 0;i?T.error(i,{id:s,...r,...null==r?void 0:r.error}):T.dismiss(s)}),e};var U=1e3,N=v`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,A=v`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,K=v`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,j=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${N} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${A} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${K} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,O=v`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,D=y("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${O} 1s linear infinite;
`,B=v`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,$=v`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,M=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${B} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${$} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,W=y("div")`
  position: absolute;
`,X=y("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,F=v`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,z=y("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${F} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Y=({toast:e})=>{let{icon:t,type:r,iconTheme:s}=e;return void 0!==t?"string"==typeof t?i.createElement(z,null,t):t:"blank"===r?null:i.createElement(X,null,i.createElement(D,{...s}),"loading"!==r&&i.createElement(W,null,"error"===r?i.createElement(j,{...s}):i.createElement(M,{...s})))},G=y("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,H=y("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Q=i.memo(({toast:e,position:t,style:r,children:s})=>{let a=e.height?((e,t)=>{let r=e.includes("top")?1:-1,[s,i]=E()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*r}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*r}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${v(s)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${v(i)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},o=i.createElement(Y,{toast:e}),n=i.createElement(H,{...e.ariaProps},g(e.message,e));return i.createElement(G,{className:e.className,style:{...a,...r,...e.style}},"function"==typeof s?s({icon:o,message:n}):i.createElement(i.Fragment,null,o,n))});s=i.createElement,c.p=void 0,f=s,h=void 0,m=void 0;var V=({id:e,className:t,style:r,onHeightUpdate:s,children:a})=>{let o=i.useCallback(t=>{if(t){let r=()=>{s(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,s]);return i.createElement("div",{ref:o,className:t,style:r},a)},J=p`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,Z=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:s,children:a,toasterId:o,containerStyle:n,containerClassName:l})=>{let{toasts:c,handlers:u}=((e,t="default")=>{let{toasts:r,pausedAt:s}=((e={},t=_)=>{let[r,s]=(0,i.useState)(L[t]||w),a=(0,i.useRef)(L[t]);(0,i.useEffect)(()=>(a.current!==L[t]&&s(L[t]),x.push([t,s]),()=>{let e=x.findIndex(([e])=>e===t);e>-1&&x.splice(e,1)}),[t]);let o=r.toasts.map(t=>{var r,s,i;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(s=e[t.type])?void 0:s.duration)||(null==e?void 0:e.duration)||R[t.type],style:{...e.style,...null==(i=e[t.type])?void 0:i.style,...t.style}}});return{...r,toasts:o}})(e,t),a=(0,i.useRef)(new Map).current,o=(0,i.useCallback)((e,t=U)=>{if(a.has(e))return;let r=setTimeout(()=>{a.delete(e),n({type:4,toastId:e})},t);a.set(e,r)},[]);(0,i.useEffect)(()=>{if(s)return;let e=Date.now(),i=r.map(r=>{if(r.duration===1/0)return;let s=(r.duration||0)+r.pauseDuration-(e-r.createdAt);if(s<0){r.visible&&T.dismiss(r.id);return}return setTimeout(()=>T.dismiss(r.id,t),s)});return()=>{i.forEach(e=>e&&clearTimeout(e))}},[r,s,t]);let n=(0,i.useCallback)(S(t),[t]),l=(0,i.useCallback)(()=>{n({type:5,time:Date.now()})},[n]),c=(0,i.useCallback)((e,t)=>{n({type:1,toast:{id:e,height:t}})},[n]),u=(0,i.useCallback)(()=>{s&&n({type:6,time:Date.now()})},[s,n]),d=(0,i.useCallback)((e,t)=>{let{reverseOrder:s=!1,gutter:i=8,defaultPosition:a}=t||{},o=r.filter(t=>(t.position||a)===(e.position||a)&&t.height),n=o.findIndex(t=>t.id===e.id),l=o.filter((e,t)=>t<n&&e.visible).length;return o.filter(e=>e.visible).slice(...s?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+i,0)},[r]);return(0,i.useEffect)(()=>{r.forEach(e=>{if(e.dismissed)o(e.id,e.removeDelay);else{let t=a.get(e.id);t&&(clearTimeout(t),a.delete(e.id))}})},[r,o]),{toasts:r,handlers:{updateHeight:c,startPause:l,endPause:u,calculateOffset:d}}})(r,o);return i.createElement("div",{"data-rht-toaster":o||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...n},className:l,onMouseEnter:u.startPause,onMouseLeave:u.endPause},c.map(r=>{let o,n,l=r.position||t,c=u.calculateOffset(r,{reverseOrder:e,gutter:s,defaultPosition:t}),d=(o=l.includes("top"),n=l.includes("center")?{justifyContent:"center"}:l.includes("right")?{justifyContent:"flex-end"}:{},{left:0,right:0,display:"flex",position:"absolute",transition:E()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${c*(o?1:-1)}px)`,...o?{top:0}:{bottom:0},...n});return i.createElement(V,{id:r.id,key:r.id,onHeightUpdate:u.updateHeight,className:r.visible?J:"",style:d},"custom"===r.type?g(r.message,r):a?a(r):i.createElement(Q,{toast:r,position:l}))}))};e.s(["Toaster",()=>Z,"default",()=>T,"toast",()=>T],5766)},12598,e=>{"use strict";var t=e.i(71645),r=e.i(43476),s=t.createContext(void 0),i=e=>{let r=t.useContext(s);if(e)return e;if(!r)throw Error("No QueryClient set, use QueryClientProvider to set one");return r},a=({client:e,children:i})=>(t.useEffect(()=>(e.mount(),()=>{e.unmount()}),[e]),(0,r.jsx)(s.Provider,{value:e,children:i}));e.s(["QueryClientProvider",()=>a,"useQueryClient",()=>i])},293,1753,91271,91261,55624,e=>{"use strict";e.i(47167);let t=()=>!1,r=()=>!1,s=()=>{try{return!0}catch{}return!1};function i(e){return e.endsWith(".lclstage.dev")||e.endsWith(".stgstage.dev")||e.endsWith(".clerkstage.dev")||e.endsWith(".accountsstage.dev")}e.s(["n",()=>s,"r",()=>r,"t",()=>t],1753),e.s(["t",()=>i],91271);let a=(...e)=>{};e.s(["t",()=>a],91261);let o=()=>{let e=a,t=a;return{promise:new Promise((r,s)=>{e=r,t=s}),resolve:e,reject:t}};e.s(["t",()=>o],55624),e.s([],293)},95187,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var s={callServer:function(){return a.callServer},createServerReference:function(){return n.createServerReference},findSourceMapURL:function(){return o.findSourceMapURL}};for(var i in s)Object.defineProperty(r,i,{enumerable:!0,get:s[i]});let a=e.r(32120),o=e.r(92245),n=e.r(35326)},14272,e=>{"use strict";var t=e.i(40143),r=e.i(88587),s=e.i(36553),i=class extends r.Removable{#e;#t;#r;#s;constructor(e){super(),this.#e=e.client,this.mutationId=e.mutationId,this.#r=e.mutationCache,this.#t=[],this.state=e.state||a(),this.setOptions(e.options),this.scheduleGc()}setOptions(e){this.options=e,this.updateGcTime(this.options.gcTime)}get meta(){return this.options.meta}addObserver(e){this.#t.includes(e)||(this.#t.push(e),this.clearGcTimeout(),this.#r.notify({type:"observerAdded",mutation:this,observer:e}))}removeObserver(e){this.#t=this.#t.filter(t=>t!==e),this.scheduleGc(),this.#r.notify({type:"observerRemoved",mutation:this,observer:e})}optionalRemove(){this.#t.length||("pending"===this.state.status?this.scheduleGc():this.#r.remove(this))}continue(){return this.#s?.continue()??this.execute(this.state.variables)}async execute(e){let t=()=>{this.#i({type:"continue"})},r={client:this.#e,meta:this.options.meta,mutationKey:this.options.mutationKey};this.#s=(0,s.createRetryer)({fn:()=>this.options.mutationFn?this.options.mutationFn(e,r):Promise.reject(Error("No mutationFn found")),onFail:(e,t)=>{this.#i({type:"failed",failureCount:e,error:t})},onPause:()=>{this.#i({type:"pause"})},onContinue:t,retry:this.options.retry??0,retryDelay:this.options.retryDelay,networkMode:this.options.networkMode,canRun:()=>this.#r.canRun(this)});let i="pending"===this.state.status,a=!this.#s.canStart();try{if(i)t();else{this.#i({type:"pending",variables:e,isPaused:a}),await this.#r.config.onMutate?.(e,this,r);let t=await this.options.onMutate?.(e,r);t!==this.state.context&&this.#i({type:"pending",context:t,variables:e,isPaused:a})}let s=await this.#s.start();return await this.#r.config.onSuccess?.(s,e,this.state.context,this,r),await this.options.onSuccess?.(s,e,this.state.context,r),await this.#r.config.onSettled?.(s,null,this.state.variables,this.state.context,this,r),await this.options.onSettled?.(s,null,e,this.state.context,r),this.#i({type:"success",data:s}),s}catch(t){try{await this.#r.config.onError?.(t,e,this.state.context,this,r)}catch(e){Promise.reject(e)}try{await this.options.onError?.(t,e,this.state.context,r)}catch(e){Promise.reject(e)}try{await this.#r.config.onSettled?.(void 0,t,this.state.variables,this.state.context,this,r)}catch(e){Promise.reject(e)}try{await this.options.onSettled?.(void 0,t,e,this.state.context,r)}catch(e){Promise.reject(e)}throw this.#i({type:"error",error:t}),t}finally{this.#r.runNext(this)}}#i(e){this.state=(t=>{switch(e.type){case"failed":return{...t,failureCount:e.failureCount,failureReason:e.error};case"pause":return{...t,isPaused:!0};case"continue":return{...t,isPaused:!1};case"pending":return{...t,context:e.context,data:void 0,failureCount:0,failureReason:null,error:null,isPaused:e.isPaused,status:"pending",variables:e.variables,submittedAt:Date.now()};case"success":return{...t,data:e.data,failureCount:0,failureReason:null,error:null,status:"success",isPaused:!1};case"error":return{...t,data:void 0,error:e.error,failureCount:t.failureCount+1,failureReason:e.error,isPaused:!1,status:"error"}}})(this.state),t.notifyManager.batch(()=>{this.#t.forEach(t=>{t.onMutationUpdate(e)}),this.#r.notify({mutation:this,type:"updated",action:e})})}};function a(){return{context:void 0,data:void 0,error:null,failureCount:0,failureReason:null,isPaused:!1,status:"idle",variables:void 0,submittedAt:0}}e.s(["Mutation",()=>i,"getDefaultState",()=>a])},27436,66757,81729,72667,e=>{"use strict";let t=[".lcl.dev",".lclstage.dev",".lclclerk.com"],r=[".accounts.dev",".accountsstage.dev",".accounts.lclclerk.com"],s=[".lcl.dev",".stg.dev",".lclstage.dev",".stgstage.dev",".dev.lclclerk.com",".stg.lclclerk.com",".accounts.lclclerk.com","accountsstage.dev","accounts.dev"],i=[".lcl.dev","lclstage.dev",".lclclerk.com",".accounts.lclclerk.com"],a=[".accountsstage.dev"];e.s(["a",()=>"https://api.lclclerk.com","c",()=>"https://api.clerk.com","d",()=>a,"i",()=>t,"o",()=>i,"r",()=>s,"t",()=>r,"u",()=>"https://api.clerkstage.dev"],27436);let o=e=>"u">typeof atob&&"function"==typeof atob?atob(e):void 0!==globalThis.Buffer?globalThis.Buffer.from(e,"base64").toString():e;e.s(["t",()=>o],66757);let n=e=>"u">typeof btoa&&"function"==typeof btoa?btoa(e):void 0!==globalThis.Buffer?globalThis.Buffer.from(e).toString("base64"):e;e.s(["t",()=>n],81729);let l="pk_live_";function c(e){if(!e.endsWith("$"))return!1;let t=e.slice(0,-1);return!t.includes("$")&&t.includes(".")}function u(e,t={}){let r;if(!(e=e||"")||!d(e)){if(t.fatal&&!e)throw Error("Publishable key is missing. Ensure that your publishable key is correctly configured. Double-check your environment configuration for your keys, or access them here: https://dashboard.clerk.com/last-active?path=api-keys");if(t.fatal&&!d(e))throw Error("Publishable key not valid.");return null}let s=e.startsWith(l)?"production":"development";try{r=o(e.split("_")[2])}catch{if(t.fatal)throw Error("Publishable key not valid: Failed to decode key.");return null}if(!c(r)){if(t.fatal)throw Error("Publishable key not valid: Decoded key has invalid format.");return null}let i=r.slice(0,-1);return t.proxyUrl?i=t.proxyUrl:"development"!==s&&t.domain&&t.isSatellite&&(i=`clerk.${t.domain}`),{instanceType:s,frontendApi:i}}function d(e=""){try{if(!(e.startsWith(l)||e.startsWith("pk_test_")))return!1;let t=e.split("_");if(3!==t.length)return!1;let r=t[2];if(!r)return!1;return c(o(r))}catch{return!1}}function p(){let e=new Map;return{isDevOrStagingUrl:t=>{if(!t)return!1;let r="string"==typeof t?t:t.hostname,i=e.get(r);return void 0===i&&(i=s.some(e=>r.endsWith(e)),e.set(r,i)),i}}}e.s(["n",()=>p,"u",()=>u],72667)},8286,e=>{"use strict";let t=e=>{if(0==e.length)return"";if(1==e.length)return e[0];let t=e.slice(0,-1).join(", ");return t+`, or ${e.slice(-1)}`},r=/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;function s(e){return r.test(e||"")}function i(e){let t=e||"";return t.charAt(0).toUpperCase()+t.slice(1)}function a(e){return e?e.replace(/([-_][a-z])/g,e=>e.toUpperCase().replace(/-|_/,"")):""}function o(e){return e?e.replace(/[A-Z]/g,e=>`_${e.toLowerCase()}`):""}let n=e=>{let t=r=>{if(!r)return r;if(Array.isArray(r))return r.map(e=>"object"==typeof e||Array.isArray(e)?t(e):e);let s={...r};for(let r of Object.keys(s)){let i=e(r.toString());i!==r&&(s[i]=s[r],delete s[r]),"object"==typeof s[i]&&(s[i]=t(s[i]))}return s};return t},l=n(o),c=n(a);function u(e){if("boolean"==typeof e)return e;if(null==e)return!1;if("string"==typeof e){if("true"===e.toLowerCase())return!0;if("false"===e.toLowerCase())return!1}let t=parseInt(e,10);return!isNaN(t)&&t>0}function d(e){return Object.entries(e).reduce((e,[t,r])=>(void 0!==r&&(e[t]=r),e),{})}e.s(["a",()=>s,"c",()=>i,"i",()=>d,"l",()=>t,"n",()=>l,"o",()=>u,"r",()=>c,"s",()=>a,"t",()=>o])},41638,e=>{"use strict";var t=e.i(1753);e.s(["isDevelopmentEnvironment",()=>t.t])},25618,e=>{"use strict";var t=e.i(27436);e.i(66757),e.i(81729);var r=e.i(72667);let s=e=>{let s=(0,r.u)(e)?.frontendApi;return s?.startsWith("clerk.")&&t.i.some(e=>s?.endsWith(e))?t.c:t.o.some(e=>s?.endsWith(e))?t.a:t.d.some(e=>s?.endsWith(e))?t.u:t.c};e.s(["apiUrlFromPublishableKey",()=>s])},78424,21021,77225,82524,e=>{"use strict";e.i(293);var t=e.i(41638),r=e.i(47167),s=e.i(25618),i=e.i(8286);e.s([],21021);var a=i;e.s(["isTruthy",()=>a.o],77225);var a=i;r.default.env.NEXT_PUBLIC_CLERK_JS_VERSION,r.default.env.NEXT_PUBLIC_CLERK_JS_URL,r.default.env.NEXT_PUBLIC_CLERK_UI_URL,r.default.env.NEXT_PUBLIC_CLERK_UI_VERSION,r.default.env.CLERK_API_VERSION,r.default.env.CLERK_SECRET_KEY,r.default.env.CLERK_MACHINE_SECRET_KEY;let o=r.default.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY||"";r.default.env.CLERK_ENCRYPTION_KEY,r.default.env.CLERK_API_URL||(0,s.apiUrlFromPublishableKey)(o),r.default.env.NEXT_PUBLIC_CLERK_DOMAIN,r.default.env.NEXT_PUBLIC_CLERK_PROXY_URL,(0,a.o)(r.default.env.NEXT_PUBLIC_CLERK_IS_SATELLITE),r.default.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,r.default.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL;let n={name:"@clerk/nextjs",version:"7.0.4",environment:"production"};(0,a.o)(r.default.env.NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED),(0,a.o)(r.default.env.NEXT_PUBLIC_CLERK_TELEMETRY_DEBUG);let l=(0,a.o)(r.default.env.NEXT_PUBLIC_CLERK_KEYLESS_DISABLED)||!1;e.s(["KEYLESS_DISABLED",()=>l,"SDK_METADATA",()=>n],82524);let c=(0,t.isDevelopmentEnvironment)()&&!l;e.s(["canUseKeyless",()=>c],78424)},96211,e=>{"use strict";var t=e.i(18566),r=e.i(71645),s=e.i(78424);function i(i){var a;let o=(null==(a=(0,t.useSelectedLayoutSegments)()[0])?void 0:a.startsWith("/_not-found"))||!1;return(0,r.useEffect)(()=>{s.canUseKeyless&&!o&&e.A(94773).then(e=>e.syncKeylessConfigAction({...i,returnUrl:window.location.href}))},[o]),i.children}e.s(["KeylessCookieSync",()=>i])},98943,e=>{e.v(t=>Promise.all(["static/chunks/1d841c8293d2359e.js"].map(t=>e.l(t))).then(()=>t(37572)))},94773,e=>{e.v(t=>Promise.all(["static/chunks/0117ea004abc3196.js"].map(t=>e.l(t))).then(()=>t(23151)))}]);