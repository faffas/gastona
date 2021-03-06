/*
Copyright (C) 2015,2016,2017,2018 Alejandro Xalabarder Aulet
License : GNU General Public License (GPL) version 3

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.
*/

/**
   @author Alejandro Xalabarder
   @date   2015.07.26

   @file   jGastona.js

   @desc
      Logic in javascript emulating as close as possible the one
      used in gastona + javaj + listix + mensaka in gastona java project

      what is implemented is

         - automatic generation of html widgets and layout (#javaj# unit)

               'd': // div
               'n': // link (login ?)
               'b': // button
               'e': // text input
               'u': // upload file selector
               'm': // image
               'p': // password
               'h1': header
               'h2': header
               'h3': header
               'l': // label
               'x': // text area
               't': // simple table
               'c': // combo
               'r': // radio group
               'k': // checkbox group
               'i': // list


         - creation of data model and binding with widgets (#data# unit + widgets in #javaj#)

         - handling of messages : msg to widgets, msg from widgets, msg responseAjax

         - AJAX facility methods : httPack and AJAXSend


*/

//"use strict";

function jGastona (evaConfig, existingPlaceId)
{
   "use strict";
   var dataUnit,
       listixUnit,
       corpiny,
       isStammLayout = false, // only if it will occupy the whole window area
       layMan,
       javajzWidgets       // of widgetFactory
       ;
   var minWidth = -1;
   var minHeight = -1;

   var AJAX_RESPONSE_MESSAGE = "ajaxResponse";       // mensaka's message for a post (e.g. to be handle with < -- ajaxResponse myPost>)

   // 2018.03.17
   //  a jGastona object has to be started explicitly, for instance
   //
   //    var jast = jGastona (...);
   //    jast.start (); // or jast.run ();
   //
   // this gives more flexibility, for instance it allows more objects to be loaded and
   // be prepared for a future use. Also very importantly it allows to reference the
   // object (e.g. jast) from a external script that may be called by the very first listix "main" entry.
   // If the object where started automatically, as it was done before, the code of "main"
   // would be called before the variable "jast" exists causing an error if any extern function tries to use
   // it at that time.
   //
   var started = false;
   function start ()
   {
      started = true;
      loadJast (evaConfig, existingPlaceId);
      window.addEventListener("resize", adaptaLayout);
   }

   setTimeout (function () {
         if (! started) {
            start ();
            console.error ("ERROR! jGastona: jast has been started by timeout!.\nThis \"compatibility feature\" will be deprecated since now a jGastona object has to be started explicitly (e.g. jgast.start ();)");
         }
      },
      100
      );

   return {
      // public functions to export

      start              : start,
      run                : start,      // alias of start
      getLayoutMan       : function () { return layMan; },
      mensaka            : mensaka,
      getIdValue         : getIdValue,
      getData            : getData,
      getDataAsTextArray : getDataAsTextArray,
      getDataCell        : getDataCell,
      setData            : setData,
      setDataCell        : setDataCell,
      setVarTable_DimVal : setVarTable_DimVal,
      getCellEvaUnit     : getCellEvaUnit,
      adapta             : adaptaLayout,
      mask               : mask,
      unmask             : unmask,
      htmlElem           : htmlElem,
      canUploadFile      : canUploadFile,

      // part ajax ...
      //
      AJAXAnyMethodRaw : AJAXAnyMethodRaw,
      AJAXPostRaw      : AJAXPostRaw,
      AJAXSend         : AJAXSend,            // send data as eva, json or prop:value
      AJAXUploadFile   : AJAXUploadFile,      // upload one file (NOTE: only one file!)
      AJAXLoadRootJast : AJAXLoadRootJast,    // ask the server for a jast file to be loaded
      AJAXgetDataForId : AJAXgetDataForId,    // ask the server for content for the id, on resposte the content will be updated automatically

      // getDataUnit    : function () { return dataUnit; }
   };

   function str2lineArray (str) { return str.replace(/\r\n/g, "\r").replace(/\n/g, "\r").split(/\r/); }

   function getWindowWidth ()
   {
      return isStammLayout ?
             // due to IE compatib.
             (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) - 15:  // 15 is an empiric number ...
             corpiny.offsetWidth;
   }

   function getWindowHeight ()
   {
      return isStammLayout ?
             // due to IE compatib.
             (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 15: // 15 is an empiric number ...
             corpiny.offsetHeight;
   }

   function getIdValue (id)
   {
      var ele = document.getElementById(id);
      return (ele) ? ele.value : getDataCell (id);
   }

   // shorcuts
   function mask (a, b)
   {
      if (layMan) {
         layMan.maskLayoutId (a, b);
         adaptaLayout ();
      }
   }

   function unmask (a)
   {
      if (layMan && layMan.unmaskLayoutId (a)) {
         adaptaLayout ();
         return true;
      }
      return false;
   }

   function isEvaValue (eva)
   {
      // is an array >0 of arrays
      return Array.isArray (eva) && eva.length > 0 && Array.isArray (eva[0]);
   }

   function isEvaSingleValue (eva)
   {
      // contains only one row and one column
      return isEvaValue (eva) && eva.length == 1 && eva[0].length == 1;
   }


   function isEvaEmpty (eva)
   {
      // contains only one row and one column and its value is ""
      return isEvaSingleValue (eva) && eva[0][0] === "";
   }

   function strStartsWith (s1, s2, pos)
   {
      pos = pos || 0;
      return s1.indexOf(s2, pos) === pos;
      //return s1.slice(0, s2.length) === s2;

      // thisdoes not work for IE8, 9
      //
      //if (!String.prototype.startsWith) { String.prototype.startsWith = function(seas, pos) { pos = pos || 0; return this.indexOf(seas, pos) === pos; }; }
   }

   function htmlElem (elmeOrId)
   {
      if (typeof elmeOrId === "string")
         return document.getElementById (elmeOrId);
      return elmeOrId;
   }

   function adaptaLayout ()
   {
      if (!layMan) return;
      var dx = getWindowWidth ();
      var dy = getWindowHeight ();

      var lali = layMan.guiConfig["layoutWindowLimits"]; // <layoutWindowLimits> mindx, mindy, maxdx, maxy
      if (lali && lali[0])
      {
         // note: lali[0] is the first row of the variable (the only one)
         //
         var mindx = parseInt(lali[0][0]|"0");
         var mindy = parseInt(lali[0][1]|"0");
         var maxdx = parseInt(lali[0][2]|"0");
         var maxdy = parseInt(lali[0][3]|"0");
         dx = Math.max (dx, mindx);
         dy = Math.max (dy, mindy);
         if (maxdx > 0) dx = Math.min (dx, maxdx);
         if (maxdy > 0) dy = Math.min (dy, maxdy);
      }

      if (layMan)
         layMan.doLayout(dx, dy);
   }

   function loadJast (evaConfig, placeId)
   {
      javajzWidgets = {};
      dataUnit = {};
      listixUnit = {};
      layMan = undefined;

      if (! evaConfig ) return;

      dataUnit = evaConfig["data"] || {};
      listixUnit = evaConfig["jListix"] || evaConfig["jlistix"] || evaConfig["listix"] || {};

      // ensure corpinyo (STAMM) is a root element in the document's body
      //
      if (!corpiny)
      {
         var baseId = placeId||"jGastonaStammHtmlElem";
         if (!document.getElementById(baseId)) {
            document.body.innerHTML = "<div id='" + baseId + "' style = 'position:relative;'></div>";
            isStammLayout = true;
         }
         corpiny = document.getElementById(baseId);
      }
      if (!corpiny) {
         console.error ("no baseId can be found!");
         return;
      }

      // remove last main jast layout if any
      // here candidate to push instead
      while (corpiny.hasChildNodes())
      {
         corpiny.removeChild(corpiny.firstChild);
      }

      // load all components and return the manager
      //
      layMan = layoutManager (evaConfig, onAddWidget);
      adaptaLayout ();

      //do the first task : "main" if exists
      var fmain = listixUnit["main"];
      if (fmain)
         executeListixFormat (fmain);
   }

   function getCellEvaUnit (unit, eva, row, col)
   {
      return unit[eva] ? unit[eva][row||"0"][col||"0"]||"": "";
   }

   function getData (name)
   {
      return !dataUnit[name] ? undefined: dataUnit[name];
   }

   function getDataAsTextArray (name)
   {
      var eva = getData (name);

      var sal = [];
      for (var ii in eva)
         sal.push (eva[ii][0]);
      return sal;
   }

   function getDataCell(name, row, col)
   {
      return getCellEvaUnit (dataUnit, name, row, col);
   }

   function setDataCell (name, value, row, col)
   {
      row = row||"0";
      col = col||"0";
      // create variable if needed
      if (!dataUnit[name])
         dataUnit[name] = [[""]];

      // create row if needed
      if (!dataUnit[name][row])
         dataUnit[name][row] = [ "" ];

      dataUnit[name][row][col] = value||"";
   }

   // set the value into the data variable "name"
   // being value either a string or an eva variable
   // after that send the message data! to the widget "name" if exists
   //
   function setData (name, value)
   {
      // create on demand
      if (typeof value === "string")
      {
         dataUnit[name] = [[""]];
         setDataCell (name, value);
      }
      else if (isEvaValue (value))
      {
         dataUnit[name] = value;
      }
      else
      {
         alert ("Error: setData \"" + name  + "\", the value is not a string nor looks like an eva variable");
      }

      //2017.11.05 more general approach, even if no widget associated we send the message "name data!"
      //           if there is a widget associated then two things will happen, widget update plus message
      //..
      //.. deliverMsgToWidget (getzWidgetByName (name));
      mensaka (name + " data!");
   }

   function mensaka (msg)
   {
      // handling messages for widgets i.e. "zwidget data!" (update data of zwidget)
      // (javaj task)
      var ii = msg.indexOf (" ");
      if (ii > 0)
      {
         var wnam = msg.substr (0,ii); // widget name i.e. "bBoton"
         var wmet = msg.substr (ii+1); // method      i.e. "data!"

         deliverMsgToWidget (getWidgetByName (wnam), wmet);
         //2017.11.05 more general approach
         //           continue since maybe the user (listix) is notified to the widget message as well
         // // if (deliverMsgToWidget (getWidgetByName (wnam), wmet))
         // //     return;
      }

      // look for the variable <-- message>, first in data else in listix
      // (listix task)
      // Note : here it is done in an "interpreter fashion",
      //        another approach is to generate proper functions and listeners previosly
      //
      var fbody = dataUnit["-- " + msg] || listixUnit["-- " + msg];
      if (! fbody)
      {
         // message not subscribed! ignore it
         // console.log ("ignoring mensaka \"" + msg  + "\"");
         return;
      }

      executeListixFormat (fbody);
   }

   function executeListixFormat (fbody)
   {
      // by now a listix or jlistix format is just an array of text containing javascript code
      // so we join it all and call eval
      //
      eval (fbody.join ("\n"));
   }

   // ============ DATA AND VARIABLES HANDLING
   //
   function setVarTable_DimVal (arrVarNames)
   {
      var vara = [[ "dimension", "value" ]];
      for (var fi in arrVarNames)
      {
         vara.push ( [ arrVarNames[fi], getDataCell (arrVarNames[fi]) ]);
      }

      dataUnit["varTable_DimVal"] = vara;
   }


   // --------- START PART widgetFactory
   //

   function setValueToElement (element, valueStr)
   {
      if (element)
      {
         if (typeof element.value === "string")
              element.value = valueStr;
         else element.innerHTML = valueStr;
      }
   }

   function onAddWidget (name)
   {
      if (! name || name.length == 0) return;

      var zwid;

      //  var2Text ("eThisIsAText")); ==> "This Is A Text"
      //  var2Text ("eThis_is_a_text")); ==> "This is a text"
      function var2Text (name)
      {
         if (name.length <= 2) return "";
         var sal = name[1];

         for (var ii = 2; ii < name.length; ii ++)
         {
            if (name[ii] == '_')
              sal += " ";
            else {
               if (name[ii] < 'Z' && sal[sal.length-1] != ' ')
                  sal += " ";
               sal += name[ii];
            }
         }
         return sal;
      }

      var updateSimpleLabel = function () {
         this.innerHTML = (dataUnit[name] ? getDataCell (name) : var2Text (name));
      }
      var updateSimpleLabel2 = function () {
         this.innerHTML = (dataUnit[name] ? getDataCell (name) : var2Text (name.substr(1)));
      }
      var updateSimpleValue = function () {
         setValueToElement (this, getDataCell (name));
      }
      var updateSimpleSrc = function () {
         this.src = getDataCell (name);
      }
      var updateResetValue = function () {
         this.value = '';
      }
      var updateImage = function () {
         // this.src = getDataCell (name);
         //console.log ("setting background image for " + name + " [" + getDataCell (name) + "]");
         this["style"]["background-image"] = "url('" + getDataCell (name) + "')";
      }

      var signalName = function () {
         mensaka(name);
      }
      var assignValue = function () {
         dataUnit[name][0] = [ this.value||"?" ];
         signalName ();
      };
      var assignText = function ()
                       {
                           dataUnit[name] = [ [ ] ];
                           var text = this.value||"?";
                           var rows = str2lineArray (text);
                           for (var rr in rows)
                              dataUnit[name][rr] = [ rows[rr] ];

                           signalName ();
                       };

      var hayClassOf = dataUnit["class of " + name];
      var widgetclass = hayClassOf ? hayClassOf[0][0] : name;

      switch (widgetclass.charAt (0))
      {
         case 'd':
            zwid = fabricaStandard ("div", name, { "data!": updateSimpleLabel  } );
            break;
         case 'n':
            zwid = fabricaStandard ("a", name, { href: "login", "data!": updateSimpleLabel } );
            break;
         case 'b':
            zwid = fabricaStandard ("button", name, { onclick: signalName, "data!": updateSimpleLabel } );
            break;
         case 'e':
            zwid = fabricaStandard ("input", name, { type: "text", onchange: assignValue, placeholder: var2Text(name), "data!": updateSimpleValue } );
            break;

         // --- Note about widget class for submit button
         //    this could be handled with an extra widget class, implementing it as
         //    zwid = fabricaStandard ("input", name, { type: "submit", ...
         //    but this is not necessary since we can use a button ('b') and set its property "type" to submit
         //    for example
         //          <bSendIt type> //submit


         // --- Note about upload (choose file) widget class
         // As stated by the Chrome error message if we try to set a value different than empty string to this element
         // "Failed to set the 'value' property on 'HTMLInputElement': This input element accepts a filename, which may only be programmatically set to the empty string."
         //
         case 'u':
            zwid = fabricaStandard ("input", name, { type: "file", onchange: signalName, "data!": updateResetValue } );
            break;

         case 'm': // image
            // zwid = fabricaStandard ("img", name, { "data!": updateImage } );
            zwid = fabricaStandard ("div", name, { onclick: signalName, "data!": updateImage } );
            zwid.style["background-position"] = "center center";
            zwid.style["background-repeat"] = "no-repeat";
            zwid.style["background-size"] = "contain";
            break;

         case 'p': // password
            zwid = fabricaStandard ("input", name, { type: "password", placeholder: "password", onchange: assignValue, "data!": updateSimpleValue } );
            break;

         //(o) TOCHECK: some strange thing happen when two h's are put beside in EVALAYOUT
         case 'h':
            if (widgetclass.length >= 2)
               zwid = fabricaStandard ("h" + widgetclass.charAt (1), name, { "data!": updateSimpleLabel2 } );
            break;

         case 'l':
            zwid = fabricaStandard ("label", name, { "data!": updateSimpleLabel } );
            break;

         case 'x':
            {
               var updata = function () {
                     var tex = "", row;
                     if (!isEvaEmpty (dataUnit[this.id]))
                        for (row in dataUnit[this.id])
                           tex += dataUnit[this.id][row] + "\n";
                     setValueToElement (this, tex);
                  }
               zwid = fabricaStandard ("textarea", name, { placeholder: var2Text(name), "data!": updata, onchange: assignText } );
            }
            break;


         case 't': // simple table
            {
               var updata = function () {
                     var etabla, rowele, colele, row, col, evaData = dataUnit[this.id];

                     // create new html table
                     while (this.hasChildNodes())
                     {
                        this.removeChild(this.firstChild);
                     }

                     etabla = document.createElement ("table");
                     etabla["id"] = this.id + "-table"; // e.g <div id="tMiTabla"> <table id="tMitabla-table">...

                     for (row in evaData)
                     {
                        if (isEvaEmpty (evaData))
                        {
                           // row === "0" only one column and empty ==> no headers
                           // no headers!
                        }
                        else
                        {
                           rowele = document.createElement ("tr");

                           for (col in evaData[row])
                           {
                              colele = document.createElement (row === "0" ? "th": "td");

                              // use instead ? colele.value = evaData[row][col];
                              setValueToElement (colele, evaData[row][col]);
                              rowele.appendChild (colele);
                           }
                           etabla.appendChild (rowele);
                        }
                     }
                     this.appendChild (etabla);
                  }
               zwid = fabricaSimpleTable (name, { "data!": updata });
            }
            break;

         case 'c': // combo
         case 'r': // radio group
         case 'k': // checkbox group
         case 'i': // list
            {
               var labels = [], values = [];
               var indxLabel = 0, indxValue = 0;

               // Now assume list of "value, label" for the data (with column names in the first row!)
               //
               for (var row in dataUnit[name])
               {
                  if (row === "0")
                  {
                     indxLabel = dataUnit[name][row].indexOf ("label");
                     if (indxLabel == -1) indxLabel = 0;
                     indxValue = dataUnit[name][row].indexOf ("value");
                     if (indxValue == -1) indxValue = 0;
                  }
                  else
                  {
                     values.push (dataUnit[name][row][indxValue]||"?");
                     labels.push (dataUnit[name][row][indxLabel]||"?");
                  }
               }
               var orient = dataUnit[name + " orientation"]||"X";

               //(o) TODO/jGastona/fabrica_zWidgets why not ?  zwid = fabricaSelectList (...

               if (name.charAt (0) == 'c')
                  corpiny.appendChild (fabricaSelectList (name, values, labels, false));
               if (name.charAt (0) == 'i')
                  corpiny.appendChild (fabricaSelectList (name, values, labels, true));
               if (name.charAt (0) == 'r')
                  corpiny.appendChild (fabricaGrupo ("radio", orient, name, values, labels));
               if (name.charAt (0) == 'k')
                  corpiny.appendChild (fabricaGrupo ("checkbox", orient, name, values, labels));
            }
            break;
      }

      if (zwid)
      {
         // collect it
         javajzWidgets[name] = zwid;
         corpiny.appendChild (zwid);

         deliverMsgToWidget (zwid, "data!");

         // experimental! all widgets need data!
         if (!dataUnit[name])
            dataUnit[name] = [ [ "" ] ];
      }
   }

   function getWidgetByName (widName)
   {
      return javajzWidgets[widName];
   }

   //alias
   function getzWidgetByName (nam) { return getWidgetByName (nam); }


   function deliverMsgToWidget (zwidget, msg)
   {
      if (! zwidget) return false;

      if (zwidget[msg]) {
         zwidget[msg] (); // update data
         return true;
      }
      alert ("ERROR (updateWidget) zwidget /" + zwidget.id + "/ with no 'data!' message");
      return false;
   }


   function updatezWidget (zwidget)
   {
      //2017.11.05
      mensaka (zwidget + " data!");

      //  if (! zwidget) return;
      //
      //  if (zwidget["data!"])
      //     zwidget["data!"] (); // update data
      //  else
      //     alert ("ERROR (updateWidget) zwidget /" + zwidget.id + "/ with no 'data!' message");
   }

   // converts a string into a "string", "object" or js "function"
   // var str = str2jsVar ("\"sisie");
   // var arr = str2jsVar ("[ 'sisie', 'nono', 234, [1, 2] ]");
   //
   function str2Var (str)
   {
      var str2 = "";
      if (typeof str !== "string")
      {
         // array of strigs = text ?
         //
         str2 = str.join ("\n");
      }
      else str2 = str;

      // old style string (to be deprecated!)
      //
      if (str2.match(/^\s*[\"\']/))
         return str2.substr(1);

      // array [] or object {}
      //
      if (str2.match(/^\s*[\[\{]/))
         return eval ("(function () { return " + str2 + ";}) ()");

      // simply as string
      return str2;
   }

   function fabricaStandard (typestr, name, atts)
   {
      var ele = document.createElement (typestr);   // "label" "button" etc
      ele["id"] = name;
      ele.style.visibility = "hidden";
      ele.spellcheck = false; // per default FALSE !!!
      for (var aa in atts)
      {
         ele[aa] = atts[aa];
      }

      // ensure a variable in data unit if not already exists
      // for the value (NOTE: for some reason it does not work for typestr === "textarea")
      if (typestr === "input" && !dataUnit[name])
         dataUnit[name] = [[ "" ]];

      // Interpret attributes of element as follows
      //
      //                           action to do
      //    <elem onXXXX>  val     elem.onXXXX = val (function)
      //    <elem class>   val     elem.className = val
      //    <elem +class>  val     elem.className += (" " + val)
      //    <elem other>   val     elem.other = val
      //

      for (var dd in dataUnit)
      {
         // i.e. <eText class> //'btn
         // i.e. <eText onchange> //alarm("me change!");
         if (strStartsWith (dd, name + " "))
         {
            var attrib = dd.substr(name.length + 1);
            var value = dataUnit[dd];

            if (strStartsWith (attrib, "on")) {
               // notification to some event (e.g. "onkeyup", "onwheel" etc)
               //
               ele.addEventListener (attrib.substr(2),
                     function () {
                        // we must ensure that data of widget is reflected in dataUnit
                        // before doing anything with it for example "onkeyup" may occur before an
                        // onchange which sets automatically the data to the dataUnit
                        if (attrib !== "onchange" && ele["onchange"])
                              ele.onchange ();
                        eval (str2Var (value));
                     });
            }
            else if (attrib == "class") {
               ele.className = value;
            }
            else if (attrib == "+class") {
               ele.className += (" " + value);
            }

            try {
               // This try catch is only due to IE11, for example if value is "date"
               // it would cause "invalid argument" error and NOTHING will be shown
               // this may happen in more places, should we do a try catch erverywhere !?
               //
               ele[attrib] = str2Var (value);
            } catch (err) {}
         }
      }

      // if (text)
      //   ele.appendChild (document.createTextNode(text));

      return ele;
   }

   //== selectAllColumnsFromTable
   // <mytable>
   //        value, name          , phone
   //        01   , my first name , 88888
   //        02   , second        , 77777
   //
   // selectAllColumnsFromTable (unit, "mytable", "01");
   // produces setting the variables
   //
   //    <mytable selected.id> 01
   //    <mytable selected.name> my first name
   //    <mytable selected.phone> 88888
   //
   function selectAllColumnsFromTable (unit, name, strvalue)
   {
      if (!unit || !unit[name] || !unit[name][0]) return false;
      var colnames = unit[name][0];

      var indxVal = colnames.indexOf ("value");
      if (indxVal === -1) indxVal = 0;

      // clean all <name selected.column> variables
      for (var col in colnames)
         delete unit[name + " selected." + colnames[col]];

      //search the row with the value (unique id) at position 0
      for (var rosel = 1; rosel < unit[name].length; rosel ++)
      {
         if (unit[name][rosel][indxVal] === strvalue)
         {
            for (var col in colnames)
               unit[name + " selected." + colnames[col]] = [[ unit[name][rosel][col]||"?" ]];

            return true;
         }
      }
      return false;
   }

   // set all the variables for all column names <name seleted.columnname>
   // the single variable <name_value> and send the mensaka message "name"
   // or remove the variables if no value is selected (deselecting last item in a list)
   //
   function whenChangeTableSelection (name, value)
   {
      if (selectAllColumnsFromTable (dataUnit, name, value||"?"))
           dataUnit[name + "_value"] = [[ value||"?" ]]; // to have a single variable
      else delete dataUnit[name + "_value"];
      mensaka(name)
   }

   // for lists and combos
   //
   function fabricaSelectList (name, arrOp, arrLab, ismultiple)
   {
      var ele = document.createElement ("select");
      if (ismultiple)
         ele["multiple"] = "si";

      ele["id"] = name;
      ele.style.visibility = "hidden";
      ele.addEventListener ("change", function () { whenChangeTableSelection (name, this.value); });
      for (var ite in arrOp)
      {
         var subele = document.createElement ("option");
         subele["value"] = arrOp[ite];
         subele["data!"] = function () { }; //(o) TOREVIEW_jGastona_update message in subelements, is it really needed ?

         subele.appendChild (document.createTextNode(arrLab[ite]));
         ele.appendChild (subele);
      }

      return ele;
   }

   // for checkbox and radio groups
   //
   function fabricaGrupo (tipo, orient, name, arrOp, arrLab)
   {
      var ele = document.createElement ("div");
      ele["id"] = name;
      ele.style.visibility = "hidden";
      
      // *** Own width calculation
      // we have to estimate width, for some reason if not specified 
      // width (offsetWidth) per default is the whole width whereas the height is
      // correctly calculated from the content.
      var widthEstim = 0;

      //cannot do this here like in fabricaSelect, but to be done on each element
      //ele.addEventListener ("change", function () { whenChangeTableSelection (name, this.value); });
      for (var ite in arrOp)
      {
         var subele = document.createElement ("input");
         subele["type"] = tipo;
         subele["name"] = name;
         subele["value"] = arrOp[ite];
         subele["label"] = arrLab[ite];

         // a more accurate measure has to take into account the final font
         // which might be not know right now (?!)
         var estimW = 12 * subele["label"].length; // mean 12px per char
         
         subele["data!"] = function () { };
         subele.addEventListener ("change", function () { whenChangeTableSelection (name, this.value); });
         if (ite !== "0" && (orient == "Y" || orient == "V")) {
            ele.appendChild (document.createElement ("br"));
            widthEstim = Math.max (widthEstim, estimW);
         }
         else {
            widthEstim += estimW;
         }
         ele.appendChild (subele);
         ele.appendChild (document.createTextNode(arrLab[ite]));
      }
      ele.style.width = widthEstim + "px";

      return ele;
  }

  function fabricaSimpleTable (name, atts)
  {
      var ele = document.createElement ("div");
      ele["id"] = name;
      ele["widgetype"] = "t"; // to be used ...
      ele.style.visibility = "hidden";

      for (var aa in atts)
      {
         ele[aa] = atts[aa];
      }

      return ele;
   }

   // helper function to check is a file can be uploaded, for example
   //
   //   <-- bUploadFoto>
   //      //if (luix.canUploadFile ("uPhoto", 5)) {
   //      //   if (luix.AJAXUploadFile ("uPhoto", "uploadFoto")) {
   //      //      feedback ("uploading file ...");
   //      //   }
   //      //}
   //      //

   function canUploadFile (widname, maxSizeMB, alertEmpty, alertTooBig)
   {
      var ele = htmlElem (widname);
      var fileEle = ele.files[0]; // we only upload 1 file!

      var sizeLimitMB = maxSizeMB;

      if (! fileEle || fileEle === "") {
         if (alertEmpty !== "")
            alert (alertEmpty ? alertEmpty: "Please first choose a file!");
         return false;
      }
      if (sizeLimitMB && sizeLimitMB > 0 && fileEle.size > sizeLimitMB * 1024 * 1024) {
         if (alertTooBig !== "")
            alert (alertTooBig ? alertTooBig: ("File is too big to be uploaded, limit is " + maxSizeMB + " MB"));
         return false;
      }
      return true;
   }

   // --------- START PART AJAX
   //

   // ============ AJAX stuff (AJAX approach V0.90)
   //
   // ------------- packing and unpacking HTTP messages using paramCfg, respFuncOrObj
   //
   //    The method used for all ajax requests is POST so the places to put any information
   //    remains urlstring, querystring (for request), headers and the body itself
   //
   //    in the request:
   //
   //          POST urlstring?querystring HTTP/1.1
   //          Xheader1: valheader1
   //          Xheader2: valheader2
   //
   //          body (raw/html, eva, json, prop-val)
   //
   //    in the response:
   //
   //          HTTP/1.1 200 OK
   //          Xheader1: valheader1
   //          Xheader2: valheader2
   //          Content-Type: text/eva
   //          XParamsInOneLine: querystring
   //
   //          body (raw/html, eva, json, prop-val)
   //
   //    We can put all the information by ourselves using javascript and the data structure
   //    provided by jGastona and consume the response simply reading the http response object directly
   //    or let all be packed and unpacked more conveniently.
   //
   //    --------- Packing data in requests (paramCfg)
   //
   //    We can pack data using the parameter "paramCfg" in two methods AJAXSend and AJAXgetDataForId
   //
   //    The simplest way to use paramCfg is given it as string, then it acts as query string directly
   //
   //          AJAXSend ("myPost?id=1771");
   //          AJAXSend ("myPost", "id=1771");
   //          AJAXgetDataForId ("myId", "extra=yes")
   //
   //    by given it as object we can specify following properties:
   //
   //          property        type      example                  meaning
   //
   //          body            string    "my body"                if given, it is the body to send
   //          params          string    "id=myId&name=MiNombre"  querystring to send
   //          params          object    { id="myId", .. }        the querystring will be formed using encodingUTF8
   //          headers         object    { Xhead1: "hh", ... }    Headers will be send except
   //          bodyVars        array     [ "eTitle", "eDesc" ]    variables to be packed in the body, if not specified or empty
   //                                                             and no body specified then they are all variables!
   //          bodyVarsFormat  string    "eva"                    Format to use for the body: eva is default, json or propval
   //          encodeUTF8      boolean   false                    For using encoding UTF8 in params (object) and bodyVars,
   //                                                             if not explicity set to false it is always true
   //
   //
   //          Example of calls packing variables (data from JAST script and generated by jGastona)
   //
   //             AJAXSend ("myPost");                         // all variables will be packed
   //             AJAXSend ("myPost", "");                     // NO variable at all
   //             AJAXSend ("myPost", { body:"" });            // NO variable at all
   //             AJAXSend ("myPost", { bodyVars: ["one"] });  // only variable "one" will be packed
   //
   //
   //          Example of body packed as "eva"
   //
   //             #data#
   //
   //               <title>  //value of title variable
   //               <source> //a good friend
   //               <code>   //#!/usr/bin/gastona ... (UTF-8 escaped!)
   //
   //          Example of body packed as "json"
   //
   //               { "title": "value of title variable", "source": "a good friend", "code": "..." }
   //
   //          Example of body packed as "propval"
   //
   //               title: value of title variable
   //               source: a good friend
   //               code: #!/usr/bin/gastona ... (UTF-8 escaped!)
   //
   //
   //    --------- Unpacking data from responses (respFuncOrObj)
   //
   //    In following functions we can specify a parameter respFuncOrObj
   //
   //        function AJAXPostRaw    (sendStr, bodyStr, objPOSTHeader, respFuncOrObj)
   //        function AJAXSend       (postString, paramCfg, respFuncOrObj)
   //        function AJAXUploadFile (fileElement, postMsg, postHeaders, respFuncOrObj)
   //
   //    if this parameter is a function then it might take two parameter: body and response object
   //
   //    For example to consume the response by ourselves, we can pass a function like
   //
   //                function processResponse (body, respObj)
   //                {
   //                    processBody (body);
   //                    processHeaders (respObj.getAllResponseHeaders ());
   //                }
   //
   //    If we pass an object, this will be filled with properties result of unpacking
   //    the response as specified below
   //
   //    Two headers has to be set by the server for the proper unpacking "Content-Type" and "XParamInOneLine"
   //
   //    --- unpacking the body
   //
   //    Unpacking body when "Content-Type" contains "text/eva"
   //          The body will be interpreted as an anonymous eva unit and each eva variable will be
   //          converted in a property of type array of array of strings.
   //          Example body:
   //
   //             #data#
   //               <title>   //my title
   //               <list>    "Lunes", "Martes", "Miercoles"
   //               <table>   id  , name
   //                         1811, Evariste
   //                         1777, Carolo
   //          Unpacked object:
   //             {
   //                data:
   //                { title: [["my title"]],
   //                  list: [["Lunes", "Martes", "Miercoles"]],
   //                  table: [["id", "name"], ["1811", "Evariste"], ["1777", "Carolo"]]
   //                }
   //             }
   //
   //    Unpacking body when "Content-Type" contains "text/json"
   //          The body will be interpreted as an JSON object and will be unpacked using JSON.parse(bodytxt)
   //
   //    If no Conten-Type or any of the two above are found a new property "rawBody" containing
   //    the whole body as string will be created
   //
   //    --- unpacking XParamInOneLine
   //
   //    If the server sets the header XParamInOneLine then it will be interpreted as a query string type of variables
   //    that is
   //            variable=value&variable2=value2...
   //
   //    each variable-value will be set as a property-value in the response object
   //
   //    --- unpacking all headers
   //
   //    All headers will be set in the response object having the property name "header:"headerName
   //          Example headers:
   //               XMyheader : "etc"
   //               Content-Type: text/eva
   //               ...
   //
   //          { "header:XMyheader" : "etc", "header:Content-Type": "text/eva", .. }
   //
   //    --------- How to initialize and use the response object
   //
   //    While passing an object as response, it is important to notice that the properties of the unpacking
   //    process are going to be added but the object is not going to be cleared previosly, so it has to be
   //    done before the request in order not to take into account possible old response properties!
   //
   //          myResp2AHA = {},
   //          AJAXSend ("AHA", "", myResp2AHA);
   //
   //    Passing respFuncOrObj as functions, this code accomplish the same
   //
   //          myResp2AHA = {},
   //          AJAXSend ("AHA", "",
   //                      function (body, resObj) {
   //                          Object.assign (myResp2AHA, httUnpack (resObj.responseText, resObj));
   //                      });
   //
   //

   function jaxGetHttpReq ()
   {
      if (window.XMLHttpRequest)
         return new XMLHttpRequest ();
      else if (window.ActiveXObject)
         return new ActiveXObject("Microsoft.XMLHTTP");

      alert("Your browser does not support AJAX!");
   }

   function ajaxGenericPreProcessResponse (httresp)
   {
      //
   }

   //  (parameters: response body, response object)
   //
   //
   //  Example


   //  Send a general request using given method, url, body and headers
   //
   //     Example:
   //          AJAXAnyMethodRaw ("OPENSESAME", "myPost/etc?par=nothing", "this is my body", { "XHeader-A": "167", XHeader2: "Maria" });
   //
   //  If a response from the server has to be handled, the fourth parameter respFuncOrObj
   //  can be used (see respFuncOrObj responses)
   //
   function AJAXAnyMethodRaw (method, sendStr, bodyStr, objHeader, respFuncOrObj)
   {
      var httpero = jaxGetHttpReq ();
      if (!httpero) return false;

      // get the Method url minus parameters or query part, e.g. "POST blah" from "POST blah?name=Salma"
      var postTitle = sendStr.substring(0, sendStr.indexOf('?'));
      if (postTitle.length == 0)
         postTitle = sendStr;

      // add callback
      httpero.onreadystatechange = function () {
         if (httpero.readyState == 4 && httpero.status == 200) {
            ajaxGenericPreProcessResponse (httpero);

            if (typeof respFuncOrObj === "function") {
               // just call the function
               respFuncOrObj (httpero.responseText, httpero);
            }
            else if (typeof respFuncOrObj == "object") {
               // merge the unpack object of the response into the given object
               Object.assign (respFuncOrObj, httUnpack (httpero.responseText, httpero));
            }
            mensaka (AJAX_RESPONSE_MESSAGE + " " + postTitle);
         }
      }

      httpero.open (method, sendStr, true);

      if (objHeader) {
         for (var indx in objHeader)
            httpero.setRequestHeader(indx, objHeader[indx]);
      }

      httpero.send (bodyStr||"");
   }

   //  Send a general POST using given url, body and headers
   //
   //     Example:
   //          AJAXPostRaw ("myPost/et?par=nothing", "this is my body", { XHeader-A: 167, XHeader2: "Maria" });
   //
   //  If a response from the server has to be handled, the fourth parameter respFuncOrObj
   //  can be used (see respFuncOrObj responses)
   //
   function AJAXPostRaw (sendStr, bodyStr, objPOSTHeader, respFuncOrObj)
   {
      return AJAXAnyMethodRaw ("POST", sendStr, bodyStr, objPOSTHeader, respFuncOrObj);
   }

   //  Send a POST using given url, paramCfg and respFuncOrObj (see packing and unpacking HTTP messages with paramCfg and respFuncOrObj)
   //
   //     Example:
   //          AJAXPostRaw ("myPost/et?par=nothing", "this is my body", { XHeader-A: 167, XHeader2: "Maria" });
   //
   //  If a response from the server has to be handled, the fourth parameter respFuncOrObj
   //  can be used (see respFuncOrObj responses)
   //
   function AJAXSend (postString, paramCfg, respFuncOrObj)
   {
      var poso = httPack (paramCfg, dataUnit);
      AJAXPostRaw (postString + "?" + poso.onelineparams,
                poso.body,
                poso.headers,
                respFuncOrObj);
   }

   function AJAXUploadFile (fileElement, postMsg, postHeaders, respFuncOrObj)
   {
      if (!fileElement) return false;
      var fileEle = htmlElem (fileElement);

      var file1 = fileEle.files[0];
      if (! file1 || file1 === "") return false;

      var formo = new FormData ();
      formo.append ("filename", file1); // we add it but actually the mico server don't read it!

      AJAXPostRaw (postMsg + "?fileName=" + file1, formo, postHeaders, respFuncOrObj);
      return true;
   }

   function AJAXLoadRootJast (jastName, placeId)
   {
      AJAXPostRaw ("loadRootJast?jastName=" + jastName,
                   "",     // body
                   null,   // headers
                           // callback
                   function (txt) {
                      loadJast (evaFileStr2obj (txt), placeId);
                   }
                  );
   }

   // depending on the type of the second parameter there are two possible syntaxes:
   //
   //    //1 using the one line parameters
   //    AJAXgetDataForId ("myTextArea", "source=content.txt&fromLine=166&toLine=200");
   //
   //    //2 passing more headers
   //    AJAXgetDataForId ("myTextArea", { "ajaxREQ-id": "myTextArea", "theFile": "content.txt" });
   //
   //    if multiple is true then the server will send additional id:value pairs using the format
   //          id1:value
   //          id2:value
   //          :
   //          mainid value
   //
   //    if onlyhtml is true, only the html element will be updated
   //    and the data will not be set in "data" unit. This is convenient for not
   //    duplication in case of big contents. This flag only affects the main id,
   //    multiple ids will be updated using setData always.
   //
   function AJAXgetDataForId (idname, paramCfg, multiple, onlyhtml)
   {
      var poso = httPack (paramCfg, dataUnit);
      AJAXPostRaw ("getDataForId?" + "id=" + idname + "&" + poso.onelineparams,
                    poso.body,
                    poso.headers,
                    function (txt) {
                       setContentsFromBody (idname, txt, multiple, onlyhtml);
                       // AJAXAnyMethodRaw already sends the message "ajaxResponse getDataForId"
                       // here we trigger the extra message "ajaxResponse getDataForId myId"
                       // to allow reacting to the setting of a particular id
                       //
                       mensaka (AJAX_RESPONSE_MESSAGE + " getDataForId " + idname);
                    }
                );
   }

   function setContentsFromBody (idname, bodystr, multiple, onlyhtml)
   {
      var mainbody = multiple ? "": bodystr;
      if (multiple)
      {
         // format body = sub-header sub-body
         //
         // subhead1:val1
         // subhead2:val2
         // :---body
         // subbody

         var textArr = str2lineArray (bodystr);

         var hh = 0;
         while (hh < textArr.length)
         {
            var strlin = textArr[hh ++];
            if (!strlin) break;

            var idval = /([^:]*):(.*)/.exec (strlin);
            // console.log ("multi set " + idval[1] + " [" + idval[2] + "]");
            setData (idval[1], idval[2]);
         }
         mainbody = textArr.slice(hh).join ("\n");
      }

      if (onlyhtml)
      {
         var ele = document.getElementById (idname);
         if (ele)
            setValueToElement (ele, mainbody);
      }
      else setData (idname, mainbody);
   }
}
