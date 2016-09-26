/*
jGastonaEva-min.js = minify Eva.js + EvaLayout.js + LayoutManager.js + jGastona.js
part of open source project https://github.com/wakeupthecat/gastona

Copyright (C) 2015,2016 Alejandro Xalabarder Aulet
License : GNU General Public License (GPL) version 3

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.
*/

function evaFileObj(t){function e(t){var e,i="";for(e in t)i+="\n#"+e+"#\n",i+=n(t[e]);return i}function n(t){var e,n="";for(e in t)n+="\n   <"+e+">\n",n+=i(t[e]);return n}function i(t){var e="";for(var n in t){e+="      ";for(var i in t[n])i>0&&(e+=", "),i==t[n].length-1&&(e+="//"),e+=t[n][i];e+="\n"}return e}return"string"==typeof t&&(t=evaFileStr2obj(t)),{obj:t,toText:function(){return e(t)},toString:function(){return e(t)},evaFileObj2Text:e,evaUnitObj2Text:n,evaObj2Text:i}}function evaFile(t){alert("evaFile function name is deprecated! please use evaFileStr2obj instead"),evaFileStr2obj(t)}function evaFileUTF82obj(t){return evaFileStr2obj(decodeURIComponent(t.replace(/\+/g,"%20")))}function evaFileStr2obj(t){function e(t,e,n){if(0==t.indexOf(e)){var i=t.indexOf(n,1);return i>0?{name:t.substr(1,i-1),rest:t.substr(i+1).trim()}:void 0}}function n(t,e,n,i){if(t=t.trim(),e=t.length,0!=e){if(0==t.indexOf("'"))return[t.substr(1)];if(0==t.indexOf("//"))return[t.substr(2)];t.lastIndexOf(",")==e-1&&(t=t.substring(0,e-1)),n=t.split(",");for(i in n)n[i]=decodeURIComponent(n[i].trim());return n}}function i(t){function i(t){r&&(c[r]=g),r=void 0,g=[],t&&(a&&(l[a]=c),a=void 0,c=[])}var a,r,o,u,s,f,d,l={},c={},g=[],s=t;"string"==typeof t&&(s=t.split("\n"));for(d in s)u=s[d].trim(),o=e(u,"#","#"),o?(i(!0),a=o.name):(o=e(u,"<",">"),o&&(i(!1),r=o.name,u=o.rest,0==u.length)||a&&r&&(f=n(u),f&&g.push(f)));return i(!0),l}return"function"!=typeof String.prototype.trim&&(String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")}),i(t)}function EvaLayout(t,e){function n(t,e){function n(t){var e=s,n=0,i=0;return t+="",0==t.length||0==t.indexOf(g)?e=s:0==t.indexOf(v)?(e=f,n=t.length<2?1:parseInt(t.substr(1))):(e=u,i=parseInt(t)),{type:e,len:i,extraPercent:n}}function i(t,e){e=n(t||""),c.push(e),d+=e.extraPercent}function a(t,e){c[t]&&c[t].type==s&&(c[t].len=Math.max(c[t].len,e))}function r(n,i){l=t+t+e*(c.length-1);for(n in c)i=c[n],l+=i.len,d>0&&(i.extraPercent=i.extraPercent/d)}function o(t,n,i,a){for(a=0,i=i||n;(i>=n||-1==i)&&n<c.length;n++)a+=e+c[n].len+c[n].extraPercent*t;return a}var u=0,s=1,f=2,d=0,l=0,c=[];return{margin:t,gap:e,fixedSize:function(){return l},regla:c,addItem:i,setLengthOfItemAt:a,endItems:r,getLengthInRange:o,countItems:function(){return c.length}}}function i(t){return b[1][t+1]}function a(t){return b[2+t][0]}function r(){return b.length-2}function o(t){return b[2+t].length-1}function u(t,e){return t+=2,e+=1,t>=0&&t<b.length&&e>=0&&e<b[t].length?b[t][e]:void 0}function s(){if(!h){l=n(parseInt(b[0][1])||0,parseInt(b[0][3])||0),c=n(parseInt(b[0][2])||0,parseInt(b[0][4])||0);for(var e=0,s=r(),f=0;s>f;f++){e=o(f),c.addItem(a(f));for(var d=0;e>d;d++){d<l.countItems()||l.addItem(i(d));var g=u(f,d);if(g){var v=t.getLayableByName(g);if(v){v.indxPos.ileft=d,v.indxPos.itop=f;for(var x=d;e>x+1&&u(f,x+1)===m;)x++;for(e>x+1&&u(f,x+1)===m+m&&(x=-1),v.indxPos.iright=x,x==d&&l.setLengthOfItemAt(d,v.iniRect.right-v.iniRect.left),x=f;s>x+1&&u(x+1,d)===p;)x++;s>x+1&&u(x+1,d)===p+p&&(x=-1),v.indxPos.ibottom=x,x==f&&c.setLengthOfItemAt(f,v.iniRect.bottom-v.iniRect.top),v.isLaidOut=!0}}}}l.endItems(),c.endItems(),y.top=0,y.bottom=c.fixedSize(),y.left=0,y.right=l.fixedSize(),h=!0}}function f(e,n,i,a){s();for(var r=a-c.fixedSize(),o=i-l.fixedSize(),f=e+l.margin,d=0;d<l.countItems();d++){d>0&&(f+=l.getLengthInRange(o,d-1));for(var g=n+c.margin,v=0;v<c.countItems();v++){v>0&&(g+=c.getLengthInRange(r,v-1));var m=u(v,d);if(m){var p=t.getLayableByName(m);if(p)if(p.isLaidOut){var h=-l.gap,b=-c.gap;if(h+=l.getLengthInRange(o,p.indxPos.ileft,p.indxPos.iright),b+=c.getLengthInRange(r,p.indxPos.itop,p.indxPos.ibottom),0>f||0>g||0>h||0>b)continue;p.doMove(f,g,h,b),p.doShow(!0)}else p.doShow(!1)}}}}function d(e){s();for(var n=0;n<l.countItems();n++)for(var i=0;i<c.countItems();i++){var a=t.getLayableByName(u(i,n));a&&a.doShow(e)}}var l,c,g="A",v="X",m="-",p="+",h=!1,b=t.guiLayouts[e],y={left:0,right:200,top:0,bottom:20},x={ileft:0,iright:0,itop:0,ibottom:0};return b?b[0][0].match(/^eva$|^evalayout$/i)?{precalculateLayout:s,wName:e,isLaidOut:!1,iniRect:y,indxPos:x,invalidate:function(){h=!1},isWidget:!1,doMove:f,doShow:d}:void 0:void console.log('ERROR: no eva found with name "'+e+'"')}function layoutManager(t,e){function n(t,e,n){for(n in t)if(t[n]===e)return console.log("ERROR: layout element "+e+" already exists, it cannot be stacked!"),!1;return!0}function i(t){h&&h===t||a(),h=t}function a(t,e){for(e in I)t=I[e],t.isWidget?t.doShow(!1):t.invalidate()}function r(t,e){return{wName:t,isLaidOut:!1,iniRect:e||{left:0,right:200,top:0,bottom:20},indxPos:{ileft:0,iright:0,itop:0,ibottom:0},isWidget:!0,doMove:function(e,n,i,a){var r=document.getElementById(t);r?(r.style.position="absolute",r.style.left=Math.round(e)+"px",r.style.top=Math.round(n)+"px",r.style.width=Math.round(i)+"px",r.style.height=Math.round(a)+"px"):console.log("ERROR expected html element "+t+" not found!")},doShow:function(e){var n=document.getElementById(t);n&&(n.style.visibility=e?"visible":"hidden")}}}function o(t){if(""!==t&&d(t)){var e=I[f(t)];return e?(n(x,e.wName)&&(e.isWidget||e.precalculateLayout()),e):(console.log("ERROR: don't know how to find "+t+" or "+f(t)),r("bDummy"))}}function u(t,e){y[t]=e&&""!==e&&t!==e?e:void 0,p=!0,a()}function s(t){y[t]=void 0,p=!0,a()}function f(t){var e,n,i=[];if(!d(t))return t;do{if(e=y[t],!e||""===e||e===t)return t;for(n in i)if(i[n]===e)return console.log("ERROR: masks for "+t+" found circular!"),t;i.push(t),t=e}while(i.length<200);return console.log("ERROR: masks for "+t+" too deep!"),t}function d(t){return t&&0!=t.length?t.match(/^[^+-]/):!1}function l(){return{guiLayouts:v,guiConfig:m,getLayableByName:o}}function c(t){if(m={},v=t.layouts,!v){v={};var e=t.javaj;if(!e)return void console.log("Error: unit layouts not found!");for(var n in e)0==n.indexOf("layout of ")?v[n.substr(10)]=e[n]:m[n]=e[n]}p=!0,y={},x=[],I={};for(var i in v){var a=EvaLayout(l(),i);a&&(I[i]=a,console.log("adding layout id ["+i+"]"))}var n,o,u,s,f,c;for(i in v){n=v[i],u=n.length;for(var o=2;u>o;o++){f=n[o].length;for(var s=1;f>s;s++)c=n[o][s],d(c)&&(I[c]||(b(c),I[c]=r(c)))}}}function g(t,e,n,a,r){t=t||"main",i(t);var u=o(t);u&&(x.push(u.wName),u.doMove(e,n,a,r),x.pop())}var v,m,p,h,b=e||function(t){console.log("adding widget id ["+t+"]")},y={},x=[],I={};return c(t),{guiConfig:m,loadConfig:function(e){t=e,c(t)},maskLayoutId:u,unmaskLayoutId:s,doShowLayout:function(t,e,n){g(t,0,0,e,n)},setLayout:function(t){i(t)},doLayout:function(t,e){g(h,0,0,t,e)}}}function jGastona(evaConfig,existingPlaceId){function getWindowWidth(){return window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth}function getWindowHeight(){return window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight}function htmlElem(t){return"string"==typeof t?document.getElementById(t):t}function adaptaLayout(){if(layMan){var t=getWindowWidth()-15,e=getWindowHeight()-15,n=layMan.guiConfig.layoutWindowLimits;if(n&&n[0]){var i=parseInt("0"|n[0][0]),a=parseInt("0"|n[0][1]),r=parseInt("0"|n[0][2]),o=parseInt("0"|n[0][3]);t=Math.max(t,i),e=Math.max(e,a),r>0&&(t=Math.min(t,r)),o>0&&(e=Math.min(e,o))}layMan&&layMan.doLayout(t,e)}}function loadJast(t){if(javajzWidgets={},responseAjaxUnit={},dataUnit={},listixUnit={},layMan=void 0,t){if(dataUnit=t.data||{},listixUnit=t.listix||{},!corpiny){var e=existingPlaceId?existingPlaceId:"jGastonaStammHtmlElem";document.getElementById(e)||(document.body.innerHTML="<div id='"+e+"' style = 'position:relative;'></div>"),corpiny=document.getElementById(e)}for(corpiny||alert("ERROR no "+e+" no fun!");corpiny.hasChildNodes();)corpiny.removeChild(corpiny.firstChild);layMan=layoutManager(t,onAddWidget),adaptaLayout()}}function getCellEvaUnit(t,e,n,i){return t[e]?t[e][n||"0"][i||"0"]||"":""}function getDataCell(t,e,n){return getCellEvaUnit(dataUnit,t,e,n)}function setDataCell(t,e,n,i){dataUnit[t]||(dataUnit[t]=[[""]]),dataUnit[t][n||"0"]||(dataUnit[t][n||"0"]=[""]),dataUnit[t][n||"0"][i||"0"]=e||""}function setData(t,e){"string"==typeof e?setDataCell(t,e):Array.isArray(e)&&e.length>0&&Array.isArray(e[0])?dataUnit[t]=e:alert('Error: setData "'+t+'", the value is not a string nor looks like an eva variable');var n=getzWidgetByName(t);n&&updatezWidget(n)}function mensaka(t){var e=t.indexOf(" ");if(e>0){var n=t.substr(0,e),i=t.substr(e+1);if(javajzWidgets[n])return void(javajzWidgets[n][i]?javajzWidgets[n][i]():console.log("Error: widget "+n+" has no method '"+i+"'"))}var a=dataUnit["-- "+t]||listixUnit["-- "+t];return a?void executeListixFormat(a):void console.log('ignoring mensaka "'+t+'"')}function executeListixFormat(fbody){var strBody="";for(var ii in fbody)strBody+=fbody[ii]+"\n";eval(strBody)}function setVarTable_DimVal(t){var e=[["dimension","value"]];for(var n in t)e.push([t[n],getDataCell(t[n])]);dataUnit.varTable_DimVal=e}function setValueToElement(t,e){t&&("string"==typeof t.value?t.value=e:t.innerHTML=e)}function onAddWidget(t){if(t&&0!=t.length){var e,n=function(){this.innerHTML=dataUnit[t]?getDataCell(t):t.substr(1)},i=function(){setValueToElement(this,getDataCell(t))},a=function(){this.value=""},r=function(){this.style["background-image"]="url('"+getDataCell(t)+"')"},o=function(){dataUnit[t][0]=[this.value||"?"]},u=function(){dataUnit[t]=[[]];var e=this.value||"?",n=e.split("\n");for(var i in n)dataUnit[t][i]=[n[i]]},s=function(){mensaka(t)},f=dataUnit["class of "+t],d=f?f[0][0]:t;switch(d.charAt(0)){case"d":e=fabricaStandard("div",t,{"data!":n});break;case"n":e=fabricaStandard("a",t,{href:"login","data!":n});break;case"b":e=fabricaStandard("button",t,{onclick:s,"data!":n});break;case"e":e=fabricaStandard("input",t,{type:"text",onchange:o,"data!":i});break;case"u":e=fabricaStandard("input",t,{type:"file",onchange:s,"data!":a});break;case"m":e=fabricaStandard("div",t,{"data!":r}),e.style["background-position"]="center center",e.style["background-repeat"]="no-repeat",e.style["background-size"]="contain";break;case"p":e=fabricaStandard("input",t,{type:"password",onchange:o,"data!":i});break;case"l":e=fabricaStandard("label",t,{"data!":n});break;case"x":var l=function(){var t,e="";for(t in dataUnit[this.id])e+=dataUnit[this.id][t]+"\n";setValueToElement(this,e)};e=fabricaStandard("textarea",t,{"data!":l,onchange:u});break;case"t":var l=function(){for(var t,e,n,i,a,r=dataUnit[this.id];this.hasChildNodes();)this.removeChild(this.firstChild);t=document.createElement("table"),t.id=this.id+"-table";for(i in r)if("0"===i&&1==r[0].length&&""===r[0][0]);else{e=document.createElement("tr");for(a in r[i])n=document.createElement("0"===i?"th":"td"),setValueToElement(n,r[i][a]),e.appendChild(n);t.appendChild(e)}this.appendChild(t)};e=fabricaSimpleTable(t,{"data!":l});break;case"c":case"r":case"k":case"i":var c=[],g=[];for(var v in dataUnit[t])"0"!==v&&(g.push(dataUnit[t][v][0]||"?"),c.push(dataUnit[t][v][1]||"?"));var m=dataUnit[t+" orientation"]||"X";"c"==t.charAt(0)&&corpiny.appendChild(fabricaSelect(t,g,c,!1)),"i"==t.charAt(0)&&corpiny.appendChild(fabricaSelect(t,g,c,!0)),"r"==t.charAt(0)&&corpiny.appendChild(fabricaGrupo("radio",m,t,g,c)),"k"==t.charAt(0)&&corpiny.appendChild(fabricaGrupo("checkbox",m,t,g,c))}e&&(javajzWidgets[t]=e,corpiny.appendChild(e),updatezWidget(e),dataUnit[t]||(dataUnit[t]=[[""]]))}}function getzWidgetByName(t){return javajzWidgets[t]}function updatezWidget(t){t&&(t["data!"]?t["data!"]():alert("ERROR (updateWidget) zwidget /"+t.id+"/ with no 'data!' message"))}function str2jsVar(str){var str2="";if("string"!=typeof str)for(var ii=0;ii<str.length;ii++)str2=(0===ii?"":str2+"\n")+str[ii];else str2=str;return str2.match(/^\s*[\"\']/)?str2.substr(1):str2.match(/^\s*[\[\{]/)?eval("(function () { return "+str2+";}) ()"):function(){eval(str2)}}function fabricaStandard(t,e,n){var i=document.createElement(t);i.id=e,i.style.visibility="hidden",i.spellcheck=!1;for(var a in n)i[a]=n[a];"input"!==t||dataUnit[e]||(dataUnit[e]=[[""]]);for(var r in dataUnit)if(r.startsWith(e+" ")){var o=r.substr(e.length+1),u=dataUnit[r];i[o]=str2jsVar(u)}return i}function fabricaCombo(t,e,n){return fabricaSelect(t,e,n,!1)}function fabricaList(t,e,n){return fabricaSelect(t,e,n,!0)}function selectAllColumnsFromTable(t,e,n){if(t&&t[e]&&t[e][0])for(var i=t[e][0],a=1;a<t[e].length;a++)if(t[e][a][0]==n)for(var r in i)t[e+" selected."+i[r]]=[[t[e][a][r]||"?"]]}function fabricaSelect(t,e,n,i){var a=document.createElement("select");i&&(a.multiple="si"),a.id=t,a.style.visibility="hidden",a.onchange=function(){selectAllColumnsFromTable(dataUnit,t,this.value||"?"),dataUnit[t+"_value"]=[[this.value||"?"]],mensaka(t)};for(var r in e){var o=document.createElement("option");o.value=e[r],o["data!"]=function(){},o.appendChild(document.createTextNode(n[r])),a.appendChild(o)}return a}function fabricaGrupo(t,e,n,i,a){var r=document.createElement("div");r.id=n,r.style.visibility="hidden",r.onchange=function(){mensaka(n)};for(var o in i){var u=document.createElement("input");u.type=t,u.name=n,u.value=i[o],u.label=a[o],u["data!"]=function(){},u.onchange=function(){dataUnit[n+" selected.value"]=[[this.value||"?"]],dataUnit[n+" selected.label"]=[[this.label||"?"]],dataUnit[n+"_value"]=[[this.value||"?"]]},"0"===o||"Y"!=e&&"V"!=e||r.appendChild(document.createElement("br")),r.appendChild(u),r.appendChild(document.createTextNode(a[o]))}return r}function fabricaSimpleTable(t,e){var n=document.createElement("div");n.id=t,n.widgetype="t",n.style.visibility="hidden";for(var i in e)n[i]=e[i];return n}function canUploadFile(t,e,n,i){var a=htmlElem(t),r=a.files[0],o=e;return r&&""!==r?o&&o>0&&r.size>1024*o*1024?(""!==i&&alert(i?i:"File is too big to be uploaded, limit is "+e+" MB"),!1):!0:(""!==n&&alert(n?n:"Please choose first a file!"),!1)}function jaxGetHttpReq(){return window.XMLHttpRequest?new XMLHttpRequest:window.ActiveXObject?new ActiveXObject("Microsoft.XMLHTTP"):void alert("Your browser does not support AJAX!")}function startsWith(t,e){return t.slice(0,e.length)===e}function jaxDefaultResponseFunc(t,e){var n="unitAjaxResponse";responseAjaxUnit=startsWith(t,"#"+n+"#")?evaFileStr2obj(t)[n]||{}:{"ajaxRESP-rawBody":[[t]]};var i,a=1;do i=e.getResponseHeader("ajaxRESP-parameter"+a),i&&(responseAjaxUnit["ajaxRESP-parameter"+a]=[[i]]),a++;while(i)}function AJAXFormatBody(t,e,n,i){function a(t){return!i&&dataUnit[e[t]]&&1==dataUnit[e[t]].length&&1==dataUnit[e[t]][0].length?[[encodeURIComponent(dataUnit[e[t]])]]:dataUnit[e[t]]||""}var r;if(n=n||"eva",!e){e=[];for(var o in dataUnit)e.push(o)}var u="";if("propval"===n)for(r in e)u+="\n"+e[r]+":"+a(r);else if("json"===n){u="{";for(r in e)u+="'"+e[r]+"' : '"+a(r)+"', ";u+="}"}else if("eva"===n){var s=evaFileObj("#unitAjaxRequest#\n"),f=s.obj.unitAjaxRequest;for(r in e)f[e[r]]=a(r);u=s.toText()}else alert("ERROR: calling AJAXFormatBody with not supported format ["+n+"]");return u}function ajaxGenericPreProcessResponse(){}function AJAXgenericPost(t,e,n,i){var a=jaxGetHttpReq();if(!a)return!1;if(i||(i=jaxDefaultResponseFunc),a.onreadystatechange=function(){4==a.readyState&&200==a.status&&(ajaxGenericPreProcessResponse(a),i(a.responseText,a),mensaka("ajaxResponse "+t))},a.open("POST",t,!0),n)for(var r in n)a.setRequestHeader(r,n[r]);a.send(e)}function AJAXSendData(t,e,n,i){var a="string"==typeof e?e:AJAXFormatBody(t,e,n,i);AJAXgenericPost(t,a)}function AJAXUploadFile(t,e,n){if(!t)return!1;var i=htmlElem(t),a=i.files[0];if(!a||""===a)return!1;var r=new FormData;r.append("filename",a),AJAXgenericPost(e,r,n)}function AJAXLoadRootJast(t){AJAXgenericPost("loadRootJast","",{"ajaxREQ-jastName":t},function(t){loadJast(evaFileStr2obj(t))})}function setContentsFromBody(t,e,n){var i="";if(n){for(var a=e.split("\n"),r=0;r<a.length;){var o=/([^:]*):(.*)/.exec(a[r++]);if(o){if(""===o[1])break;setData(o[1],o[2])}}for(var u=r;u<a.length;u++)i=i+(u!=r?"\n":"")+a[u]}else i=e;var s=document.getElementById(t);s&&setValueToElement(s,i)}function AJAXgetIdContent(t,e,n){var i="string"==typeof e?{"ajaxREQ-param":e}:e||{};i["ajaxREQ-id"]=t,AJAXgenericPost("getIdContent","",i,function(e){setContentsFromBody(t,e,n)})}function AJAXgetIdMultipleContents(t,e){AJAXgetIdContent(t,e,!0)}var dataUnit,listixUnit,corpiny,layMan,responseAjaxUnit,javajzWidgets,minWidth=-1,minHeight=-1;return loadJast(evaConfig),document.body.onresize=function(){adaptaLayout()},{getLayoutMan:function(){return layMan},mensaka:mensaka,getIdValue:function(t){var e=document.getElementById(t);return e?e.value:getDataCell(t)},getData:getDataCell,setData:setData,setVarTable_DimVal:setVarTable_DimVal,getCellEvaUnit:getCellEvaUnit,adapta:adaptaLayout,mask:function(t,e){layMan&&(layMan.maskLayoutId(t,e),adaptaLayout())},unmask:function(t){layMan&&(layMan.unmaskLayoutId(t),adaptaLayout())},htmlElem:htmlElem,canUploadFile:canUploadFile,getAjaxResponse:function(){return responseAjaxUnit},AJAXPost:AJAXgenericPost,AJAXSendData:AJAXSendData,AJAXSendBody:AJAXSendData,AJAXUploadFile:AJAXUploadFile,AJAXLoadRootJast:AJAXLoadRootJast,AJAXgetIdContent:AJAXgetIdContent,AJAXgetIdMultipleContents:AJAXgetIdMultipleContents}}